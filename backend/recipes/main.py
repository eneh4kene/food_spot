import os.path
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import List, Optional

# file name
RECIPE_FILE = "recipes.json"


# utility functions to load file and save to the file
def load_recipes():
    # check if the file exists and create it if it doesn't exist
    if os.path.exists(RECIPE_FILE):
        with open(RECIPE_FILE, "r") as file_obj:
            return json.load(file_obj)
    else:
        return []


def save_recipes(recipes):
    with open(RECIPE_FILE, "w") as file_obj:
        json.dump(recipes, file_obj, indent=4)


# initialize the api application
app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# create the data model from which data will be serialized to and from the client
class Recipe(BaseModel):
    id: int = None
    name: str
    ingredients: list[str]
    steps: str
    imgURL: str = None


# define the api endpoints

# get all the recipes from the db(file in this case)
@app.get("/recipes")
async def get_recipes(search: Optional[str] = None):
    recipes = load_recipes()
    if search:
        filtered_recipes = [recipe for recipe in recipes if search.lower() in recipe["name"].lower()]
        return filtered_recipes
    return recipes


# get a specific recipe
@app.get('/recipes/{recipe_id}')
def get_specific_recipe(recipe_id: int):
    recipes = load_recipes()

    # check if the recipe exists and return an Httpexception if not
    recipe = next((recipe for recipe in recipes if recipe["id"] == recipe_id), None)

    if recipe is not None:
        return recipe
    else:
        raise HTTPException(404, 'Recipe does not exist')


# create a recipe
@app.post('/recipes')
def create_recipe(recipe: Recipe):
    recipes = load_recipes()

    # generate an id for the new recipe
    new_recipe_id = max((recipe["id"] for recipe in recipes), default=0) + 1
    # assign it to the new "Recipe" object fetched
    recipe.id = new_recipe_id
    # attach it to the list of recipes and save it
    recipes.append(recipe.model_dump())  # model dump converts the "Recipe" model to a python object
    save_recipes(recipes)
    # return it as a response
    return recipe


# update a recipe
@app.put('/recipes/{recipe_id}')
def update_recipe(recipe_id: int, updated_recipe: Recipe):
    recipes = load_recipes()

    # find the recipe with the matching id
    recipe_index = next((index for index, recipe in enumerate(recipes) if recipe["id"] == recipe_id), None)
    # and update it with the updated recipe

    if recipe_index is not None:
        updated_recipe.id = recipe_id
        recipes[recipe_index] = updated_recipe.model_dump()
        # save and return it as response
        save_recipes(recipes)
    else:
        raise HTTPException(404, 'Recipe not found')
    return updated_recipe


# delete a specific recipe
@app.delete('/recipes/{recipe_id}')
def delete_recipe(recipe_id: int):
    recipes = load_recipes()

    # get the recipe and remove it from the list if it exists
    recipe_index = next((index for index, recipe in enumerate(recipes) if recipe["id"] == recipe_id), None)

    if recipe_index is not None:
        del recipes[recipe_index]
        save_recipes(recipes)
        return {'status':'success', 'message': 'Recipe deleted successfully'}
    else:
        raise HTTPException(status_code=404, detail='Recipe not found')


# run the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
