//https://www.npmjs.com/package/google-images
const GoogleImages = require('google-images');
const client = new GoogleImages(process.env.GOOGLE_CSE_ID,process.env.GOOGLE_API_KEY);

function search(word,delay){
        return client.search(word)
}

module.exports = search
