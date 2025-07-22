import requests

RECIPES_URL = "https://necrosmith.fandom.com/wiki/Recipes"

response = requests.get(RECIPES_URL)
with open("recipes.html", "w", encoding="utf-8") as f:
    f.write(response.text)


BODY_PARTS_URL = "https://necrosmith.fandom.com/wiki/Body_Parts"

response = requests.get(BODY_PARTS_URL)
with open("body_parts.html", "w", encoding="utf-8") as f:
    f.write(response.text)
