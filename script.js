const list = document.getElementById("list");
const search = document.getElementById("search");
const addBtn = document.getElementById("addBtn");
const photoInput = document.getElementById("photo");

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

// save
function save() {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

// show
function render(items = recipes) {
  list.innerHTML = "";
  items.forEach((r, i) => {
    let box = document.createElement("div");
    box.className = "recipe";

    let imgTag = r.photo ? `<img src="${r.photo}" class="recipeImg" />` : "";

    box.innerHTML = `
      <h3>${r.title}</h3>
      <p>${r.steps}</p>
      ${imgTag}
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

// add recipe
addBtn.onclick = () => {
  const title = document.getElementById("title").value.trim();
  const steps = document.getElementById("steps").value.trim();

  if (!title) return;

  const file = photoInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      recipes.push({
        title,
        steps,
        photo: reader.result
      });
      save();
      render();
    };
    reader.readAsDataURL(file);
  } else {
    recipes.push({
      title,
      steps,
      photo: null
    });
    save();
    render();
  }

  document.getElementById("title").value = "";
  document.getElementById("steps").value = "";
  photoInput.value = "";
};

// search
search.oninput = () => {
  const q = search.value.toLowerCase();
  const filtered = recipes.filter(r => r.title.toLowerCase().includes(q));
  render(filtered);
};

// load
render();
