let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");

const titleInput = document.getElementById("titleInput");
const stepsInput = document.getElementById("stepsInput");
const stepImageInput = document.getElementById("stepImageInput");
const recipesDiv = document.getElementById("recipes");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const suggestions = document.getElementById("suggestions");

// Render recipes
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

      img.onclick = () => {
        const pop = document.createElement("div");
        pop.style.position = "fixed";
        pop.style.top = 0;
        pop.style.left = 0;
        pop.style.width = "100%";
        pop.style.height = "100%";
        pop.style.background = "rgba(0,0,0,0.8)";
        pop.style.display = "flex";
        pop.style.justifyContent = "center";
        pop.style.alignItems = "center";

        const big = document.createElement("img");
        big.src = r.image;
        big.style.maxWidth = "90%";
        big.style.maxHeight = "90%";
        big.style.borderRadius = "10px";

        pop.appendChild(big);
        pop.onclick = () => pop.remove();
        document.body.appendChild(pop);
      };

      card.appendChild(img);
    }

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      recipes.splice(i, 1);
      localStorage.setItem("recipes", JSON.stringify(recipes));
      render();
    };

    card.appendChild(delBtn);
    recipesDiv.appendChild(card);
  });
}

// Add recipe
document.getElementById("addRecipe").onclick = () => {
  const title = titleInput.value.trim();
  const steps = stepsInput.value.trim();

  if (!title) return;

  if (stepImageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      saveRecipe(title, steps, reader.result);
    };
    reader.readAsDataURL(stepImageInput.files[0]);
  } else {
    saveRecipe(title, steps, null);
  }
};

function saveRecipe(title, steps, img) {
  recipes.push({ title, steps, image: img });
  localStorage.setItem("recipes", JSON.stringify(recipes));
  titleInput.value = "";
  stepsInput.value = "";
  stepImageInput.value = "";
  render();
}

// Search bar suggestions
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

// Clear search
clearSearch.onclick = () => {
  searchInput.value = "";
  suggestions.style.display = "none";
  render();
};

// Theme toggle
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// First render
render();
