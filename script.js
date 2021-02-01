var formInput = document.getElementById("citySearchBar")

// holds api key for web addresses
var apiKey = "69fd6d7b254c17b464312f7e4a53ed52"

// list of days of the week
var weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// stores current tempterature
var currentWeather = []

var lat = ""
var lon = ""

var UVI = []

// full object for the next 5 days broken up by item
var fivedayForecast = {
    dayName: [],
    weatherIcon: [],
    temperature: [],
    humidity: []
}
// variables for individual days
var oneDayPlus = []
var twoDayPlus = []
var threeDayPlus = []
var fourDayPlus = []
var fiveDayPlus = []

// full five day forecast object
var fullfinalFiveDayArray = [oneDayPlus,twoDayPlus,threeDayPlus,fourDayPlus,fiveDayPlus]

// passes the cityName into the ajax fetchurl from the on submit search event (what is typed into the search bar and pressed enter on). also passes
// api key into end of url. ` keys allow the url to use jquery instead of + +
function getRequestURL(cityName){
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
        // split each day up individually into objects
        fiveDaySplitUp()
        // create dynamic html for 5 day forecast
        createFiveDayHtmlItems()
    }
    // like an else statment for a .then statement console log the error
    ).catch(function(error){
        // error logs the actual error variable it is not created by me
        console.log(error.responseText)
    }
    )
}

// get current weather data
function getRequestURLCurrent(cityName){
    // current forecast
    return `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&apikey=${apiKey}`
}

// ajax get request called on by the search bar submit event. Pulls the data based off of the city name plugged into the search bar.
function getCurrentWeatherData(cityName){
    $.ajax({
        url: getRequestURLCurrent(cityName),
        method: "GET"
        // data below is the object that holds the current forecast object - (data is the response[needed]) - then is like an if statement
    }).then(function(data){
        console.log(data)
        // grab temp and push it to main current weather object
        var currentTempC = data.main.temp
        currentTemp = (currentTempC * 9/5 + 32).toFixed(1)
        currentWeather.push(currentTemp)

        // grab humidity and push it to main
        var currentHumidity = (data.main.humidity)+"%"
        currentWeather.push(currentHumidity)

        // grab wind speed and push
        var currentWind = (data.wind.speed)+" MPH"
        currentWeather.push(currentWind)

        // grab lat and lon
        lat = data.coord.lat
        lon = data.coord.lon
        // grab UV data by running the one call API (passed lat,lon into function to plug into getRequestURLUV function return url)
        getCurrentUVData(lat, lon)

        createCurrentWeatherItems()
    }
    )
}
// get current weather data
function getRequestURLUV(){
    // current forecast
    return `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${apiKey}`
}

