const Tangent = require("./Tangent.js")
t = new Tangent()
let start = Date.now()
let count = 1;
for (var i = 0; i < 100; i++) {
  t.search(100).then( () => console.log('finished ',i) )

}
