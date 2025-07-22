var recipes = [];
var crafted_recipes = null;
var total_recipes = null;
var recipe_template = null;
var recipe_list = null;
var saved_recipe_indixes = [];
var categories = [];

var name_filter = null;
var category_filter = null;


window.onload = function() {
    console.log('Necrosmith crafter loaded!');

    crafted_recipes = document.getElementById('crafted-recipes');
    total_recipes = document.getElementById('total-recipes');
    recipe_template = document.getElementById('recipe-template');
    recipe_list = document.getElementById('recipe-list');
    name_filter = document.getElementById('name-filter');
    category_filter = document.getElementById('category-filter');
    categories = [];

    saved_recipe_indixes = localStorage.getItem('necrosmith_recipes');
    console.log('Saved recipe indexes from localStorage:', saved_recipe_indixes);
    if (saved_recipe_indixes) {
        saved_recipe_indixes = JSON.parse(saved_recipe_indixes);
        crafted_recipes.innerText = saved_recipe_indixes.length;
    } else {
        saved_recipe_indixes = [];
        crafted_recipes.innerText = 0;
    }

    fetch('recipes.json')
        .then(response => response.json())
        .then(data => {
            console.log('Official recipes loaded:', data);
            if (data.length === 0) {
                console.warn('No recipes found in recipes.json');
                return;
            }

            recipes.push(...data);
            total_recipes.innerText = data.length;

            for (let index = 0; index < recipes.length; index++) {
                const recipe = recipes[index];
                const recipeNode = document.importNode(recipe_template.content, true);

                if (!categories.includes(recipe.category)) {
                    categories.push(recipe.category);
                }

                recipeNode.querySelector('.row').setAttribute('data-idx', index);
                recipeNode.querySelector('.name').innerText = recipe.name;
                recipeNode.querySelector('.category').innerText = recipe.category;
                recipeNode.querySelector('.head').innerText = recipe.head;
                recipeNode.querySelector('.body').innerText = recipe.body;
                recipeNode.querySelector('.arm1').innerText = recipe.arm1;
                recipeNode.querySelector('.arm2').innerText = recipe.arm2;
                recipeNode.querySelector('.leg1').innerText = recipe.leg1;
                recipeNode.querySelector('.leg2').innerText = recipe.leg2;

                if (saved_recipe_indixes && saved_recipe_indixes.includes(index)) {
                    recipeNode.querySelector('.check').checked = true;
                }

                recipeNode.querySelector('.check').onchange = function() {
                    if (this.checked) {
                        if (!saved_recipe_indixes.includes(index)) {
                            saved_recipe_indixes.push(index);
                            localStorage.setItem('necrosmith_recipes', JSON.stringify(saved_recipe_indixes));
                        }
                        console.log(`Recipe ${index} checked, updated localStorage:`, saved_recipe_indixes);
                    } else {
                        saved_recipe_indixes = saved_recipe_indixes.filter(i => i !== index);
                        localStorage.setItem('necrosmith_recipes', JSON.stringify(saved_recipe_indixes));
                        console.log(`Recipe ${index} unchecked, updated localStorage:`, saved_recipe_indixes);
                    }

                    crafted_recipes.innerText = saved_recipe_indixes.length;
                };

                recipe_list.appendChild(recipeNode);
            }

            for (const category of categories) {
                const option = document.createElement('option');
                option.value = category;
                option.innerText = category;
                category_filter.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error loading recipes:', error);
        });

    name_filter.oninput = function() {
        const filterText = this.value.toLowerCase();
        const recipeRows = recipe_list.querySelectorAll('.row');

        recipeRows.forEach(row => {
            const name = row.querySelector('.name').innerText.toLowerCase();
            if (name.includes(filterText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    category_filter.onchange = function() {
        const selectedCategory = this.value;
        const recipeRows = recipe_list.querySelectorAll('.row');

        recipeRows.forEach(row => {
            const category = row.querySelector('.category').innerText;
            if (selectedCategory === '' || category === selectedCategory) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };
};
