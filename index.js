var pixel = require('node-pixel')
var five = require('johnny-five')
var CronJob = require('cron').CronJob
var anim = require('./animation')
var forecast = require('./forecast')

var board = new five.Board()
var strip = null
var modeSelect = null
var ranges = require('./colors')
var temperatureColors = new Array(8) // Probably should just make this a constant
var animation = null
var selectedAnimationFunction = anim.breath

function getColor(temperature) {
  var color = ranges.reduce((p, c) => {
    return temperature > c[0] ? c : p
  })

  return color[1]
}

function displayForecast(weather) {
  temperatureColors[0] = getColor(weather.currently.temperature)
  var values = forecast.filterHourly(weather, strip.stripLength())
  values.map((c, idx) => {
    temperatureColors[idx+1] = getColor(c)
  })
}

function handleError(err) {
  console.log(err)
}

function off() {
  if (animation !== null) {  
    clearInterval(animation)
  }
  strip.color('black')
  strip.show()
}

function tick() {
  selectedAnimationFunction(strip, temperatureColors)
}

board.on("ready", function() {
  modeSelect = new five.Switch({pin: 0, isPullup: true});

  modeSelect.on('close', () => { selectedAnimationFunction = anim.breath })
  modeSelect.on('open', () => { selectedAnimationFunction = anim.twinkle })

  strip = new pixel.Strip({
    board: this,
    controller: "FIRMATA",
    strips: [ {pin: 6, length: 8} ]
  })


  strip.on("ready", function() {
    board.repl.inject({
      off: off
    })
    temperatureColors = temperatureColors.fill('black')
    animation = setInterval(tick, 1000/30) // 10 fps

    new CronJob({
      cronTime: '*/5 * * * *',
      onTick: () => {
        console.log('Fetching Weather')
        strip.color('black')
        forecast.get().then(displayForecast).catch(handleError)
      },
      start: true,
      runOnInit: true
    })
  })
})
