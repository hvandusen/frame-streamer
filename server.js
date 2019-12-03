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
let pythonProcess;
let totalWordListSize = 0;

function validWord(word){
  return word.length>0 && (word.toLowerCase().indexOf("png")>-1 || word.toLowerCase().indexOf("jpg")>-1 ||
  word.toLowerCase().indexOf("jpeg")>-1)
}

function getUrlsFromWord(word){
  return new Promise((resolve,reject) =>  {
    let timeout = setTimeout(function(){
      console.log(word+ " timed out!!!!!!")
      resolve("timed out")
    },15000);
    pythonProcess = spawn("sh",["-c",'python script.py '+word+' | grep -o "http.*$"'])
    pythonProcess.stdout.on('data', data => {
      resolve(data.toString().split("https").join("https"))
      console.log("got  data for "+word)
      clearTimeout(timeout)
    });
    pythonProcess.stderr.on('data', data => {
      resolve(data.toString())
      console.log(word+" errored out!!!!!!")
      clearTimeout(timeout)
    });
  });
}
var addedWords = [];

const isValidUrl = (e) => {
  console.log("herei s e",e)
  return e.indexOf("https://www.facebook.com")<0
  && e !== "";
}

let getWords = (startingWord=null,count=10) => stream(startingWord,count).then(newWords => {
  // wordLinks  = [];
  console.log("uh",newWords)
  let offset = wordLinks.length
  let googleSearches = newWords.map((newWord,i) => {
    wordLinks.push({word: newWord})
    getUrlsFromWord(newWord).then( wordSearch => {
      let urls = wordSearch.split("\n").filter(validWord);
      // console.log("urls length for ",newWord,": ",urls)
      wordLinks[offset+i].urls =  [...urls]
      // wordLinks[i].urls = urls.split("\n").filter(validWord);
    })
  })
});

getWords("pig");
setInterval(() => {
  getWords(wordLinks[wordLinks.length-1].word)
},30000)
// setInterval(getWords,100000)

app.use('/', express.static("app/build"));

app.get("/json", (req, res) => {
  wordLinks = wordLinks.filter( word => word.urls && word.urls.length)
  if(req.query && req.query.offset){
    console.log("got query "+req.query.offset)
    res.send(wordLinks.slice(wordLinks.findIndex((item) => item.word === req.query.offset)+1,25))
  } else{
    res.send(wordLinks.slice(0,25))
  }
  console.log(wordLinks.map( word => word.word))
})

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "app/build", "index.html"));
});


app.listen(port, () => console.log(`listening on port ${port}!`))
