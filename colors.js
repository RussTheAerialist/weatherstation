var one = require('onecolor')
var startColor = one('blue')
var endColor = one('red')

var colors = []
for(var i=0; i<30;i++) {
  var percent = i/30.0
  var red = (startColor.red() + percent * (endColor.red() - startColor.red()))
  var green = (startColor.green() + percent * (endColor.green() - startColor.green()))
  var blue = (startColor.blue() + percent * (endColor.blue() - startColor.blue()))
  var nextColor = one(['RGB', red, green, blue, 1.0]).hex()
  colors.push([i, nextColor])
}

module.exports = colors
console.log(colors)
