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
    return w.length>3 && ["of","a","to","from","the","for","with","because","than","anything","shes","hes"].indexOf(w)<0;
  });
  return choices.dedup()
}

class Tangent {
  constructor() {
    this.searchTerm = words.random()
    this.history = [this.searchTerm]
  }
  async search(len=60,word){
    let results = [this.searchTerm]
    console.log("searching. history: ",this.history)
    while(results.length<len){
      let nextWord = await this.relatedWord(results.last())
      if(!!nextWord){
        results.push(nextWord)
        results = results.dedup().filter(x => !!x)
      }
      else {
        let attempt = results.pop()
        if(attempt.charAt(attempt.length-1)==="s"){ //try removing an s for plurals, which wont always work
          results.pop()
          results.push(attempt.slice(0,attempt.length-1))
        }
        else(!!!results.pop()) // If we just popped the last element
          results = [words.random()]
      }
    }
    this.searchTerm = results.last()
    this.history = this.history.concat(results.slice(1))
    console.log("tangent:\n",results)
    console.log("lngth: ",results.length,"\n")
    return results
  }
  async relatedWord(word){
    console.log("finding word related to: ",word)
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
