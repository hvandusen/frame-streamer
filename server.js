const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3002;// === "production" ? 80 : 3002;
const fs = require("fs")
const stream = require("./Stream.js");
const spawn = require("child_process").spawn;
// const pythonProcess = spawn("python",["script.py"])
let wordLinks = [];
let  words = "";
let pythonProcess;
let totalWordListSize = 0;
function getUrlsFromWord(word){
  return new Promise((resolve,reject) =>  {
    pythonProcess = spawn("sh",["-c",'python script.py '+word+' | grep -o "http.*$"'])
    pythonProcess.stdout.on('data', data => {
      resolve(data.toString().split("https").join("https"))
      console.log("got  data for "+word)
    });
    pythonProcess.stderr.on('data', data => {
      reject(data.toString())
    });
  });
}
var addedWords = [];

const isValidUrl = (e) => {
  console.log("herei s e",e)
  return e.indexOf("https://www.facebook.com")<0
  && e !== "";
}

let getWords = (count=10) => stream(count).then(newWords => {
  wordLinks  = [];
  let googleSearches = newWords.map((newWord,i) => {
    wordLinks.push({word: newWord})
    return getUrlsFromWord(newWord)
  })
  Promise.all(googleSearches).then( wordSearches => {
    console.log("RESOLVED!!!")
    for(i in wordSearches){
      let urls = wordSearches[i];
      wordLinks[i].urls = urls.split("\n").filter( e => e.length>0);
    };
    // wordLinks = addedWords;
    // addedWords = [];
  })
});

getWords();

// setInterval(getWords,100000)

app.use('/', express.static("dist"));

app.get("/json", (req, res) => {
  res.send(wordLinks)
  getWords();
  console.log(wordLinks)
})

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// app.get("/", (req, res) => {
  // res.sendFile(path.resolve(__dirname, "dist", "index.html"));
// })

// app.get("*", (req, res) => {
//
// });

app.listen(port, () => console.log(`listening on port ${port}!`))
