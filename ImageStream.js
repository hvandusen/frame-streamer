const Tangent = require("./Tangent.js")
const imageSearch = require('./ImageSearch.js');

//lets just leave these hard coded for now brah
const IMAGE_INTERVAL = 12000
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
  }
  async start(opts){
    if(this.active)
      return
    this.active = true
    this.startTime = Date.now()
    this.tangent = new Tangent()
    await this.enqueue()
    //add to list periodically
    let that = this
    setTimeout(this.enqueue.bind(this),QUERY_INTERVAL/2)
    loadImagesInterval = setInterval(function(context){
      context.enqueue()
    },QUERY_INTERVAL,that)
    //remove first element at image interval
    popInterval = setInterval(this.remove.bind(this),IMAGE_INTERVAL)
  }
  isActive(){
    return this.active
  }
  stop(){
    if(!this.active)
      return
    clearInterval(loadImagesInterval)
    clearInterval(popInterval)
    this.active = false
    this.queue = []
  }
  get(){
    return {
      //we are using FIFO so first is last
      images: this.queue.slice().reverse().slice(),
      deliveryTime: Date.now(),
      interval: IMAGE_INTERVAL
    }
  }
  async enqueue(){
    let images
    console.log("beginning to queue")
    let terms = await this.tangent.search(WORDS_AT_A_TIME)
    console.log("new terms: ",terms)
    try {
      images = await this.queryImages(terms.slice().reverse())
      images = images.map((imgs) => imgs.slice(0,IMAGES_PER_WORD))
      images = Array.prototype.concat.apply([],images)
      Array.prototype.unshift.apply(this.queue,images)
      // console.log("added ",images.length+" images.\n"+this.queue.length+" total.")
      this.print(" added")
    } catch (e) {
      console.log(e.toString())
    }
    console.log("images finished")
  }
  print(addon=""){
    var str = this.queue.map(function(e,i){
      //console.log(i,e)
      return "-"+ (i % IMAGES_PER_WORD === 0 ? (i/IMAGES_PER_WORD) : "")
    }).join("") + addon
    console.log(str)
  }
  remove(){
    this.queue.pop()
    this.print(" popped")
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
