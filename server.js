const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3002;// === "production" ? 80 : 3002;
const fs = require("fs")
const stream = require("./Stream.js");
const spawn = require("child_process").spawn;
const pythonProcess = spawn("python",["script.py"])
let  words = "";
pythonProcess.stdout.on('data', data => {
  words += data
});
const getWords =  () => stream().then(e => words += e.join(", "));

getWords() ;

app.get("*", (req, res) => {
  res.send(words)
  getWords();
})

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "build", "index.html"));
// });

app.listen(port, () => console.log(`listening on port ${port}!`))
