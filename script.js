const list = document.getElementById("list");
const search = document.getElementById("search");
const addBtn = document.getElementById("addBtn");

// load recipes
let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");

// dark mode
const modeToggle = document.getElementById("modeToggle");
let mode = localStorage.getItem("mode") || "light";

if (mode === "dark") document.body.classList.add("dark");
updateModeBtn();

function updateModeBtn() {
  modeToggle.textContent = mode === "dark" ? "Light" : "Dark";
}

modeToggle.onclick = () => {
  mode = mode === "dark" ? "light" : "dark";
  localStorage.setItem("mode", mode);

  if (mode === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");

  updateModeBtn();
};

// save to storage
function save() {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

// show recipes
function render(items = recipes) {
  list.innerHTML = "";
  items.forEach((r, i) => {
    let box = document.createElement("div");
    box.className = "recipe";
    box.innerHTML = `
      <h3>${r.title}</h3>
      <p>${r.steps}</p>
      <button class="delBtn" data-id="${i}">Delete</button>
    `;
    list.appendChild(box);
  });

  document.querySelectorAll(".delBtn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      recipes.splice(id, 1);
      save();
      render();
    };
  });
}

// add new recipe
addBtn.onclick = () => {
  const title = document.getElementById("title").value.trim();
  const steps = document.getElementById("steps").value.trim();
  if (!title || !steps) return;

  recipes.push({ title, steps });
  save();
  render();

  document.getElementById("title").value = "";
  document.getElementById("steps").value = "";
};

// search
search.oninput = () => {
  const q = search.value.toLowerCase();
  const filtered = recipes.filter(r => r.title.toLowerCase().includes(q));
  render(filtered);
};

// initial load
render();
