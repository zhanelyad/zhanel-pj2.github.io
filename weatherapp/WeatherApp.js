const apiToken = 'c529db32306c1ccb01c47be205408319';
let displayInCelsius = true;

function fetchWeatherData() {
  const location = document.getElementById('location-input').value;
  if (location === "") {
    alert("Please enter a city name!");
    return;
  }

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${displayInCelsius ? 'metric' : 'imperial'}&appid=${apiToken}`)
    .then(response => response.json())
    .then(data => {
      showCurrentWeather(data);
      fetchForecast(location);
    })
    .catch(error => alert("Error fetching weather data. Please try again."));
}

function showCurrentWeather(data) {
  const climateDisplay = document.getElementById('climate-display');
  document.getElementById('current-image').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  document.getElementById('temp-now').textContent = `${data.main.temp}°${displayInCelsius ? 'C' : 'F'}`;
  document.getElementById('city-display').textContent = data.name;
  document.getElementById('humidity-level').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('wind-status').textContent = `Wind Speed: ${data.wind.speed} km/h`;
  document.getElementById('weather-description').textContent = `Conditions: ${data.weather[0].description}`;
  showHourlyForecast(data.coord.lat, data.coord.lon);
}

function showHourlyForecast(latitude, longitude) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${displayInCelsius ? 'metric' : 'imperial'}&appid=${apiToken}`)
    .then(response => response.json())
    .then(data => {
      const hourlyContainer = document.querySelector('.hourly-weather');
      hourlyContainer.innerHTML = '<h3>Today\'s Weather by Hour</h3>';
      const hourlyWeather = data.list.slice(0, 4).map(hourData => {
        return `
          <div class="hour-block">
            <p>${new Date(hourData.dt * 1000).getHours()}:00</p>
            <img src="http://openweathermap.org/img/wn/${hourData.weather[0].icon}.png" alt="Weather Icon">
            <p>${hourData.main.temp}°${displayInCelsius ? 'C' : 'F'}</p>
          </div>
        `;
      }).join('');
      hourlyContainer.innerHTML += hourlyWeather;
    });
}

function fetchForecast(location) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${displayInCelsius ? 'metric' : 'imperial'}&appid=${apiToken}`)
    .then(response => response.json())
    .then(data => {
      showForecast(data);
    });
}

function showForecast(data) {
  const weatherForecast = document.getElementById('weather-forecast');
  weatherForecast.innerHTML = "";

  data.list.filter((item, index) => index % 8 === 0).forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.classList.add('forecast-day');

    dayElement.innerHTML = `
      <h4>${new Date(day.dt * 1000).toLocaleDateString()}</h4>
      <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
      <p>High: ${day.main.temp_max}°${displayInCelsius ? 'C' : 'F'}</p>
      <p>Low: ${day.main.temp_min}°${displayInCelsius ? 'C' : 'F'}</p>
      <p>${day.weather[0].description}</p>
    `;

    weatherForecast.appendChild(dayElement);
  });
}

function switchUnits() {
  displayInCelsius = !displayInCelsius;
  fetchWeatherData();
}
