var pixel = require('node-pixel')
var five = require('johnny-five')

var board = new five.Board()
var strip = null

board.on("ready", function() {
  strip = new pixel.Strip({
    board: this,
    controller: "FIRMATA",
    strips: [ {pin: 6, length: 7} ]
  })

  strip.on("ready", function() {
    var iterator = setInterval(() => {
      if (strip.pixel(1).color().color == 'black') {
        strip.color('red')
      } else {
        strip.color('black')
      }
      strip.show()
    }, 1000) // Flash at 1Hz
  })
})
