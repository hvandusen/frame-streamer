const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3002;// === "production" ? 80 : 3002;
const fs = require("fs")
const stream = require("./Stream.js");

app.get("*", (req, res) => {
  stream().then(res.send)
})

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "build", "index.html"));
// });

app.listen(port, () => console.log(`listening on port ${port}!`))
