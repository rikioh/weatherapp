// stores variable for previous web load day of month
var cityName = JSON.parse(localStorage.getItem("currentcitysearch"))

getWeatherData(cityName)
firstSearch = true