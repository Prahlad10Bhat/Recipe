// Supabase init - replace the anon key placeholder with your key
const SUPABASE_URL = "https://pkxatfmzbcchlfiitten.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreGF0Zm16YmNjaGxmaWl0dGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODE5MjAsImV4cCI6MjA3OTU1NzkyMH0.7CktwxVO2oKrtrbXatmPKVNpSE35ugBOvX9LFLuJdrE"; // <-- replace this with your anon key

const supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM refs
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const btnSignIn = document.getElementById("btnSignIn");
const btnSignUp = document.getElementById("btnSignUp");
const btnMagic = document.getElementById("btnMagic");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const btnLogout = document.getElementById("btnLogout");
const userEmailEl = document.getElementById("userEmail");

const titleInput = document.getElementById("titleInput");
const stepsInput = document.getElementById("stepsInput");
const stepImageInput = document.getElementById("stepImageInput");
const addRecipeBtn = document.getElementById("addRecipe");
const recipesDiv = document.getElementById("recipes");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const suggestions = document.getElementById("suggestions");
const viewFeedBtn = document.getElementById("viewFeed");

// basic helpers
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }
function byId(id){ return document.getElementById(id); }

// check session on load
async function init() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    setupAuthenticatedUI(data.session.user);
  } else {
    setupUnauthUI();
  }
  // realtime: listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.user) setupAuthenticatedUI(session.user);
    else setupUnauthUI();
  });
}

function setupUnauthUI(){
  show(authSection);
  hide(appSection);
  hide(btnLogout);
  userEmailEl.textContent = "";
}

function setupAuthenticatedUI(user){
  hide(authSection);
  show(appSection);
  show(btnLogout);
  userEmailEl.textContent = user.email;
  loadMyRecipes();
}

// AUTH: sign up / sign in
btnSignUp.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passInput.value;
  if (!email || !password) { alert("email + password required"); return; }
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return alert("Sign up error: " + error.message);
  alert("Check your email for confirmation (if enabled). Now sign in.");
});

btnSignIn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passInput.value;
  if (!email || !password) { alert("email + password required"); return; }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert("Sign in error: " + error.message);
  // on success, auth state change will call setupAuthenticatedUI
});

btnMagic.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) return alert("enter email");
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) return alert("magic link error: " + error.message);
  alert("Magic link sent to email.");
});

btnLogout.addEventListener("click", async () => {
  await supabase.auth.signOut();
  setupUnauthUI();
});

// UPLOAD helper -> uploads to 'images' bucket and returns public URL
async function uploadImage(file) {
  if (!file) return null;
  const user = supabase.auth.getUser().then(r => r.data.user).catch(()=>null);
  const uid = (await supabase.auth.getUser()).data.user.id;
  const filename = `${uid}/${Date.now()}_${file.name.replace(/\s/g,'_')}`;
  const { data, error } = await supabase.storage.from('images').upload(filename, file);
  if (error) {
    console.error("upload error", error);
    return null;
  }
  // generate public URL (if bucket public) or signed URL
  const { publicUrl } = supabase.storage.from('images').getPublicUrl(filename);
  return publicUrl;
}

// SAVE recipe to table "recipes"
async function saveRecipe(title, steps, imageFile) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return alert("not signed in");
  let image_url = null;
  if (imageFile) image_url = await uploadImage(imageFile);

  const { data, error } = await supabase.from('recipes').insert([{
    user_id: user.id,
    title,
    steps,
    image_url,
  }]);
  if (error) return alert("save error: " + error.message);
  // refresh list
  loadMyRecipes();
}

// LOAD user's own recipes
async function loadMyRecipes() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;
  const { data, error } = await supabase.from('recipes').select('*').eq('user_id', user.id).order('created_at', {ascending:false});
  if (error) { console.error(error); return; }
  renderRecipes(data);
}

// RENDER helper
function renderRecipes(list) {
  recipesDiv.innerHTML = "";
  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    const h = document.createElement("h3"); h.textContent = r.title;
    const p = document.createElement("p"); p.innerHTML = (r.steps||"").replace(/\n/g,"<br>");
    card.appendChild(h);
    card.appendChild(p);
    if (r.image_url) {
      const img = document.createElement("img");
      img.src = r.image_url;
      img.addEventListener("click", e => {
        e.stopPropagation();
        showBigImage(r.image_url);
      });
      card.appendChild(img);
    }
    // long-press delete (600ms)
    let timer = null;
    card.addEventListener("mousedown", () => {
      timer = setTimeout(async () => {
        if (!confirm("Delete this recipe?")) return;
        const { error } = await supabase.from('recipes').delete().eq('id', r.id);
        if (error) return alert("delete error: " + error.message);
        loadMyRecipes();
      }, 600);
    });
    card.addEventListener("mouseup", () => clearTimeout(timer));
    card.addEventListener("mouseleave", () => clearTimeout(timer));
    recipesDiv.appendChild(card);
  });
}

// show popup image
function showBigImage(src) {
  const pop = document.createElement("div"); pop.className = "big-image";
  const img = document.createElement("img"); img.src = src;
  pop.appendChild(img); pop.onclick = () => pop.remove();
  document.body.appendChild(pop);
}

// Add recipe click
addRecipeBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const steps = stepsInput.value.trim();
  if (!title) return alert("add title");
  const file = stepImageInput.files[0];
  await saveRecipe(title, steps, file);
  titleInput.value = ""; stepsInput.value = ""; stepImageInput.value = "";
});

// SEARCH + SUGGESTIONS
searchInput.addEventListener("input", async () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { suggestions.style.display = "none"; loadMyRecipes(); return; }
  // search titles by simple contains
  const { data, error } = await supabase.from('recipes').select('id,title,user_id,created_at').ilike('title', `%${q}%`).limit(10);
  if (error) return console.error(error);
  suggestions.innerHTML = "";
  data.forEach(d => {
    const li = document.createElement("li");
    li.textContent = d.title;
    li.onclick = async () => {
      searchInput.value = d.title;
      suggestions.style.display = "none";
      // load specific recipe(s)
      const r = await supabase.from('recipes').select('*').eq('id', d.id).single();
      if (r.error) return;
      renderRecipes([r.data]);
    };
    suggestions.appendChild(li);
  });
  suggestions.style.display = data.length ? "block" : "none";
});

// clear search
clearSearch.addEventListener("click", () => {
  searchInput.value = ""; suggestions.style.display = "none"; loadMyRecipes();
});

// Shared feed (recipes from people you follow)
viewFeedBtn.addEventListener("click", async () => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;
  // get following list
  const { data: following, error } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
  if (error) return console.error(error);
  const ids = following.map(f => f.following_id);
  // include self
  ids.push(user.id);
  const { data, error: e2 } = await supabase.from('recipes').select('*, users:user_id (email)').in('user_id', ids).order('created_at', {ascending:false});
  if (e2) return console.error(e2);
  renderRecipes(data);
});

// init app
init();
