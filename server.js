const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3002;// === "production" ? 80 : 3002;
const fs = require("fs")
const ImageStream = require("./ImageStream.js");

let images = new ImageStream();
images.start()

app.use('/', express.static("app/build"));

app.get("/json", (req, res) => {
  let schedule = images.get()
  console.log("current schedule: ",schedule.images.length," items.")
  res.json(schedule)
})

app.get("/stop", (req, res) => {
  images.stop()
  res.redirect('/')
})

app.get("/pause", (req, res) => {
  // images.stop()
  res.redirect('/')
})

app.get("/start", (req, res) => {
  images.start()
  res.redirect('/')
})

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "app/build", "index.html"));
});


app.listen(port, () => console.log(`listening on port ${port}!`))
