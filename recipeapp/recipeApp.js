const apiToken = 'bc071833caed4ca99af6e7474a59df2e';
const recipeSearchBox = document.getElementById('recipeSearchBox');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');
const recipeContainer = document.getElementById('recipeContainer');
const recipePopup = document.getElementById('recipePopup');
const favoriteContainer = document.getElementById('favoriteContainer');
const favoriteGrid = document.getElementById('favoriteGrid');
let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

window.onload = function() {
    loadPopularRecipes();
};

function loadPopularRecipes() {
    fetch(`https://api.spoonacular.com/recipes/random?number=12&apiKey=${apiToken}`)
        .then(response => response.json())
        .then(data => displayRecipeList(data.recipes))
        .catch(error => console.log('Error loading recipes:', error));
}

function displayRecipeList(recipes) {
    recipeContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeBox = document.createElement('div');
        recipeBox.classList.add('recipe-card');
        recipeBox.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" onclick="showRecipeDetails(${recipe.id})">
            <h3>${recipe.title}</h3>
            <div class="recipe-info">
                <div class="time-info">
                    ${recipe.readyInMinutes ? `<i class="fas fa-clock"></i> ${recipe.readyInMinutes} mins` : ''}
                </div>
                <i class="heart-icon fas fa-heart ${isInFavorites(recipe.id) ? 'active' : ''}" 
                   onclick="manageFavorite(event, ${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes || 0})"></i>
            </div>
        `;
        recipeContainer.appendChild(recipeBox);
    });
}


function showFavorites() {
    favoriteContainer.style.display = 'block';
    recipeContainer.style.display = 'none';
    displayFavoriteList();
}

function displayFavoriteList() {
    favoriteGrid.innerHTML = '';
    savedRecipes.forEach(recipe => {
        const recipeBox = document.createElement('div');
        recipeBox.classList.add('recipe-card');
        recipeBox.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" onclick="showRecipeDetails(${recipe.id})">
            <h3>${recipe.title}</h3>
            <div class="recipe-info">
                <div class="time-info">${recipe.time} min</div>
                <i class="heart-icon fas fa-heart active" 
                   onclick="manageFavorite(event, ${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.time})"></i>
            </div>
        `;
        favoriteGrid.appendChild(recipeBox);
    });
}

function manageFavorite(event, id, title, image, time) {
    event.stopPropagation();
    const heartIcon = event.target;
    const recipe = { id, title, image, time };

    if (heartIcon.classList.contains('active')) {
        heartIcon.classList.remove('active');
        savedRecipes = savedRecipes.filter(item => item.id !== id);
    } else {
        heartIcon.classList.add('active');
        savedRecipes.push(recipe);
    }

    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    displayFavoriteList();
}

function showRecipeDetails(recipeId) {
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiToken}`)
        .then(response => response.json())
        .then(recipe => {
            document.getElementById('recipeHeading').textContent = recipe.title;
            document.getElementById('recipePic').src = recipe.image;
            document.getElementById('ingredientsList').innerHTML = recipe.extendedIngredients
                .map(ingredient => `<li>${ingredient.original}</li>`).join('');
            document.getElementById('stepsList').innerHTML = recipe.analyzedInstructions[0]?.steps
                .map(step => `<li>${step.step}</li>`).join('') || "No instructions available";
            document.getElementById('calorieInfo').textContent = recipe.nutrition?.nutrients[0]?.amount + " kcal";
            recipePopup.style.display = 'flex';
        })
        .catch(error => {
            console.log('Error fetching recipe details:', error);
            alert("Recipe not found.");
        });
}

function isInFavorites(id) {
    return savedRecipes.some(item => item.id === id);
}

function displayMain() {
    favoriteContainer.style.display = 'none';
    recipeContainer.style.display = 'grid';
}

recipeSearchBox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchRecipes(recipeSearchBox.value.trim());
    }
});

function searchRecipes(query) {
    if (!query) {
        loadPopularRecipes();
        return;
    }

    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=12&apiKey=${apiToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                displayRecipeList(data.results);
            } else {
                recipeContainer.innerHTML = '<p>No recipes found for "' + query + '".</p>';
            }
        })
        .catch(error => console.log('Error searching recipes:', error));
}
