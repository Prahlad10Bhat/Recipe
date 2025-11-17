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
function applyMode() {
  if (mode === "dark") document.body.classList.add("lightMode");
  else document.body.classList.remove("lightMode");
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
  const steps = stepsInput.value; // keep original newlines
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

      // escape text, then convert newlines to <br>
      const safeTitle = escapeHtml(recipe.title);
      const safeSteps = escapeHtml(recipe.steps || "").replace(/\r?\n/g, "<br>");

      div.innerHTML = `
        <div class="card-left">
          <h3>${safeTitle}</h3>
          <p class="steps">${safeSteps}</p>
          <button class="deleteBtn">Delete</button>
        </div>
        <div class="card-right">
          ${recipe.img ? `<img class="recipeImg" src="${recipe.img}" alt="${safeTitle}" />` : ""}
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
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Image viewer
// make sure you have this in index.html:
// <div id="imgViewer" class="viewer"><img id="viewerImg" /></div>
const viewer = document.getElementById("imgViewer");
const viewerImg = document.getElementById("viewerImg");

document.addEventListener("click", e => {
  if (e.target.classList && e.target.classList.contains("recipeImg")) {
    viewerImg.src = e.target.src;
    if (viewer) viewer.style.display = "flex";
  } else if (e.target === viewer) {
    viewer.style.display = "none";
  }
let pressTimer = null;

document.addEventListener("mousedown", e => {
  const card = e.target.closest(".card");
  if (!card) return;

  pressTimer = setTimeout(() => {
    const index = [...list.children].indexOf(card);

    const ok = confirm("Delete this recipe?");
    if (ok) {
      recipes.splice(index, 1);
      localStorage.setItem("recipes", JSON.stringify(recipes));
      render();
    }
  }, 600);
});

document.addEventListener("mouseup", () => {
  clearTimeout(pressTimer);
});

document.addEventListener("mouseleave", () => {
  clearTimeout(pressTimer);
});

