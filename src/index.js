// Import Bootstrap library and its CSS
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/styles.css';
// import $ from 'jquery'; // jQuery import (commented out)

// DOM Element selectors
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// Function to create HTML for weather cards
const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) { // HTML for the main weather card
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else { // HTML for the other five day forecast card
    return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
}

// Function to fetch weather details from API
const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.API_KEY}`;

  // Fetch weather data
  fetch(WEATHER_API_URL)
    .then(response => {
      console.log(response)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Creating weather cards and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(error => {
      alert("An error occurred while fetching the weather forecast: " + error.message);
    });
}

// Function to fetch city coordinates based on user input
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.API_KEY}`;

  // Get entered city coordinates (latitude, longitude, and name) from the API response
  fetch(API_URL)
    .then(response => {
      console.log(response)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const {
        lat,
        lon,
        name
      } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(error => {
      alert("An error occurred while fetching the coordinates: " + error.message);
    });
}

// Function to get user's coordinates and fetch weather details
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const {
        latitude,
        longitude
      } = position.coords; // Get coordinates of user location
      // Get city name from coordinates using reverse geocoding API
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.API_KEY}`;
      fetch(API_URL)
        .then(response => {
          console.log(response)
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const {
            name
          } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(error => {
          alert("An error occurred while fetching the city name: " + error.message);
        });
    },
    error => { // Show alert if user denied the location permission
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.");
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    });
}        

//
searchButton.addEventListener("click", getCityCoordinates); // Get weather using search button
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates()); // Get weather on pressing Enter key in input field
