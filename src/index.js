import axios from 'axios'
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var imgs = []
var current = 0;
var interval = 30000;
var timestamp = ""

function getCanvasImgs(){
  let response = axios.get('/json'+timestamp).then(function(resp){
    console.log(resp.data)
    interval = resp.data.interval
    let allImages = resp.data.images.reduce(function(a,b){return a.concat(b)})
    timestamp = "/"+resp.data.start_time
    imgs = imgs.concat(allImages)
    setTimeout(getCanvasImgs,interval*allImages.length)
  })
}

getCanvasImgs()

setInterval(function(){
  if(!imgs.length)
    return
  var img = new Image();
  img.src = imgs[(current++)%imgs.length].url;
  img.onload = function() {
     context.drawImage(img, 0, 0);
  };
},10000)
