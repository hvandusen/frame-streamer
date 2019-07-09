const wiki = require('wikijs').default;

async function wikiStream(total=20){
  let wordsFound = [];
  async function stream(count,base='dog'){
    if(count <= 0){
      return;
    }
    //page query
    let page = await wiki().page(base);
    return page.links().then(links => {
      console.log(base+": "+links.length)
      let next = links[Math.floor(Math.random()*links.length)];
      wordsFound.push(next);
      return stream(count-1,next)
      .catch (e => {
        console.log("Page not found.");
        next = links[Math.floor(Math.random()*links.length)];
        wordsFound.pop();
        wordsFound.push(next);
        return stream(count-1,next);
      });
    })
    return base;
  }
  let out = await stream(total);
  return wordsFound;
}

module.exports = wikiStream;
