let input = document.querySelector("input");
let searchButton = document.getElementsByTagName("button")[0];
let apikey = "AIzaSyA1vZEZvTD_HUfJn3x18gyXuhl8_yRPGPY";

// Click button to search
searchButton.addEventListener("click", function() {
	if (input.value.length > 2) {
		query = url + input.value;
		clear();
		getData();
	} else {
		searches.innerHTML = "<p>Please enter more characters!</p>";
	}
})

// Press "Enter" to search
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    searchButton.click();
  }
});

// Click country to search
document.querySelector("#searches").addEventListener('click', function (event) {
  if (event.target.matches('li')) {
    query = url + event.target.textContent + "?fullText=true";
		clear();
		getData();
  }
})

// Clear old data to prevent overlap and hide divs
function clear() {
	document.querySelector("#countryInfo").style.display = "none";
	document.querySelector("#snapshot").style.display = "none";
	document.querySelector("h2").style.display = "none";
	document.querySelector("table").style.display = "none";
	input.value = "";
	document.querySelector("#searches").innerHTML = "";
	document.querySelector("#country").innerHTML = "";
	document.querySelector("#continent").innerHTML = "";
	document.querySelector("#capital").innerHTML = "";
	document.querySelector("#language").innerHTML = "";
	document.querySelector("#currency").innerHTML = "";
	document.querySelector("#population").innerHTML = "";
	document.querySelector("#flag").innerHTML = "";
	document.querySelector("#translate").innerHTML = "";
	document.querySelector("#capitalImage").innerHTML = "";
	document.querySelector("#time").innerHTML = "";
	document.querySelector("#date").innerHTML = "";
	document.querySelector("#weather").innerHTML = "";
}

// Initial query to "restcountries" api and execute other functions
const url = "https://restcountries.eu/rest/v2/name/";
let query = "";

async function getData() {
	clear();
	try {
		let response = await fetch(query);
		if (response.ok) {
			let jsonResponse = await response.json();
			// If query returns more than one country
			if (jsonResponse.length > 1) {
				searches.innerHTML = printCountries(jsonResponse);
			} else {
				let result = jsonResponse[0];
				// Display country info
				country.innerHTML = result.name;
				continent.innerHTML = result.region;
				capital.innerHTML = result.capital;
				language.innerHTML = languages(result.languages);
				currency.innerHTML = `${result.currencies[0].name} (${result.currencies[0].symbol} ${result.currencies[0].code})`;
				population.innerHTML = numberCommas(result.population);
				flag.innerHTML = `<img src="${result.flag}" alt="${result.demonym} flag" title="${result.demonym} flag">`;
				// Display divs
				document.querySelector("#countryInfo").style.display = "block";
				document.querySelector("#snapshot").style.display = "block";
				document.querySelector("h2").style.display = "block";
				document.querySelector("table").style.display = "table";
				// Other API functions
				initMap(result.name);
				translate(result.languages[0].iso639_1);
				weather(result.capital, result.name);
			}
			return jsonResponse;
		} throw new Error('Request failed!')
	} catch(error) {
			console.log(error);
			searches.innerHTML = "<p>404! No results found.</p>"
		}
}

// Search Google Images for capital city and return first result
let imageUrl = "https://www.googleapis.com/customsearch/v1?cx=012997962464564759894:2cewe3nevda&searchType=image&key=" + apikey + "&q=";

async function imageSearch(city) {
	try {
		let response = await fetch(imageUrl + city);
		if (response.ok) {
			let jsonResponse = await response.json();
			capitalImage.innerHTML = `<img src="${jsonResponse.items[0].link}">`;
			return jsonResponse;
		} throw new Error('Request failed!') 
	} catch(error) {
			console.log(error);
		}
}

// Search "Google Maps API" for country location and fit to container
let geocoder;
let map;

function initMap(address) {
	map = new google.maps.Map(document.getElementById('map'));
	geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'));
	
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			map.fitBounds(results[0].geometry.viewport);
		}
  });	
}

// Use "Google Translate API" to translate greeting to the language of the country
let translateUrl = "https://translation.googleapis.com/language/translate/v2?key=" + apikey;

async function translate(target) {
	try {
		let response = await fetch(translateUrl + "&q=Hello World! How are you?&target=" + target);
		if (response.ok) {
			let jsonResponse = await response.json();
			document.querySelector("#translate").innerHTML = jsonResponse.data.translations[0].translatedText;
			return jsonResponse;
		} throw new Error('Request failed!')
	} catch(error) {
			console.log(error);
			document.querySelector("#translate").innerHTML = "Language translation not found!";
		}
}

// Search "openweathermap API" for weather info of the capital city
let weatherUrl = "http://api.openweathermap.org/data/2.5/weather?appid=a9c4f224d14992d91073b28de4998fc3&q=";

async function weather(city, fallback) {
	try {
		let response = await fetch(weatherUrl + city);
		if (response.ok) {
			let jsonResponse = await response.json();
			imageSearch(city);
			document.querySelector("#weather").innerHTML = Math.round(jsonResponse.main.temp - 273.15) + "°C";
			document.querySelector("#weather").innerHTML += " - " + jsonResponse.weather[0].description.charAt(0).toUpperCase() + jsonResponse.weather[0].description.substr(1);
			let latlng = jsonResponse.coord.lat + ", " + jsonResponse.coord.lon;
			time(latlng);
			return jsonResponse;
		} throw new Error('Request failed!')
	} catch(error) {
			console.log(error);
			// If the country has no valid capital city, search for the country instead
			// This usually applies to regions/territories like "Hong Kong" and "Antarctica"
			if (fallback != null) {
				imageSearch(fallback);
				weather(fallback);
				document.querySelector("#capital").innerHTML = fallback;
			}
		}
}

// Retrieve current time of capital city from "Google Time Zone API"
let targetDate = new Date()
let timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60; // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
let timeUrl = "https://maps.googleapis.com/maps/api/timezone/json?timestamp=" + timestamp + '&key=' + apikey + "&location=";
let date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
let time12 = { hour: 'numeric', minute: 'numeric', hour12: 'true' };

async function time(latlng) {
	try {
		let response = await fetch(timeUrl + latlng);
		if (response.ok) {
			let jsonResponse = await response.json();
			let offsets = jsonResponse.dstOffset * 1000 + jsonResponse.rawOffset * 1000 // get DST and time zone offsets in milliseconds
			let localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of target location
			document.querySelector("#time").innerHTML = localdate.toLocaleString('en-US', time12);
			document.querySelector("#date").innerHTML = localdate.toLocaleString('en-US', date);
			return jsonResponse;
		} throw new Error('Request failed!')
	} catch(error) {
			console.log(error);
		}
}

// Display multiple languages in a list
function languages(lan) {
	let lanStr = "";
	for (let i = 0;i < lan.length;i++) {
		lanStr += "<li>" + lan[i].name + "</li>";
	}
	return lanStr;
}

// Add commas to population
function numberCommas(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Print countries from search query
function printCountries(jsonResponse) {
	let countries = "<ul>";
	for (let i = 0;i < jsonResponse.length;i++) {
		countries += "<li>" + jsonResponse[i].name + "</li>";
	}
	countries += "</ul>"
	return countries;
}