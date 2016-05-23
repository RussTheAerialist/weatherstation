var one = require('onecolor')

function getColor(c1, c2, percent) {
  var red = (c1.red() + percent * (c2.red() - c1.red()))
  var green = (c1.green() + percent * (c2.green() - c1.green()))
  var blue = (c1.blue() + percent * (c2.blue() - c1.blue()))
  return one(['RGB', red, green, blue, 1.0]).hex()
}

function threecolor(c1, c2, c3, offset, steps) {
  var colors = []
  var i

  for(i=0.0; i<steps; i++) {
    var color = getColor(
      i < steps/2.0 ? c1 : c2,
      i < steps/2.0 ? c2 : c3,
      i < steps/2.0 ? i/(steps/2.0) : (i-steps/2.0)/(steps/2.0)
    )
    colors.push([i+offset, color])
  }

  return colors
}

var colors = threecolor(one('#000080'), one('#008000'), one('#800000'), 10, 22)
module.exports = colors
