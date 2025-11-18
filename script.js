let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");

const titleInput = document.getElementById("titleInput");
const stepsInput = document.getElementById("stepsInput");
const stepImageInput = document.getElementById("stepImageInput");
const recipesDiv = document.getElementById("recipes");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const suggestions = document.getElementById("suggestions");

/* RENDER */
function render(list = recipes) {
  recipesDiv.innerHTML = "";

  list.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const title = document.createElement("h2");
    title.textContent = r.title;

    const steps = document.createElement("p");
    steps.innerHTML = r.steps.replace(/\n/g, "<br>");

    card.appendChild(title);
    card.appendChild(steps);

    if (r.image) {
      const img = document.createElement("img");
      img.src = r.image;

      img.onclick = (e) => {
        e.stopPropagation();
        showBigImage(r.image);
      };

      card.appendChild(img);
    }

    // LONG PRESS DELETE
    let timer = null;

    card.addEventListener("mousedown", () => {
      timer = setTimeout(() => {
        const ok = confirm("Delete this recipe?");
        if (ok) {
          recipes.splice(i, 1);
          localStorage.setItem("recipes", JSON.stringify(recipes));
          render();
        }
      }, 600);
    });

    card.addEventListener("mouseup", () => clearTimeout(timer));
    card.addEventListener("mouseleave", () => clearTimeout(timer));

    recipesDiv.appendChild(card);
  });
}

/* POPUP IMAGE */
function showBigImage(src) {
  const pop = document.createElement("div");
  pop.className = "big-image";

  const img = document.createElement("img");
  img.src = src;

  pop.appendChild(img);
  pop.onclick = () => pop.remove();

  document.body.appendChild(pop);
}

/* ADD RECIPE */
document.getElementById("addRecipe").onclick = () => {
  const title = titleInput.value.trim();
  const steps = stepsInput.value.trim();
  if (!title) return;

  if (stepImageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => saveRecipe(title, steps, reader.result);
    reader.readAsDataURL(stepImageInput.files[0]);
  } else {
    saveRecipe(title, steps, null);
  }
};

function saveRecipe(title, steps, image) {
  recipes.push({ title, steps, image });
  localStorage.setItem("recipes", JSON.stringify(recipes));
  titleInput.value = "";
  stepsInput.value = "";
  stepImageInput.value = "";
  render();
}

/* SEARCH + SUGGESTIONS */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  if (!q) {
    suggestions.style.display = "none";
    render();
    return;
  }

  const matches = recipes.filter(r => r.title.toLowerCase().includes(q));

  suggestions.innerHTML = "";
  matches.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r.title;
    li.onclick = () => {
      searchInput.value = r.title;
      suggestions.style.display = "none";
      render([r]);
    };
    suggestions.appendChild(li);
  });

  suggestions.style.display = matches.length ? "block" : "none";
  render(matches);
});

/* CLEAR SEARCH */
clearSearch.onclick = () => {
  searchInput.value = "";
  suggestions.style.display = "none";
  render();
};

/* THEME TOGGLE */
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

/* FIRST LOAD */
render();
