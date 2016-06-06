var one = require('onecolor');
var leds = require('ledutils');

function getColor(c1, c2, percent) {
  var red = (c1.red() + percent * (c2.red() - c1.red()))
  var green = (c1.green() + percent * (c2.green() - c1.green()))
  var blue = (c1.blue() + percent * (c2.blue() - c1.blue()))
  return one(['RGB', red, green, blue, 1.0]).hex()
}

function threecolorgradient(c1, c2, c3, size) {
  var sectionSize = size % 2 ? (size-1)/2 : (size/2);
  var c1Toc2 = new Array(sectionSize);
  var c2Toc3 = new Array(sectionSize);

  leds.fill_gradient({
    arr: c1Toc2,
    startColor: c1,
    endColor: c2
  });

  leds.fill_gradient({
    arr: c2Toc3,
    startColor: c2,
    endColor: c3
  });

  return c1Toc2.concat(c2Toc3, [one(c3)]);
}

function threecolor(c1, c2, c3, offset, steps) {
  var gradient = threecolorgradient(c1, c2, c3, steps);
  var colors = [];
  var i;

  for(i=0; i<steps; i++) {
    var color = gradient[i].hex();
    colors.push([i+offset, color]);
  }

  return colors;
}

var colors = threecolor('#000080', '#008000', '#800000', 50, 25);
module.exports = colors;
