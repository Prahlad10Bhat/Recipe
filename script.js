// load recipes
let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");

const list = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const titleInput = document.getElementById("title");
const stepsInput = document.getElementById("steps");
const photoInput = document.getElementById("photo");
const search = document.getElementById("search");
const modeToggle = document.getElementById("modeToggle");

// --- DARK MODE (persistent) ---
let mode = localStorage.getItem("mode") || "light"; // "light" or "dark"
// Note: existing CSS uses body.lightMode as the dark styling, so we keep that classname.
function applyMode() {
  if (mode === "dark") document.body.classList.add("lightMode");
  else document.body.classList.remove("lightMode");

  // Button shows the action the user will get if they click it
  modeToggle.textContent = mode === "dark" ? "Light" : "Dark";
}
applyMode();

modeToggle.onclick = () => {
  mode = mode === "dark" ? "light" : "dark";
  localStorage.setItem("mode", mode);
  applyMode();
};
// --- end dark mode ---

// initial render
render();

// add recipe
addBtn.onclick = () => {
  const title = titleInput.value.trim();
  const steps = stepsInput.value.trim();
  if (!title) return;

  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => saveRecipe(title, steps, reader.result);
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

// render list
function render() {
  list.innerHTML = "";
  const q = (search.value || "").toLowerCase();

  recipes
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.title.toLowerCase().includes(q))
    .forEach(({ r: recipe, i: index }) => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <div class="card-left">
          <h3>${escapeHtml(recipe.title)}</h3>
          <p class="steps">${escapeHtml(recipe.steps)}</p>
          <button class="deleteBtn">Delete</button>
        </div>
        <div class="card-right">
          ${recipe.img ? `<img src="${recipe.img}" alt="${escapeHtml(recipe.title)}" />` : ""}
        </div>
      `;

      div.querySelector(".deleteBtn").onclick = () => {
        recipes.splice(index, 1);
        localStorage.setItem("recipes", JSON.stringify(recipes));
        render();
      };

      list.appendChild(div);
    });
}

// search
search.oninput = render;

// small helper to avoid simple HTML injection when showing text
function escapeHtml(s) {
  if (!s) return "";
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
