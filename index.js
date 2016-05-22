var pixel = require('node-pixel')
var five = require('johnny-five')
var Forecast = require('forecast')
var CronJob = require('cron').CronJob

var board = new five.Board()
var strip = null
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
var breathIntensity = 25

function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min)
}

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

function twinkle() {
  for(var i=0; i<strip.stripLength(); i++) {
    var pixel = strip.pixel(i)
    pixel.color(temperatureColors[i])
    var color = pixel.color() // Converts from hex to something we can use
    var randomValue = 1.0 - ((Math.random()) / 5.0) // 20% variation in color
    var red = color.r * randomValue
    var green = color.g * randomValue
    var blue = color.b * randomValue
    pixel.color([Math.round(red), Math.round(green), Math.round(blue)])
  }  
  strip.show()
}

function calcBreath(value, cycle) {
  return clamp(Math.round(value + breathIntensity * ((Math.exp(Math.sin(cycle)) - 0.36787944) / 2.35040238729) - breathIntensity/2.0), 0, 255)
}

function breath() {
  var cycleTime = new Date().getTime() / 2000.0 * Math.PI
  temperatureColors.forEach((c, idx) => {
    var pixel = strip.pixel(idx)
    pixel.color(temperatureColors[idx])
    var color = pixel.color()
    var r = calcBreath(color.r, cycleTime + (idx/10.0))
    var g = calcBreath(color.g, cycleTime + (idx/10.0))
    var b = calcBreath(color.b, cycleTime + (idx/10.0))
    pixel.color([r, g, b])
  })
  strip.show()
}

function off() {
  if (animation !== null) {  
    clearInterval(animation)
  }
  strip.color('black')
  strip.show()
}

board.on("ready", function() {
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
    animation = setInterval(breath, 1000/30) // 10 fps

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
