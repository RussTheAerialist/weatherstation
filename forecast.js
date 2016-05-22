var Forecast = require('forecast')

var apikey = require('./.api_key.json')
var position = require('./locations').nola
var forecast = new Forecast({
  service: 'forecast.io',
  key: apikey,
  units: 'celcius',
  cache: true,
  ttl: {
    minutes: 4
  }
})

function getForecast() {
  return new Promise((resolve, reject) => {

    forecast.get(position, (err, weather) =>{
      if (err) return reject(err)
      return resolve(weather)
    })
  })
}

function getHourlyValues(weather, length) {
  return weather.hourly.data.slice(0, length-1).map((c) => { return c.temperature })
}

function getDailyValues(weather, length) {
  return weather.daily.data.slice(0, length-1).map((c) => { return c.temperatureMax })
}

module.exports = {
  get: getForecast,
  filterHourly: getHourlyValues,
  filterDaily: getDailyValues
}
