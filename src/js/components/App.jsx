import React, { Component, useState, useEffect, useRef } from "react";
import axios from 'axios';

import slugify from 'slugify';
import imagesLoaded from 'imagesloaded';
let imgLoad;
const App = () => {
  // Declare a new state variable, which we'll call "count"
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(0);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  if(words.length === 0)
    queueImages();

  function queueImages(){
    axios.get(`/json`).then(res => {
      const newWords = res.data;
      console.log(newWords)
      newWords.forEach(function(element) { element.ready = false; });
      setWords(words.concat(newWords));
    });
  }
  useInterval(() => {
    //not  really a  good check  assumes  if  theres  anything there we're  good
    console.log(words[currentWord].urls.length , count+1)
    //advance words
    if(words[currentWord].urls.length === count+1){
      setCount(0)
      setCurrentWord(currentWord+1)
    }
    else {
      setCount(count+1);
    }
    if (currentWord === words.length-1 && count === 0) {
      queueImages();
    }
  }, 5000)
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
    // Update the document title using the browser API
    console.log("effect used")
    words.map(function(word){
      const theClassName = "."+slug(word.word)+" .slide";
      imagesLoaded("."+slug(word.word)+" .slide",{background:true})
      .on("progress",function(instance,image){
          if(!image.isLoaded)
            console.log("failure!!",image)
      }).on("always",function(i,e){
        setReady(true);
      });
    });
  },[words]);

  return (
    <div className={count+" yah"}>
      { ready ? words.map( (e,i)  => {
        return <div key={i} className={(i === currentWord ? "current " : " ")+slug(e.word)+" word"}>
          {e.urls.map((url,j)  => {
            let slideClass = i === currentWord && j === count ? "active " : "";
            slideClass += (j < count ? "used" : "");
            return <div className={"slide "+slideClass} key={j} style={{backgroundImage: "url("+url+")"}}></div>
          })}
          </div>
      }) : "Loading :)"}
    </div>
  );
}

export default App;
