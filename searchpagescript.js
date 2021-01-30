// stores variable for previous web load day of month
var cityName = JSON.parse(localStorage.getItem("currentcitysearch"))
$("#city-Name").text(cityName)

getWeatherData(cityName)
firstSearch = true

