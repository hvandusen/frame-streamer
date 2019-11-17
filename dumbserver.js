const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3002;// === "production" ? 80 : 3002;
const fs = require("fs")
const stream = require("./Stream.js");
const wikiStream = require("./WikiStream.js");
const spawn = require("child_process").spawn;
// const pythonProcess = spawn("python",["script.py"])
let wordLinks = [];
let  words = "";
let pythonProcess;
let totalWordListSize = 0;
let officialWords = [];

function getUrlsFromWord(word){
  return new Promise((resolve,reject) =>  {
    pythonProcess = spawn("sh",["-c",'python script.py '+word+' | grep -o "http.*$"'])
    pythonProcess.stdout.on('data', data => {
      console.log("finished getUrlsFromWord: "+word)
      resolve(data.toString().split("https").join("https"))
      // pythonProcess.close()
    });
    pythonProcess.stderr.on('data', data => {
      console.log("Python URL finder failed ")
      reject(data.toString())
    });
  });
}

var addedWords = [];
const isValidUrl = (e) => {
  console.log("here is e",e)
  return e.indexOf("https://www.facebook.com")<0
  && e !== "";
}

let getWords = (count=5) => stream(count).then(newWords => {
  wordLinks  = [];
  console.log("queueuing "+newWords)
  let googleSearches = newWords.map((newWord,i) => {
    wordLinks.push({word: newWord})
    return getUrlsFromWord(newWord)
  });
  Promise.all(googleSearches).then( wordSearches => {
    console.log("googleSearches have completed!!!")
    for(var i in wordSearches){
      let urls = wordSearches[i];
      wordLinks[i].urls = [...urls.split("\n").filter( e => e.length>0)];
    }
    
    console.log("wl: ",wordLinks)
    officialWords = wordLinks
  });
});

getWords();
setInterval(getWords,30000);

app.use('/', express.static("app/build"));

app.get("/json", (req, res) => {
  var ready = officialWords.length
  console.log(officialWords)
  if(officialWords.length)
    res.send(officialWords)
  else {
    res.send({})
  }
})

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "app/build", "index.html"));
});

// app.get("/", (req, res) => {
  // res.sendFile(path.resolve(__dirname, "dist", "index.html"));
// })

// app.get("*", (req, res) => {
//
// });

app.listen(port, () => console.log(`listening on port ${port}!`))
