const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3002;// === "production" ? 80 : 3002;
const fs = require("fs")
const Scheduler = require("./Scheduler.js");

let scheduler = new Scheduler();
scheduler.start()

app.use('/', express.static("app/build"));

app.get("/json/:timestamp", (req, res) => {
  console.log("out param is ",req.params)
  var timestamp = req.params.timestamp ? req.params.timestamp : "";
  console.log("current schedule: ",scheduler.currentSchedule())
    res.json(scheduler.currentSchedule(timestamp))
})

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "app/build", "index.html"));
});


app.listen(port, () => console.log(`listening on port ${port}!`))
