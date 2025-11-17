let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");

const list = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const titleInput = document.getElementById("title");
const stepsInput = document.getElementById("steps");
const photoInput = document.getElementById("photo");
const search = document.getElementById("search");
const modeToggle = document.getElementById("modeToggle");

render();

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

function render() {
  list.innerHTML = "";

  recipes
    .filter(r => r.title.toLowerCase().includes(search.value.toLowerCase()))
    .forEach((recipe) => {
      const div = document.createElement("div");
      div.className = "card";

      const safeTitle = recipe.title;
      const safeSteps = recipe.steps.replace(/\n/g, "<br>");

      div.innerHTML = `
        <h3>${safeTitle}</h3>
        <p>${safeSteps}</p>
        ${
          recipe.img
            ? `<img class="recipeImg" src="${recipe.img}" style="max-width:200px; margin-top:10px; border-radius:8px; cursor:pointer;" />`
            : ""
        }
      `;

      list.appendChild(div);
    });
}

search.oninput = render;

modeToggle.onclick = () => {
  const body = document.body;
  const isDark = body.classList.toggle("lightMode");
  modeToggle.textContent = isDark ? "Dark" : "Light";
};

// Image viewer
const viewer = document.getElementById("imgViewer");
const viewerImg = document.getElementById("viewerImg");

document.addEventListener("click", e => {
  if (e.target.classList.contains("recipeImg")) {
    viewerImg.src = e.target.src;
    viewer.style.display = "flex";
  }

  if (e.target === viewer) {
    viewer.style.display = "none";
  }
});

// Long press delete
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

document.addEventListener("mouseup", () => clearTimeout(pressTimer));
document.addEventListener("mouseleave", () => clearTimeout(pressTimer));
