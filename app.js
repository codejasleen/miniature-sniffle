window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadDashboard();
});

class FitnessAPI {
    async getWorkouts() {
        try {
            const response = await fetch('https://wger.de/api/v2/exercise/?limit=10');
            if (!response.ok) {
                throw new Error('Failed to fetch workouts');
            }
            const data = await response.json();
            console.log("Workouts data:", data);
            return data.results || [];
        } catch (error) {
            console.error('Error fetching workouts:', error);
            return [];
        }
    }
}

const fitnessAPI = new FitnessAPI();

async function searchMeals(query) {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
        if (!response.ok) {
            throw new Error('Failed to fetch meals');
        }
        const data = await response.json();
        console.log("Meals data:", data);
        return data.products || [];
    } catch (error) {
        console.error('Error searching meals:', error);
        return [];
    }
}

async function getWeather() {
    try {
        const response = await fetch('https://wttr.in/?format=%C+%t');
        if (!response.ok) {
            throw new Error('Failed to fetch weather');
        }
        const weatherData = await response.text();
        const weatherElement = document.getElementById('weather-info');
        if (weatherElement) {
            weatherElement.textContent = `Weather: ${weatherData}`;
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

let caloriesBurned = 0;
let workoutsCompleted = 0;
let completedStreak = 0;

function updateStats() {
    document.getElementById('calories-burned').textContent = caloriesBurned;
    document.getElementById('workouts-completed').textContent = workoutsCompleted;
    document.getElementById('streak-days').textContent = completedStreak;
}

const workoutsListEl = document.getElementById('workouts-list');
const mealsListEl = document.getElementById('meals-list');
const mealSearchEl = document.getElementById('meal-search');
const searchButtonEl = document.getElementById('search-button');

async function loadDashboard() {
    try {
        const workouts = await fitnessAPI.getWorkouts();
        renderWorkouts(workouts);
        getWeather();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderWorkouts(workouts) {
    if (workoutsListEl) {
        workoutsListEl.innerHTML = workouts.map((workout, index) => `
            <div class="workout-card" data-id="${index}" onclick="completeWorkout(${index})">
                <h3 class="font-semibold">${workout.name}</h3>
                <p class="text-sm text-gray-600">Category: ${workout.category?.name || 'Unknown'}</p>
            </div>
        `).join('');
    }
}

function completeWorkout(index) {
    caloriesBurned += 100; 
    workoutsCompleted++;
    completedStreak++;
    updateStats();
}

function renderMeals(meals) {
    if (mealsListEl) {
        mealsListEl.innerHTML = meals.map(meal => `
            <div class="meal-card">
                <img src="${meal.image_url || 'https://via.placeholder.com/100'}" alt="${meal.product_name}" class="meal-image">
                <div class="meal-info">
                    <h3 class="font-semibold">${meal.product_name || 'Unknown'}</h3>
                    <p class="text-sm text-gray-600">Brand: ${meal.brands || 'Unknown'}</p>
                </div>
            </div>
        `).join('');
    }
}

if (searchButtonEl && mealSearchEl) {
    searchButtonEl.addEventListener('click', async () => {
        const query = mealSearchEl.value.trim();
        if (query) {
            const meals = await searchMeals(query);
            renderMeals(meals);
        }
    });

    mealSearchEl.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const query = mealSearchEl.value.trim();
            if (query) {
                const meals = await searchMeals(query);
                renderMeals(meals);
            }
        }
    });
}

