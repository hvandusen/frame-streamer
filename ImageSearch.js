//https://www.npmjs.com/package/google-images
const GoogleImages = require('google-images');
//const client = new GoogleImages(process.env.GOOGLE_CSE_ID,process.env.GOOGLE_API_KEY);
const client = new GoogleImages(process.env.GOOGLE_CSE_ID,process.env.GOOGLE_API_KEY);
function search(word){
    const opts = {
      start: Math.floor(Math.random()*100)
    }
    return client.search(word,opts)
}
module.exports = search
