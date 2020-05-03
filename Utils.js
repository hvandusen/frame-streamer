Array.prototype.random = function(){
  return this[Math.floor(Math.random()*this.length)]
}

Array.prototype.dedup = function(){
  var that = this
  return this.filter(function(item, index){
    return that.indexOf(item) >= index;
  });
}
Array.prototype.last = function(){
  return this[this.length-1]
}

String.prototype.stripPunctuation = function(){
  return this.replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}
