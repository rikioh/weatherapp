// stores variable for previous web load day of month
var cityName = JSON.parse(localStorage.getItem("currentcitysearch"))
var cityHistory = JSON.parse(localStorage.getItem("previouscitySearches"))
// if case for the first time visiting the website and the variable does not exist in local storage yet
if (!cityHistory){
var cityHistory = []
cityHistory.push(cityName)
localStorage.setItem("previouscitySearches",JSON.stringify(cityHistory));
}
// if case to check if the array has 5 previous searches
else if (cityHistory.length<5){
    // if the city is in the last 5 searches do not add it to the array
    if(cityHistory.includes(cityName)!=true){
        cityHistory.unshift(cityName)
        localStorage.setItem("previouscitySearches",JSON.stringify(cityHistory));
        console.log(cityHistory.includes(cityName))
    }
}
// keep the array to 5 stored searches
else if(cityHistory.includes(cityName)!=true){
    cityHistory.unshift(cityName)
    cityHistory.splice(5,1)
    localStorage.setItem("previouscitySearches",JSON.stringify(cityHistory));
}

// updates city name on page
$("#city-Name").text(cityName)
// $("#city-Name").append(`<img id="theImg" src=${currentWeatherIcon[0]}/>`)
console.log(currentWeatherIcon[0]);

// adds date nect to city name
// pull full date of current day as a string
var today = dayjs().$d.toString()
// slice the first 3 characters off the full date string to get weekday
var todaySlice = today.slice(0,10)
$("#date-Name").text(todaySlice)


// run 5 day forecast function
getWeatherData(cityName)

// run current weather function
getCurrentWeatherData(cityName)
previousSearches()
console.log(cityHistory);
