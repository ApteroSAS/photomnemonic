const lambda = require("./index");
const express = require("express");
const { Buffer } = require("buffer");

const app = express();

app.get("/_health", function (req, res) {
  res.send("1");
});

app.get("/screenshot", function (req, res) {
  console.log(req.query);

  lambda.handler(
    { queryStringParameters: req.query },
    null,
    async function (something, callback) {
      console.log("callback: ", callback);
      if (callback.isBase64Encoded) {
        callback.body = Buffer.from(callback.body, "base64");
      }
      res
        .status(callback.statusCode)
        .header(callback.headers)
        .send(callback.body);
    }
  );
});

app.listen(5000, function () {
  console.log("listening on :5000");
});
