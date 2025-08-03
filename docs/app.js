var recipes = [];
var crafted_recipes = null;
var total_recipes = null;
var recipe_template = null;
var recipe_list = null;
var saved_recipe_indixes = [];
var categories = [];
var crafted_recipes_progress = null;
var remove_recipes = null;
var show_crafted_recipes = null;
var hide_crafted_recipes = null;

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
    crafted_recipes_progress = document.getElementById('crafted-recipes-progress');
    remove_recipes = document.getElementById('remove-recipes');
    show_crafted_recipes = document.getElementById('show-crafted-recipes');
    hide_crafted_recipes = document.getElementById('hide-crafted-recipes');
    categories = [];

    saved_recipe_indixes = localStorage.getItem('necrosmith_recipes');
    console.log('Saved recipe indexes from localStorage:', saved_recipe_indixes);
    if (saved_recipe_indixes) {
        saved_recipe_indixes = JSON.parse(saved_recipe_indixes);
        crafted_recipes.innerText = saved_recipe_indixes.length;
        crafted_recipes_progress.value = saved_recipe_indixes.length;
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
            crafted_recipes_progress.max = data.length;

            for (let index = 0; index < recipes.length; index++) {
                const recipe = recipes[index];
                const recipeNode = document.importNode(recipe_template.content, true);

                if (!categories.includes(recipe.category)) {
                    categories.push(recipe.category);
                }

                recipeNode.querySelector('.row').setAttribute('data-idx', index);
                recipeNode.querySelector('.name').innerText = recipe.name;
                recipeNode.querySelector('.name').onclick = function() {
                    const dialog = document.createElement('dialog');
                    dialog.className = 'nes-dialog is-dark';
                    dialog.style.padding = '2em';
                    dialog.innerHTML = `
                        <h2>${recipe.name}</h2>
                        <p><strong>Category:</strong> ${recipe.category}</p>
                        <p><strong>Head:</strong> ${recipe.head}</p>
                        <p><strong>Body:</strong> ${recipe.body}</p>
                        <p><strong>Arm 1:</strong> ${recipe.arm1}</p>
                        <p><strong>Arm 2:</strong> ${recipe.arm2}</p>
                        <p><strong>Leg 1:</strong> ${recipe.leg1}</p>
                        <p><strong>Leg 2:</strong> ${recipe.leg2}</p>
                        <button class="nes-btn is-primary" onclick="this.parentElement.close(); this.parentElement.remove();">Close</button>
                    `;
                    document.body.appendChild(dialog);
                    dialog.showModal();
                };
                // recipeNode.querySelector('.category').innerText = recipe.category;
                // recipeNode.querySelector('.head').innerText = recipe.head;
                // recipeNode.querySelector('.body').innerText = recipe.body;
                // recipeNode.querySelector('.arm1').innerText = recipe.arm1;
                // recipeNode.querySelector('.arm2').innerText = recipe.arm2;
                // recipeNode.querySelector('.leg1').innerText = recipe.leg1;
                // recipeNode.querySelector('.leg2').innerText = recipe.leg2;

                if (saved_recipe_indixes && saved_recipe_indixes.includes(index)) {
                    recipeNode.querySelector('.nes-checkbox').checked = true;
                }

                recipeNode.querySelector('.nes-checkbox').onchange = function() {
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
                    crafted_recipes_progress.value = saved_recipe_indixes.length;
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

    remove_recipes.onclick = function() {
        const dialog = document.createElement('dialog');
        dialog.className = 'nes-dialog is-dark';
        dialog.style.padding = '2em';
        dialog.innerHTML = `
            <h2>Remove All Crafted Recipes</h2>
            <p>Are you sure you want to remove all crafted recipes? This action cannot be undone.</p>
            <button class="nes-btn is-error" id="confirm-remove">Remove</button>
            <button class="nes-btn is-primary" id="cancel-remove">Cancel</button>
        `;
        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelector('#confirm-remove').onclick = function() {
            saved_recipe_indixes = [];
            localStorage.setItem('necrosmith_recipes', JSON.stringify(saved_recipe_indixes));
            crafted_recipes.innerText = 0;
            crafted_recipes_progress.value = 0;
            // Uncheck all checkboxes
            const checkboxes = recipe_list.querySelectorAll('.nes-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            dialog.close();
            dialog.remove();
        };

        dialog.querySelector('#cancel-remove').onclick = function() {
            dialog.close();
            dialog.remove();
        };
    };

    const recipeCrafterFilter = document.getElementById('recipe-crafter-filter');

    show_crafted_recipes.onclick = function() {
        const recipeRows = recipe_list.querySelectorAll('.row');
        recipeRows.forEach((row, idx) => {
            row.style.display = '';
        });
    };

    hide_crafted_recipes.onclick = function() {
        const recipeRows = recipe_list.querySelectorAll('.row');
        recipeRows.forEach((row, idx) => {
            if (saved_recipe_indixes.includes(idx)) {
                row.style.display = 'none';
            } else {
                row.style.display = '';
            }
        });
    };

};
