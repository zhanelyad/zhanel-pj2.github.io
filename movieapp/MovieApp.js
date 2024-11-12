const API_KEY = '78c77089c0b847dd9a73422d8f017b4a';
const BASE_URL = 'https://api.themoviedb.org/3';
const movieContainer = document.getElementById('movie-container');
const watchlistContainer = document.getElementById('watchlist-container');
const movieDetailSection = document.getElementById('movie-detail');

function toggleSearch() {
    document.querySelector('.search-container').classList.toggle('show-search');
}
async function searchMovies() {
    const searchInput = document.getElementById('search-input').value;
    if (searchInput.trim() === '') {
        return; 
    }
    try {
        const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${searchInput}`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching search results:", error);
        movieContainer.innerHTML = "<p>Failed to load movies. Please try again later.</p>";
    }
}

async function fetchTrending(type) {
    try {
        const response = await fetch(`${BASE_URL}/trending/${type}/day?api_key=${API_KEY}`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching data:", error);
        movieContainer.innerHTML = "<p>Failed to load movies. Please try again later.</p>";
    }
}

function showMoviesPage() {
    movieContainer.style.display = 'grid';
    watchlistContainer.style.display = 'none';
    fetchTrending('movie');
}
function showTVPage() {
    movieContainer.style.display = 'grid';
    watchlistContainer.style.display = 'none';
    fetchTrending('tv');
}

function showWatchlist() {
    movieContainer.style.display = 'none';
    watchlistContainer.style.display = 'grid';
    displayWatchlist();
}

function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        movieContainer.innerHTML = '<p>No movies found.</p>';
        return;
    }

    movieContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.setAttribute('data-id', movie.id);
        movieCard.setAttribute('data-type', movie.media_type || 'movie');
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}" onclick="showMovieDetail(${movie.id}, '${movie.media_type || 'movie'}')">
            <h3>${movie.title || movie.name}</h3>
            <p><i class="fas fa-star"></i> ${movie.vote_average}</p>
            <i class="fas fa-heart ${isInWatchlist(movie.id, movie.media_type || 'movie') ? 'favorite' : ''}" onclick="toggleWatchlist(event, ${movie.id}, '${movie.media_type || 'movie'}')"></i>
        `;
        movieContainer.appendChild(movieCard);
    });
}

function displayWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlistContainer.innerHTML = ''; 

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = '<p>No movies saved to Watchlist.</p>';
        return;
    }
    watchlist.forEach(item => {
        fetch(`${BASE_URL}/${item.type}/${item.id}?api_key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);

                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.setAttribute('data-id', item.id);
                movieCard.setAttribute('data-type', item.type);
                movieCard.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title || data.name}">
                    <h3>${data.title || data.name}</h3>
                    <p><i class="fas fa-star"></i> ${data.vote_average}</p>
                    <i class="fas fa-heart ${isInWatchlist(item.id, item.type) ? 'favorite' : ''}" onclick="toggleWatchlist(event, ${item.id}, '${item.type}')"></i>
                `;
                watchlistContainer.appendChild(movieCard);
            })
            .catch(error => {
                console.error("Error Watchlist:", error);
            });
    });
}
function isInWatchlist(id, type) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    return watchlist.some(item => item.id === id && item.type === type);
}

function toggleWatchlist(event, id, type) {
    event.stopPropagation(); 
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    const existingIndex = watchlist.findIndex(item => item.id === id && item.type === type);
    
    if (existingIndex !== -1) {
        watchlist.splice(existingIndex, 1);
        event.target.classList.remove('favorite');
    } else {
        const movie = { id, type };
        watchlist.push(movie);
        event.target.classList.add('favorite');
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));

    displayWatchlist(); 
}
function closeMovieDetail() {
    const movieDetailSection = document.getElementById('movie-detail');
    movieDetailSection.style.display = 'none'
    movieContainer.style.display = 'grid'; 
}
document.addEventListener('DOMContentLoaded', () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (watchlist.length > 0) {
        console.log("Watchlist loaded:", watchlist);
    }
});
window.onload = function() {
    showMoviesPage();
}

async function showMovieDetail(id, type) {
    const movieDetailSection = document.getElementById('movie-detail');
    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos`);
    const data = await response.json();

    movieDetailSection.style.display = 'block'; 
    movieContainer.style.display = 'none'; 

    const movieTitle = document.getElementById('movie-title');
    const movieSynopsis = document.getElementById('movie-synopsis');
    const movieRating = document.getElementById('movie-rating');
    const movieCast = document.getElementById('movie-cast');
    const movieCrew = document.getElementById('movie-crew');
    const movieTrailers = document.getElementById('movie-trailers');
    const movieImage = document.getElementById('movie-image'); 

    movieTitle.textContent = data.title || data.name;
    movieSynopsis.textContent = data.overview || 'No synopsis available';
    movieRating.textContent = `Rating: ${data.vote_average || 'N/A'}`;

    if (data.credits && data.credits.cast && data.credits.cast.length > 0) {
        movieCast.innerHTML = 'Cast: ' + data.credits.cast.slice(0, 5).map(c => c.name).join(', '); 
    } else {
        movieCast.innerHTML = 'Cast: N/A';
    }
    if (data.credits && data.credits.crew && data.credits.crew.length > 0) {
        movieCrew.innerHTML = 'Crew: ' + data.credits.crew.slice(0, 5).map(c => c.name).join(', '); 
    } else {
        movieCrew.innerHTML = 'Crew: N/A';
    }
    if (data.videos && data.videos.results && data.videos.results.length > 0) {
        movieTrailers.innerHTML = 'Trailers: ' + data.videos.results.slice(0, 1).map(v => `<a href="https://www.youtube.com/watch?v=${v.key}" target="_blank">${v.name}</a>`).join(', '); // Показываем только первый трейлер
    } else {
        movieTrailers.innerHTML = 'Trailers: N/A';
    }
    if (data.poster_path) {
        movieImage.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title || data.name}" class="movie-image">`;
    } else {
        movieImage.innerHTML = '<p>No image available</p>';
    }
}
