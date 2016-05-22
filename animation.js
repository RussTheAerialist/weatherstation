// TODO: Setup to update an array that is passed in
var breathIntensity = 25

function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min)
}

function twinkle(strip, colors) {
  for(var i=0; i<strip.stripLength(); i++) {
    var pixel = strip.pixel(i)
    pixel.color(colors[i])
    var color = pixel.color() // Converts from hex to something we can use
    var randomValue = 1.0 - ((Math.random()) / 5.0) // 20% variation in color
    var red = color.r * randomValue
    var green = color.g * randomValue
    var blue = color.b * randomValue
    pixel.color([Math.round(red), Math.round(green), Math.round(blue)])
  }  
  strip.show()
}

// Adapted from http://sean.voisen.org/blog/2011/10/breathing-led-with-arduino/
function calcBreath(value, cycle) {
  return clamp(Math.round(value + breathIntensity * ((Math.exp(Math.sin(cycle)) - 0.36787944) / 2.35040238729) - breathIntensity/2.0), 0, 255)
}

function breath(strip, colors) {
  var cycleTime = new Date().getTime() / 3000.0 * Math.PI
  colors.forEach((c, idx) => {
    var pixel = strip.pixel(idx)
    pixel.color(colors[idx])
    var color = pixel.color()
    var r = calcBreath(color.r, cycleTime - (idx/10.0))
    var g = calcBreath(color.g, cycleTime - (idx/10.0))
    var b = calcBreath(color.b, cycleTime - (idx/10.0))
    pixel.color([r, g, b])
  })
  strip.show()
}

module.exports = {
  twinkle: twinkle,
  breath: breath
}
