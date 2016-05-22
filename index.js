var pixel = require('node-pixel')
var five = require('johnny-five')
var Forecast = require('forecast')
var CronJob = require('cron').CronJob
var anim = require('./animation')

var board = new five.Board()
var strip = null
var modeSelect = null
var apikey = require('./.api_key.json')
var position = require('./locations').nola
var forecast = new Forecast({
  service: 'forecast.io',
  key: apikey,
  units: 'celcius',
  cache: false,
})
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

function getForecast() {
  return new Promise((resolve, reject) => {

    forecast.get(position, (err, weather) =>{
      if (err) return reject(err)
      return resolve(weather)
    })
  })
}

function getHourlyValues(weather) {
  return weather.hourly.data.slice(0, strip.stripLength()-1).map((c) => { return c.temperature })
}

function getDailyValues(weather) {
  return weather.daily.data.slice(0, strip.stripLength()-1).map((c) => { return c.temperatureMax })
}

function displayForecast(weather) {
  temperatureColors[0] = getColor(weather.currently.temperature)
  var values = getHourlyValues(weather)
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
        getForecast().then(displayForecast).catch(handleError)
      },
      start: true,
      runOnInit: true
    })
  })
})
