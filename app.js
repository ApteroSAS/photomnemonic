const lambda = require("./index");
const express = require("express");
const { Buffer } = require("buffer");

const app = express();

app.get("/_health", (req, res) => {
  res.send("1");
});

app.get("/screenshot", (req, res) => {
  console.log(req.query);
  (async () => {
    try {
      await lambda.handler(
        { queryStringParameters: req.query },
        null,
        async (something, callback) => {
          console.log("callback status: ", callback.statusCode);
          if (callback.isBase64Encoded) {
            callback.body = Buffer.from(callback.body, "base64");
          }
          res
            .status(callback.statusCode)
            .header(callback.headers)
            .send(callback.body);
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json(e);
    }
  })();
});

app.listen(5000, () => {
  console.log("listening on :5000");
});
