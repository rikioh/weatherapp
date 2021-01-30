var formInput = document.getElementById("citySearchBar")

// holds api key for web addresses
var apiKey = "69fd6d7b254c17b464312f7e4a53ed52"

// list of days of the week
var weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
// full object for the next 5 days
var fivedayForecast = {
    dayName: [],
    weatherIcon: [],
    temperature: [],
    humidity: []
}

// passes the cityName into the ajax fetchurl from the on submit search event (what is typed into the search bar and pressed enter on). also passes
// api key into end of url. ` keys allow the url to use jquery instead of + +
function getRequestURL(cityName){
    // current forecast
    // return `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&apikey=${apiKey}`

    // five day forecast
    return `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`
}

// ajax get request called on by the search bar submit event. Pulls the data based off of the city name plugged into the search bar.
function getWeatherData(cityName){
    $.ajax({
        url: getRequestURL(cityName),
        method: "GET"
        // data below is the object that holds the current forecast object - (data is the response[needed]) - then is like an if statement
    }).then(function(data){
        console.log(data)
        // 3 variables for average temp, max temp, and min temp for a day
        var dailyTemp = 0
        var maxdailyTemp = []
        var mindailyTemp = []
        // for loop that :
        // 1) finds a reading's weather. there are 8 temperature readings every 3 hours for 5 days (40 readings). this is why i= a max of 39
        // 2) finds a reading's date
        // 3) finds a reading's icon
        // 4) finds a reading's humidity
        for (i=0;i<40;i++){
            // variables that pull temp, maxtemp, and mintemp for each 3 hour reading
            var kelvinTemp = data.list[i].main.temp
            var maxkelvinTemp = data.list[i].main.temp_max
            var minkelvinTemp = data.list[i].main.temp_min
            // adds each temperature into a single variable to later divide by the eight readings for avg temp
            dailyTemp+=kelvinTemp
            // pushes the max/min temps into respective arrays to later find the max and min reading of all 8
            maxdailyTemp.push(maxkelvinTemp)
            mindailyTemp.push(minkelvinTemp)
            // find the hour digit of the date so we can find the final reading of the day "21:00:00"
            daydate = data.list[i].dt_txt

            // if it is the last reading of the day create a new object
            if (daydate.slice(-8)=="21:00:00"){
                // variable for the average daily temperature in Kelvin
                var averagedailyTemp = (dailyTemp/mindailyTemp.length)
                console.log(mindailyTemp.length)
                // variable for true max/min of max/min arrays respeectively
                var truemaxTempK = Math.max.apply(Math, maxdailyTemp)
                var trueminTempK = Math.min.apply(Math, mindailyTemp)
                // variable for kelvin temperatures converted to farenheight
                var avgfarTemp = ((averagedailyTemp - 273.15) * 9/5 + 32).toFixed(1)
                var truemaxTempF = ((truemaxTempK - 273.15) * 9/5 + 32).toFixed(1)
                var trueminTempF = ((trueminTempK - 273.15) * 9/5 + 32).toFixed(1)
                // object to store full temperature info for a single day
                var combinedtempObject = {
                    temp: avgfarTemp,
                    max_temp: truemaxTempF,
                    min_temp: trueminTempF
                }
                // push combined full day object into 5 day array
                fivedayForecast.temperature.push(combinedtempObject)
                //  we have reached the end of the day's readings, reset variables for the next day
                dailyTemp = 0
                maxdailyTemp = []
                mindailyTemp = []
            }
            // finds middle of the day reading
            else if (daydate.slice(-8)=="12:00:00"){
                // code for humidity
                    // pulls humidity reading
                    var humidityReading = data.list[i].main.humidity
                    var humidityPercent = humidityReading+"%"
                    fivedayForecast.humidity.push(humidityPercent)
                // code for weather icon
                    // item icon ID
                    var weatherIconID = data.list[i].weather[0].icon
                    // item icon link
                    var weatherIcon = `http://openweathermap.org/img/wn/${weatherIconID}@2x.png`
                    // add individual day icon link to the 5 day object
                    fivedayForecast.weatherIcon.push(weatherIcon)
            }
            else {
                continue;
            }
        }

        getFiveDayForecastNames()

        console.log(fivedayForecast)

    }
    // like an else statment for a .then statement console log the error
    ).catch(function(error){
        // error logs the actual error variable it is not created by me
        console.log(error.responseText)
    }
    )
}

// get the proper names for the next five days of the week with Day.JS
function getFiveDayForecastNames(){
    // pull full date of current day as a string
    var today = dayjs().$d.toString()
    // slice the first 3 characters off the full date string to get weekday
    var todaySlice = today.slice(0,3)
    // find the position of the sliced weekday in the weekDays array
    currentDayPosition = weekDays.indexOf(todaySlice)
    // finds the current amount of days left in the week
    daysLeftInWeek = weekDays.length-currentDayPosition
    // grabs the next five days and resets to array[0] if it hits the end of the array
    for (i=currentDayPosition;i<weekDays.length;i++){
        var additionalDays = weekDays[i+1]
        if (additionalDays===undefined){
            var resetDays = 5-daysLeftInWeek
            for (x=0;x<=resetDays;x++){
                additionalDays=weekDays[x]
                fivedayForecast.dayName.push(additionalDays)
            }
        }
        else{
            fivedayForecast.dayName.push(additionalDays)
        }
    }
}

// search action for when a user presses enter on the city search form
$(document).on('submit',function(event){
    event.preventDefault();
    // pulls value from city search form
    var cityName = $("#citySearchBar").val()
    console.log(cityName)
    // runs the get request function to grab the weather object
    getWeatherData(cityName)
    // adds search item to local storage for future quick search on sidebar
    localStorage.setItem("currentcitysearch",JSON.stringify(cityName));

 });

