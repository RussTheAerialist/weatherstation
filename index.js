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
    strip.color('#ff0000')
    strip.show()
  })
})
