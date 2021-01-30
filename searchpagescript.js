// stores variable for previous web load day of month
var cityName = JSON.parse(localStorage.getItem("currentcitysearch"))
// updates city name on page
$("#city-Name").text(cityName)

// run 5 day forecast function
getWeatherData(cityName)

// run current weather function
getCurrentWeatherData(cityName)
firstSearch = true
