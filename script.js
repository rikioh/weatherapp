var formInput = document.getElementById("citySearchBar")

// holds api key for web addresses
var apiKey = "69fd6d7b254c17b464312f7e4a53ed52"

// list of days of the week
var weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
var today = dayjs().$d
console.log(today)

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
        // full object for the next 5 days
        var fivedayForecast = {}
        // array to hold next 5 days date (month/day)
        var nextFivedays = []
        // array to hold next 5 day temperature forecast
        var daytempObjects = []
        // 3 variables for average temp, max temp, and min temp for a day
        var dailyTemp = 0
        var maxdailyTemp = []
        var mindailyTemp = []
        // for loop that :
        // 1) finds a reading's weather. there are 8 temperature readings every 3 hours for 5 days (40 readings). this is why i= a max of 39
        // 2) finds a reading's date
        // 3) finds a reading's icon
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
                daytempObjects.push(combinedtempObject)
                //  we have reached the end of the day's readings, reset variables for the next day
                dailyTemp = 0
                maxdailyTemp = []
                mindailyTemp = []
            }
            else if (daydate.slice(-8)=="12:00:00"){
                // find month/day item
                monthDay = daydate.slice(5,10)
                nextFivedays.push(monthDay)

            }
            else {
                continue;
            }
        }
        console.log(daytempObjects)
        console.log(nextFivedays)

    }
    // like an else statment for a .then statement console log the error
    ).catch(function(error){
        // error logs the actual error variable it is not created by me
        console.log(error.responseText)
    }
    )
}

$(document).on('submit',function(event){
    event.preventDefault();
    // create object to be pushed into hiscores array
    var cityName = $("#citySearchBar").val()
    console.log(cityName)
    // runs the get request function to grab the weather object
    getWeatherData(cityName)
    // adds search item to local storage for future quick search on sidebar
    localStorage.setItem("currentcitysearch",JSON.stringify(cityName));

 });

