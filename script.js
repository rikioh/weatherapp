var formInput = document.getElementById("citySearchBar")

// holds api key for web addresses
var apiKey = "69fd6d7b254c17b464312f7e4a53ed52"

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
        // for loop that finds tomorrow's weather. there are 8 temperature readings every 3 hours. this is why i= a max of 7
        for (i=0;i<8;i++){
        // 
            // variables that 
            var kelvinTemp = data.list[i].main.temp
            var maxkelvinTemp = data.list[i].main.temp_max
            var minkelvinTemp = data.list[i].main.temp_min
            // adds each temperature into a single variable to later divide by the eight readings for avg temp
            dailyTemp+=kelvinTemp
            // pushes the max/min temps into respective arrays to later find the max and min reading of all 8
            maxdailyTemp.push(maxkelvinTemp)
            mindailyTemp.push(minkelvinTemp)
        }
        // variable for the average daily temperature in Kelvin
        var averagedailyTemp = (dailyTemp/8)
        // variable for true max/min of max/min arrays respeectively

        // variable for average daily temperature converted to farenheight
        var farTemp = ((averagedailyTemp - 273.15) * 9/5 + 32).toFixed(1)
        console.log(farTemp)

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