function getCurrentUVData(cityName){
    $.ajax({
        url: getRequestURLUV(cityName),
        method: "GET"
        // data below is the object that holds the current forecast object - (data is the response[needed]) - then is like an if statement
    }).then(function(data){
        var currentUVI = Math.round(data.current.uvi)
        currentWeather.push(currentUVI)

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

// function to split 5day forecast object into 5 unique objects
function fiveDaySplitUp(){
    for (i=0;i<5;i++){
        if(i==0){
            oneDayPlus.push(fivedayForecast.dayName[i])
            oneDayPlus.push(fivedayForecast.humidity[i])
            oneDayPlus.push(fivedayForecast.temperature[i])
            oneDayPlus.push(fivedayForecast.weatherIcon[i])
            console.log(oneDayPlus)
        }
        else if(i==1){
            twoDayPlus.push(fivedayForecast.dayName[i])
            twoDayPlus.push(fivedayForecast.humidity[i])
            twoDayPlus.push(fivedayForecast.temperature[i])
            twoDayPlus.push(fivedayForecast.weatherIcon[i])
            console.log(twoDayPlus)
        }
        else if(i==2){
            threeDayPlus.push(fivedayForecast.dayName[i])
            threeDayPlus.push(fivedayForecast.humidity[i])
            threeDayPlus.push(fivedayForecast.temperature[i])
            threeDayPlus.push(fivedayForecast.weatherIcon[i])
            console.log(threeDayPlus)
            }
        else if(i==3){
            fourDayPlus.push(fivedayForecast.dayName[i])
            fourDayPlus.push(fivedayForecast.humidity[i])
            fourDayPlus.push(fivedayForecast.temperature[i])
            fourDayPlus.push(fivedayForecast.weatherIcon[i])
            console.log(fourDayPlus)
            }
        else {
            fiveDayPlus.push(fivedayForecast.dayName[i])
            fiveDayPlus.push(fivedayForecast.humidity[i])
            fiveDayPlus.push(fivedayForecast.temperature[i])
            fiveDayPlus.push(fivedayForecast.weatherIcon[i])
            console.log(fiveDayPlus)
            }        
    }
}

function createFiveDayHtmlItems(){
    for (i=0;i<5;i++){
        // row div for each future date
        var dayRow = $("<div>")
        // four divs for columns
        var dateCol = $("<div>")
        var tempCol = $("<div>")
        var iconCol = $("<div>")
        var humidCol = $("<div>")
        // four variables for column items
        var dateShown = $("<h2>")
        var temp1Shown = $("<h2>")
        var temp2Shown = $("<h5>")
        var iconShown = $("<div>")
        var humidShown = $("<h2>")
        // add classes and attributes to col's/row
        dayRow.addClass("row dash-row")
        dayRow.attr("id", "dayRows")
        dateCol.addClass("col-md-3")
        dateCol.attr("id", "dateCol")
        tempCol.addClass("col-md-3")
        tempCol.attr("id", "tempCol")
        iconCol.addClass("col-md-3")
        iconCol.attr("id", "iconCol")
        humidCol.addClass("col-md-3")
        humidCol.attr("id", "humidCol")
        dateShown.addClass("drop")
        dateShown.attr("id", "dateShown")
        temp1Shown.attr("id", "temp1Shown")
        temp1Shown.addClass("drop2")
        temp2Shown.attr("id", "temp2Shown")
        temp2Shown.addClass("drop2")
        iconShown.attr("id", "iconShown")
        humidShown.addClass("drop")
        humidShown.attr("id", "humidShown")
        // append row to html card and columns to dayRow
        $("#notTodayWeather").append(dayRow)
        $("#dayRows").append(dateCol)
        $("#dayRows").append(tempCol)
        $("#dayRows").append(iconCol)
        $("#dayRows").append(humidCol)
        // add date to row/column
        $("#dateCol").append(dateShown)
        $("#dateShown").text(fullfinalFiveDayArray[i][0])
        // add temp to row/column
        $("#tempCol").append(temp1Shown)
        $("#temp1Shown").text(`High: ${fullfinalFiveDayArray[i][2].max_temp}°/`)
        $("#tempCol").append(temp2Shown)
        $("#temp2Shown").text(`Low: ${fullfinalFiveDayArray[i][2].min_temp}°`)
        // add icon to row/column
        $("#iconCol").append(iconShown)
        $("#iconShown").append(`<img id="theImg" src=${fullfinalFiveDayArray[i][3]} />`)
        // add humiditiy to row/column
        $("#humidCol").append(humidShown)
        $("#humidShown").text(fullfinalFiveDayArray[i][1])
        // remove ids from columns so they dont append 5 times
        $("#dayRows").removeAttr("id")
        $("#dateCol").removeAttr("id")
        $("#tempCol").removeAttr("id")
        $("#iconCol").removeAttr("id")
        $("#humidCol").removeAttr("id")
        $("#dateShown").removeAttr("id")
        $("#temp1Shown").removeAttr("id")
        $("#temp2Shown").removeAttr("id")
        $("#iconShown").removeAttr("id")
        $("#humidShown").removeAttr("id")
    }
}

function createCurrentWeatherItems(){
        // row div for each current date
        var firstRow = $("<div>")
        // five divs for columns
        var temp1 = $("<div>")
        var humid1 = $("<div>")
        var wind1 = $("<div>")
        var uv1 = $("<div>")
        // five variables for column items
        var tempShow = $("<h2>")
        var humidShow = $("<h2>")
        var windShow = $("<h2>")
        var uvShow = $("<h2>")
        // add classes and attributes to col's/row
        firstRow.addClass("row")
        firstRow.attr("id", "firstRows")
        temp1.addClass("col-md-3")
        temp1.attr("id", "temp1")
        humid1.addClass("col-md-3")
        humid1.attr("id", "humid1")
        wind1.addClass("col-md-3")
        wind1.attr("id", "wind1")
        uv1.addClass("col-md-3")
        uv1.attr("id", "uv1")
        tempShow.attr("id", "tempShow")
        tempShow.addClass("drop2")
        humidShow.addClass("drop")
        humidShow.attr("id", "humidShow")
        windShow.addClass("drop")
        windShow.attr("id", "windShow")
        uvShow.addClass("drop")
        uvShow.attr("id", "uvShow")
        // append row to html card and columns to firstRow
        $("#todayWeather").append(firstRow)
        $("#firstRows").append(temp1)
        $("#firstRows").append(humid1)
        $("#firstRows").append(wind1)
        $("#firstRows").append(uv1)
        $("#temp1").append(tempShow)
        $("#tempShow").text("Current Temp: "+currentWeather[0]+"°")
        $("#humid1").append(humidShow)
        $("#humidShow").text("Humidity: "+currentWeather[1])
        $("#wind1").append(windShow)
        $("#windShow").text("Wind: "+currentWeather[2])
        $("#uv1").append(uvShow)
        $("#uvShow").text("UV Index: "+currentWeather[3]+"/10")
        console.log(currentWeather)

}

function previousSearches(){
    for (i=0;i<cityHistory.length;i++){
        var lastSearchDiv = $("<div>")
        var lastSearch = $("<button>")
        lastSearchDiv.attr("id", "lastSearchDiv")
        lastSearch.addClass("btn btn-primary lastSearch col-md-12")
        lastSearch.attr("id", "lastSearch")
        lastSearch.attr("value", cityHistory[i])
        $("#searches").append(lastSearchDiv)
        $("#lastSearchDiv").append(lastSearch)
        $("#lastSearch").text(cityHistory[i])
        $("#lastSearch").removeAttr("id")
    }
}

// search action for when a user presses enter on the city search form
$(document).on('submit',function(event){
    event.preventDefault();
    // pulls value from city search form
    var preCityName = $("#citySearchBar").val()
    var cityName = titleCase(preCityName)
    console.log(cityName)
    // getWeatherData(cityName)
    // adds search item to local storage for future quick search on sidebar
    localStorage.setItem("currentcitysearch",JSON.stringify(cityName))
    // change this to actual URL later???
    window.location.href = "./searchlanding.html"
 })

//  why can't i get this to work without document?
 $(document).on('click','.lastSearch',function(){
    var preCityName = $(this).attr("value")
    var cityName = titleCase(preCityName)
    localStorage.setItem("currentcitysearch",JSON.stringify(cityName))
    window.location.href = "./searchlanding.html"
 })

//  I dont understand this
 function titleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}