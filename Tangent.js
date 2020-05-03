var utils = require("./Utils")
var wnClass = require("node-wordnet");
var fs = require("fs")
var wn = new wnClass();
var words = fs.readFileSync('words.txt', "utf8").split('\n');

function extractGoodWords(string){
  if(!string)
    return []
  var choices = string.split(" ");
  choices = choices.filter((w)=>{
    return w.length>3 && ["of","a","to","from","the","for","with","because","than","anything"].indexOf(w)<0;
  });
  return choices.dedup()
}

class Tangent {
  constructor() {
    this.searchTerm = words.random()
    this.history = [this.searchTerm]
  }
  async search(len=60){
    let results = [this.history.last()]
    while(results.length<len){
      if(results.length === 0)
        results = [this.searchTerm]
      results.push(await this.relatedWord(results.last()))
      results = results.dedup()
      !!results.last() ? null : results = results.slice(0,results.length-2)
    }
    this.searchTerm = results.last()
    this.history = this.history.concat(results.slice(1))
    console.log(this.history)
    return results
  }
  async relatedWord(word){
    var search = await wn.lookupAsync(word);
    var allRelated = []
    var tangents = search
    return this.getWordsFromSearch(search).random()
  }
  getWordsFromSearch(entries){
    var words = []
    entries.map(function(entry){
      words.push(entry.lemma)
      words = words.concat(entry.synonyms)
      .concat(extractGoodWords(entry.def))
      .concat(extractGoodWords(entry.gloss));
    })
    return words.map(e => e.stripPunctuation()).sort().dedup()
  }
}

module.exports = Tangent;
