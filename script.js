link = "https://api.openweathermap.org/data/2.5/weather?q=seattle&units=metric&apikey=69fd6d7b254c17b464312f7e4a53ed52";
var request = new XMLHttpRequest();
request.open('GET',link,true);
request.onload = function(){
 var obj = JSON.parse(this.response);
 if (request.status >= 200 && request.status < 400) {
 var temp = Math.round(obj.main.temp * (9/5) +32)
 console.log(temp)
 console.log(obj)
 }
 else{
  console.log("The city doesn't exist! Kindly check");
 }
}
request.send();