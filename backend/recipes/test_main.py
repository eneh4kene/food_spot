from main import app
from fastapi.testclient import TestClient

# initialize the client
client = TestClient(app)


# test create recipe endpoint
def test_create_recipe():
    # define the new payload
    new_recipe = {
        "name": "Spaghetti Bolognese",
        "ingredients": ["spaghetti", "ground beef", "tomato sauce"],
        "steps": "Cook spaghetti. Cook beef. Mix with sauce.",
        "imgURL": "http://example.com/spaghetti.jpg"
    }

    # call the API to create the new recipe
    response = client.post('/recipes', json=new_recipe) #send the payload as json

    # assert that the status code is okay
    assert response.status_code == 200

    # check if the response came back as expected
    data = response.json()
    assert data["name"] == "Spaghetti Bolognese"
    assert data["id"] is not None
    assert data["ingredients"] == ["spaghetti", "ground beef", "tomato sauce"]


# test get all recipes endpoint