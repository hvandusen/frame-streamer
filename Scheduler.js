const Tangent = require("./Tangent.js")
const imageSearch = require('./imageSearch.js');

//lets just leave these hard coded for now brah
const IMAGE_INTERVAL = 5000 // 10 seconds between imageSearch
const IMAGES_PER_WORD = 3 // 6 images, so 1 minute per word
const WORDS_AT_A_TIME = 5 // Hour per query
const QUERY_INTERVAL = IMAGE_INTERVAL*IMAGES_PER_WORD*WORDS_AT_A_TIME
const resolveAfter = ms => new Promise(ok => setTimeout(ok, ms));

class Scheduler {
  constructor(opt) {
    this.startTime = Date.now()
    this.queue = []
    this.count = 0
  }
  nextSchedule(){
    return this.queue[1]
  }
  currentSchedule(timestamp){
    if(this.queue.length===0)
      return "Not ready yet"
    //if this set is no longer needed
    if(this.queue[0].start_time === timestamp)
      return this.queue[1]
    if(Date.now()>this.queue[0].start_time+QUERY_INTERVAL)
      this.queue = this.queue.slice(1)
    return this.queue[0]
  }
  async start(opts){
    this.startTime = Date.now()
    this.tangent = new Tangent()
    await this.enqueue()
    await this.enqueue()
    const properEnqueue = this.enqueue.bind(this)
    setInterval(properEnqueue,QUERY_INTERVAL)
  }
  async enqueue(){
    console.log("beginning to queue")
    let terms = await this.tangent.search(WORDS_AT_A_TIME)
    let images = await this.queryImages(terms)
    images = images.map((imgs) => imgs.slice(0,IMAGES_PER_WORD))
    console.log("Images finished for queue slot ",this.count)
    this.queue.push({
      images: images,
      index: this.count,
      start_time: this.startTime+ (QUERY_INTERVAL*this.count++),
      interval: IMAGE_INTERVAL
    })
    console.log("queue: ",this.queue.length," items")
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

module.exports = Scheduler
