import axios from 'axios'
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var images = []
var current = 0;
var interval = 3000;
var count = 0;
var getImagesTimeout;
var history = [];

getCanvasImgs()
updateCanvas()

function getCanvasImgs(){
  let response = axios.get('/json').then(function(resp){
    let newImages = resp.data.images
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


function fitImageToCanvas(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}
