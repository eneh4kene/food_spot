// Select the form and display area from the DOM
const recipeForm = document.getElementById('recipe');
const recipesDisplayArea = document.getElementById('recipe-images');

// API URL
const apiURL = "http://0.0.0.0:8000/recipes";

// Fetch all recipes from the API
let fetchAllRecipes = async (query = "") => {
    try {
        let url = query ? `${apiURL}?search=${query}` : apiURL;
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
};


// Function to display each recipe
function displayRecipe(recipe, index) {
    // Create a div to hold the recipe
    let recipeDiv = document.createElement('div');

    // Create an image element if imgURL is provided
    if (recipe.imgURL) {
        let image = document.createElement('img');
        image.className = 'image';
        image.src = recipe.imgURL;
        image.alt = "Recipe Image";
        recipeDiv.appendChild(image);
    }

    // Create a label for the recipe name
    let recipeLabel = document.createElement('label');
    recipeLabel.className = 'recipe-label';
    recipeLabel.innerText = recipe.name;
    recipeDiv.appendChild(recipeLabel);

    // Create the delete button
    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = function() {
        deleteRecipe(recipe.id);
    };
    recipeDiv.appendChild(deleteButton);

    // Add the edit button
    let editButton = document.createElement('button');
    editButton.textContent = "Edit";
    editButton.className = 'edit-btn';
    editButton.onclick = function() {
        editRecipe(recipe.id); // Trigger the edit mode
    };
    recipeDiv.appendChild(editButton);

    // Add the recipeDiv to the display area
    recipesDisplayArea.appendChild(recipeDiv);
}

// Function to refresh the displayed recipes
async function refreshRecipesDisplay() {
    recipesDisplayArea.innerHTML = '';
    let recipes = await fetchAllRecipes();
    recipes.forEach((recipe, index) => {
        displayRecipe(recipe, index);
    });
}

// Function to handle form submission for adding/updating recipes via API
async function handleFormSubmit(event, recipeId = null) {
    event.preventDefault(); // Prevent the form from reloading the page

    // Handle form values
    let enteredRecipeName = document.getElementById('recipe-name').value;
    let enteredIngredients = document.getElementById('ingredients').value;
    let enteredSteps = document.getElementById('steps').value;
    let imageAddress = document.getElementById('recipe-imgUrl').value || 'https://via.placeholder.com/200';

    // Validation: Check if all fields are filled out
    if (!enteredRecipeName || !enteredIngredients || !enteredSteps) {
        alert("Please fill out all fields.");
        return;
    }

    // convert the ingredients into a list
    let listOfIngredients = enteredIngredients.split(",")

    // Create a new recipe object
    let newRecipe = {
        name: enteredRecipeName,
        ingredients: listOfIngredients,
        steps: enteredSteps,
        imgURL: imageAddress
    };

    let requestOptions = {
        method: recipeId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe)
    };

    let url = recipeId ? `${apiURL}/${recipeId}` : apiURL;

    try {
        let response = await fetch(url, requestOptions);
        let result = await response.json();
        alert(recipeId ? 'Recipe successfully updated!' : 'New recipe successfully added!');
    } catch (error) {
        console.error("Error saving recipe:", error);
    }

    // Clear the form and refresh the display
    recipeForm.reset();
    refreshRecipesDisplay();

    // Reset form button text to "Add Recipe"
    const addRecipeButton = document.getElementById('add-recipe');
    addRecipeButton.textContent = "Add Recipe";
    recipeForm.onsubmit = (event) => handleFormSubmit(event);
}

// Handle form submission for adding recipes
recipeForm.onsubmit = (event) => handleFormSubmit(event);

// Function to handle editing a recipe
async function editRecipe(recipeId) {
    try {
        let response = await fetch(`${apiURL}/${recipeId}`);
        let recipe = await response.json();

        // Populate the form with existing details
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('ingredients').value = recipe.ingredients;
        document.getElementById('steps').value = recipe.steps;
        document.getElementById('recipe-imgUrl').value = recipe.imgURL || '';

        // Change the form's button to "Update Recipe"
        const addRecipeButton = document.getElementById('add-recipe');
        addRecipeButton.textContent = "Update Recipe";

        // Scroll to the form for better UX
        recipeForm.scrollIntoView({ behavior: 'smooth' });

        // Modify form submission to update the recipe
        recipeForm.onsubmit = (event) => handleFormSubmit(event, recipeId);
    } catch (error) {
        console.error("Error fetching recipe:", error);
    }
}

// Function to delete a recipe via API
async function deleteRecipe(recipeId) {
    try {
        let response = await fetch(`${apiURL}/${recipeId}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Recipe successfully deleted!");
            refreshRecipesDisplay();
        }
    } catch (error) {
        console.error("Error deleting recipe:", error);
    }
}

// Display stored recipes when the page loads
document.addEventListener('DOMContentLoaded', () => {
    refreshRecipesDisplay();
});


// Function to filter and display recipes
function filterRecipes() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    const allRecipes = document.querySelectorAll('#recipe-images div');

    allRecipes.forEach(recipe => {
        const recipeName = recipe.querySelector('.recipe-label').innerText.toLowerCase();
        recipe.style.display = recipeName.includes(query) ? 'block' : 'none';
    });
}


// other functions/features
function sortRecipes() {
    let option = document.getElementById('sort-options').value;
    let recipes = [...document.querySelectorAll('#recipe-images div')]; // Convert NodeList to array

    recipes.sort((a, b) => {
        if (option === "alphabetical") {
            return a.querySelector('.recipe-label').innerText.localeCompare(b.querySelector('.recipe-label').innerText);
        }
        // Add additional sorting logic for date, ingredients, etc.
    });

    recipes.forEach(recipe => recipesDisplayArea.appendChild(recipe)); // Re-append sorted recipes
}

async function addComment(recipeId) {
    let comment = document.getElementById('comment-input').value;
    if (!comment) return alert("Please enter a comment.");

    try {
        await fetch(`${apiURL}/${recipeId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment })
        });
        // Refresh the comments display
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

// Fetch and display comments
async function fetchComments(recipeId) {
    try {
        let response = await fetch(`${apiURL}/${recipeId}/comments`);
        let comments = await response.json();
        // Display comments in the comments section
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
}
