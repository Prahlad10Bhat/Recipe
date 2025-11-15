const list = document.getElementById("list");
const search = document.getElementById("search");
const addBtn = document.getElementById("addBtn");

let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");

function save() {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

function render(items = recipes) {
  list.innerHTML = "";
  items.forEach(r => {
    let box = document.createElement("div");
    box.className = "recipe";
    box.innerHTML = `<h3>${r.title}</h3><p>${r.steps}</p>`;
    list.appendChild(box);
  });
}

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

search.oninput = () => {
  const q = search.value.toLowerCase();
  const filtered = recipes.filter(r => r.title.toLowerCase().includes(q));
  render(filtered);
};

render();
