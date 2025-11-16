let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");

const list = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const titleInput = document.getElementById("title");
const stepsInput = document.getElementById("steps");
const photoInput = document.getElementById("photo");
const search = document.getElementById("search");
const modeToggle = document.getElementById("modeToggle");

// Load recipes on start
render();

// Add recipe
addBtn.onclick = () => {
  const title = titleInput.value.trim();
  const steps = stepsInput.value.trim();

  if (!title) return;

  const file = photoInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      saveRecipe(title, steps, reader.result);
    };
    reader.readAsDataURL(file);
  } else {
    saveRecipe(title, steps, null);
  }
};

function saveRecipe(title, steps, imgData) {
  recipes.push({ title, steps, img: imgData });
  localStorage.setItem("recipes", JSON.stringify(recipes));

  titleInput.value = "";
  stepsInput.value = "";
  photoInput.value = "";

  render();
}

// Render recipe list
function render() {
  list.innerHTML = "";

  recipes
    .filter(r => r.title.toLowerCase().includes(search.value.toLowerCase()))
    .forEach((recipe, index) => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${recipe.title}</h3>
        <p>${recipe.steps}</p>
        ${
          recipe.img
            ? `<img src="${recipe.img}" style="max-width:200px; margin-top:10px; border-radius:8px;" />`
            : ""
        }
        <button class="deleteBtn">Delete</button>
      `;

      div.querySelector(".deleteBtn").onclick = () => {
        recipes.splice(index, 1);
        localStorage.setItem("recipes", JSON.stringify(recipes));
        render();
      };

      list.appendChild(div);
    });
}

// Search
search.oninput = render;

// Dark mode toggle
modeToggle.onclick = () => {
  const body = document.body;
  const isDark = body.classList.toggle("lightMode");
  modeToggle.textContent = isDark ? "Dark" : "Light";
};
