import axios from 'axios'
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var images = []
var current = 0;
var interval = 3000;
var count = 0;
var getImagesTimeout;
var history = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

getCanvasImgs()
updateCanvas()

function getCanvasImgs(){
  let response = axios.get('/json').then(function(resp){
    let newImages = resp.data.images
    console.log("got data",resp.data)
    interval = resp.data.interval
    images = images.concat(newImages)
    .filter((img,i,self) => {
       return self.findIndex(function(el){
         return (el.url === img.url)
       }) === i
    })
    console.log("loaded ",newImages.length,", "+images.length+ " images")
    if(0 === count++){
      console.log(images[0])
    }
    getImagesTimeout = setTimeout(getCanvasImgs,newImages.length ? interval*newImages.length : interval)
  })
}

function updateCanvas(){
  setTimeout(function(){
    if(!images.length)
      return
    var img = new Image();
    if(current>=images.length)
      current--
    img.src = images[current++].url;
    console.log("current image: ",current-1," total images: ",images.length)
    img.onload = function() {
       fitImageToCanvas(context,img)
    };
    updateCanvas()
  },interval ? interval : 5000)
}


function fitImageToCanvas(ctx, img) {
    var i = {
      w : img.width,
      h : img.height,
      r: img.width/ img.height
    }, c= {
      w: canvas.width,
      h: canvas.height,
      r: canvas.width/ canvas.height
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(i.r < c.r){ //Image taller than canvas?
      ctx.drawImage(img, (c.w-(c.h*i.r))/2, 0, c.h*i.r, c.h);
    } else {
      ctx.drawImage(img, 0, (c.h-(c.w/i.r))/2, c.w, c.w/i.r);
    }
}
