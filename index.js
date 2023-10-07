/* prettier-ignore-file */
const { urlAllowed, GetBrowser,CloseBrowser } = require("./utils");

let t0;

function sleep(miliseconds = 100) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function screenshot(url) {
  let data, meta;
  let loaded = false;

  console.log("screenshot, url: ", url)

  t0 = new Date().getTime()
  // eslint-disable-next-line no-unused-vars
  const loading = async (startTime = Date.now()) => {
    if (!loaded && Date.now() - startTime < 12 * 1000) {
      await sleep(100);
      await loading(startTime);
    }
  };

  const browser = await GetBrowser()
  console.log("GetBrowser -- @: ", new Date().getTime()-t0, "ms")

  const page = await browser.newPage();
  // console.log("browser.newPage() -- @: ", new Date().getTime()-t0, "ms")

  await page.goto(url,{
    waitUntil: 'networkidle0', // wait until no new network connections for at least 500ms
    timeout: 20000 // adding timeout of 20 seconds
  });
  const pageTitle = await page.title();
  await sleep(1000);//wait for a second network load (lazy loaded page after dom loaded)
  page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }), // wait for 250ms of no network traffic
  console.log( "pageTitle: ",pageTitle, ", @: ", new Date().getTime()-t0, "ms")
  for (let i = 0; i < 20; i++) {
    try{
      data = await page.screenshot({ encoding: "base64" });
      // console.log( "screenshot @: ", new Date().getTime()-t0, "ms")
      return {data,meta};
    }
    catch (e){
      console.log(e)
    } 
    await sleep(500)   
    }

  console.log("Error failed to produce screenshot")
  return
}

module.exports.handler = async function handler(event, context, callback) {


  t0 = new Date().getTime()

  const queryStringParameters = event.queryStringParameters || {};
  const { url = "https://www.mozilla.org"} =
    queryStringParameters;

  if (!(await urlAllowed(url))) {
    return callback(null, { statusCode: 403, body: "forbidden" });
  }

  let data;

  const headers = {
    "Content-Type": "image/png"
  };

  try {
    const result = await screenshot(url);
    // console.log( "screenshot(url) took: ", new Date().getTime()-t0, "ms")
    
    data = result.data;
    console.log( "data.length: ", data.length)

    // if (result.meta) {
    //   headers["X-Photomnemonic-Meta"] = JSON.stringify(result.meta);
    // }
  } catch (error) {
    console.error("Error capturing screenshot for", url, error);
    return callback(error);
  }

  if (process.env.AWS_LAMBDA_FUNCTION_NAME != "turkey"){
    CloseBrowser()
  }

  console.log("done @", new Date().getTime()-t0, "ms")
  return callback(null, {
    statusCode: 200,
    body: data,
    isBase64Encoded: true,
    headers
  });
};
