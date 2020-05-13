const Tangent = require("./Tangent.js")
const imageSearch = require('./ImageSearch.js');

//lets just leave these hard coded for now brah
const IMAGE_INTERVAL = 88000
const IMAGES_PER_WORD = 10
const WORDS_AT_A_TIME = 10
const QUERY_INTERVAL = IMAGE_INTERVAL*IMAGES_PER_WORD*WORDS_AT_A_TIME
const GOOGLE_API_DELAY = 1500
const resolveAfter = ms => new Promise(ok => setTimeout(ok, ms));
const v = true
let loadImagesInterval
let popInterval

class ImageQueue {
  constructor(opt) {
    this.startTime = Date.now()
    this.queue = []
    this.verbose = true;
    this.active = false
    this.paused = false
  }
  async start(opts){
    if(this.active)
      return
    this.active = true
    this.startTime = Date.now()
    this.tangent = this.paused ? this.tangent : new Tangent()
    await this.enqueue()
    //add to list periodically
    let that = this
    setTimeout(this.enqueue.bind(this),QUERY_INTERVAL/2)
    loadImagesInterval = setInterval(function(context){
      context.enqueue()
    },QUERY_INTERVAL,that)
    //remove first element at image interval
    popInterval = setInterval(this.remove.bind(this),IMAGE_INTERVAL)
    this.paused = false
  }
  isActive(){
    return this.active
  }
  pause(){
    if(!this.active)
      return
    clearInterval(loadImagesInterval)
    clearInterval(popInterval)
    this.active = false
    this.pause = true
  }
  stop(){
    if(!this.active)
      return
    clearInterval(loadImagesInterval)
    clearInterval(popInterval)
    this.active = false
    this.queue = []
    this.paused = true
  }
  get(){
    let payload = {
      //we are using FIFO so first is last
      images: this.queue.slice().reverse().slice(),
      deliveryTime: Date.now(),
      interval: IMAGE_INTERVAL
    }
    return payload
  }
  async enqueue(){
    let images
    this.print("images ...")
    let terms = await this.tangent.search(WORDS_AT_A_TIME)
    console.log("new terms: ",terms.join(", "))
    try {
      images = await this.queryImages(terms.slice().reverse())
      images = images.map((imgs) => imgs.slice(0,IMAGES_PER_WORD))
      images = Array.prototype.concat.apply([],images)
      Array.prototype.unshift.apply(this.queue,images)
      // console.log("added ",images.length+" images.\n"+this.queue.length+" total.")
    } catch (e) {
      console.log(e.toString())
    }
    this.print("images +")
  }
  print(addon=""){
    var len = this.queue.length
    var str = this.queue.map(function(e,i){
      return  i > len - (len%IMAGES_PER_WORD) ? "-" : ""+ (i % IMAGES_PER_WORD === 0 ? (i/IMAGES_PER_WORD) : "")
    }).join("") + " "+ addon
    console.log(str)
  }
  remove(){
    this.queue.pop()
    this.print()
  }
  async queryImages(terms){
    const slowFetch = rateLimit1(imageSearch, 1500);
    return Promise.all(terms.map(u => slowFetch(u)))
  }
}
function rateLimit1(fn, msPerOp) {
  let wait = Promise.resolve();
  return (...a) => {
    const res = wait.then(() => fn(...a));
    wait = wait.then(() => resolveAfter(msPerOp));
    return res;
  };
}

module.exports = ImageQueue
