var pixel = require('node-pixel')
var five = require('johnny-five')
var Forecast = require('forecast')

var board = new five.Board()
var strip = null
var apikey = require('./.api_key.json')
var position = [ 48.9894, -122.7753] // Semiahmoo
var forecast = new Forecast({
  service: 'forecast.io',
  key: apikey,
  units: 'celcius',
  cache: true,
  ttl: {
    minutes: 15
  }
})
var temperature_color = '#333333'
var ranges = [
  [ 0, 'blue' ],
  [ 5, 'light-blue' ],
  [ 10, 'grey' ],
  [ 20, 'yellow' ],
  [ 25, 'orange' ],
  [ 30, 'red' ]
]

function getColor(temperature) {
  var color = ranges.reduce((p, c) => {
    return temperature > c[0] ? c : p
  })

  return color[1]
}

board.on("ready", function() {
  strip = new pixel.Strip({
    board: this,
    controller: "FIRMATA",
    strips: [ {pin: 6, length: 7} ]
  })

  strip.on("ready", function() {
    board.repl.inject({
      pixel: strip.pixel,
      show: strip.show,
      color: strip.color
    })

    var iterator = setInterval(() => {
      if (strip.pixel(1).color().color == 'black') {
        strip.color(temperature_color)
      } else {
        strip.color('black')
      }
      strip.show()
    }, 1000) // Flash at 1Hz

    forecast.get(position, function(err, weather) {
      if (err) return console.dir(err)
        var temperature = weather.currently.temperature
        temperature_color = getColor(temperature)
    })
  })
})
