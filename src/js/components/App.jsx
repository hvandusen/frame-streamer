import React, { Component, useState, useEffect, useRef } from "react";
import axios from 'axios';

import slugify from 'slugify';
import imagesLoaded from 'imagesloaded';
let imgLoad;

function isEmptyObject(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

function wordValid(word){
  return word.urls && word.urls.length > 0
}

const App = () => {
  // Declare a new state variable, which we'll call "count"
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(0);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  if(words.length === 0){
    console.log("no words")
    queueImages();
  }

  function queueImages(){
    axios.get(`/json`).then(res => {
      if(isEmptyObject(res.data)){
        console.log("apparently empty")
        return
      }
      let newWords = res.data;
      newWords = newWords.map(word => {
        word.urls = word.urls.filter(url => url.indexOf(" ")<0);
        return word;
      })
      console.log('/json saved as newWords: ',newWords)
      newWords.forEach(function(element) { element.ready = false; });
      setWords(words.concat(newWords));
    });
  }
  useInterval(() => {
    if(!words.length || !words[currentWord].urls)
      return
    //not  really a  good check  assumes  if  theres  anything there we're  good
    console.log("count: ",count,", current: "+currentWord+", current urls length: ",words[currentWord] )
    //advance words
    if(words[currentWord].urls.length === count+1){
      setCount(0);
      setCurrentWord(currentWord+1);
    }
    else {
      setCount(count+1);
    }
    if (currentWord === words.length-1 && count === 0) {
      console.log("queueing images")
      queueImages();
    }
  }, 1000)

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  const  slug = (word) => slugify(word.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''));
  useEffect(() => {
    if(!words[currentWord] || !words[currentWord].urls)
      return
    console.log("effect used")
    words.map(function(word){
      const theClassName = "."+slug(word.word)+" .slide";
      imagesLoaded("."+slug(word.word)+" .slide",{background:true})
      .on("progress",function(instance,image){
          if(!image.isLoaded)
            console.log("failure!!",image)
      }).on("always",function(i,e){

      }).on("done",function(){
        console.log("shits done")
        setReady(true);
      });
    });
  },[words]);
  console.log("rendering")
  return (
    <div className="yah">
      <div key={0}>count: {count} currentWord: {currentWord}</div>
      { ready ? words.filter(wordValid).map( (e,i)  => {
        return <div key={i+1} className={(i === currentWord ? "current " : " ")+slug(e.word)+" word testing"}>
          { e.urls && e.urls.map((url,j)  => {
            let slideClass = i === currentWord && j === count ? "active " : "";
            slideClass += (i <= currentWord || j < count ? "used" : "");
            // console.log("added word: ",e,", url: ",url)
            return <div className={"slide "+slideClass} key={j} style={{backgroundImage: "url("+url+")"}}></div>
          })}
          </div>
      }) : <div key={1}>"Loading :)"</div>}
    </div>
  );
}

export default App;
