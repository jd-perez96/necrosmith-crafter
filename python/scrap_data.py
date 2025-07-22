import requests
from bs4 import BeautifulSoup
import csv
import ipdb
import json
import re


with open("recipes.html", "r", encoding="utf-8") as f:
    data = f.read()

# ipdb.set_trace()
soup = BeautifulSoup(data, "html.parser")

tables = soup.find_all("table")
titles = soup.find_all("h2")[1:-1]
recipes = []
categories = []

for table, title in zip(tables, titles):
    spans = title.find_all("span")
    if len(spans[0].text.strip()) != 0:
        category = spans[0].text.strip()
    else:
        category = spans[1].text.strip()

    categories.append(category)
    print(f"Processing category: {category}")

    for row in table.find_all("tr")[1:]:
        cells = row.find_all("td")

        name = cells[0].find_all("a")
        if len(name) == 0:
            name = cells[0].find("span").text.strip()
        else:
            name = name[-1].attrs["title"]

        legs = cells[5].text.split("1x")
        if len(legs) == 1:
            leg1 = leg2 = legs[0][2:].strip()
        else:
            # ipdb.set_trace()
            leg1 = legs[1].strip()
            leg2 = legs[2].strip()

        def clean_text(text):
            return re.sub(r'\s+', ' ', text.replace("w/", " with ")).strip()

        recipe = {
            "name": name,
            "head": clean_text(cells[1].text),
            "body": clean_text(cells[2].text),
            "arm1": clean_text(cells[3].text),
            "arm2": clean_text(cells[4].text),
            "leg1": clean_text(leg1),
            "leg2": clean_text(leg2),
            "category": category,
        }
        recipes.append(recipe)


# Output to JSON
with open("recipes.json", "w", encoding="utf-8") as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(recipes)} recipes to recipes.json")
