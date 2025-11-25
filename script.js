// Supabase init - replace the anon key placeholder with your key
const SUPABASE_URL = "https://pkxatfmzbcchlfiitten.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreGF0Zm16YmNjaGxmaWl0dGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODE5MjAsImV4cCI6MjA3OTU1NzkyMH0.7CktwxVO2oKrtrbXatmPKVNpSE35ugBOvX9LFLuJdrE"; // <-- replace this with your anon key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM refs
const loginScreen = document.getElementById("loginScreen");
const appHeader = document.getElementById("appHeader");
const appMain = document.getElementById("appMain");
const btnSignIn = document.getElementById("btnSignIn");
const btnSignUp = document.getElementById("btnSignUp");
const btnMagic = document.getElementById("btnMagic");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const btnLogout = document.getElementById("btnLogout");

const themeToggle = document.getElementById("themeToggle");
const themeToggleApp = document.getElementById("themeToggleApp");

const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");
const menuFriends = document.getElementById("menuFriends");
const menuShared = document.getElementById("menuShared");
const menuAccount = document.getElementById("menuAccount");

const titleInput = document.getElementById("titleInput");
const stepsInput = document.getElementById("stepsInput");
const stepImageInput = document.getElementById("stepImageInput");
const addRecipeBtn = document.getElementById("addRecipe");
const recipesDiv = document.getElementById("recipes");

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const suggestions = document.getElementById("suggestions");

let currentUser = null;
let recipes = [];

/* -----------------------
   THEME TOGGLE
   ----------------------- */
function setTheme(isDark){
  document.documentElement.classList.toggle("dark", !!isDark);
  localStorage.setItem("dark", !!isDark ? "1" : "0");
}
themeToggle.addEventListener("click", ()=> setTheme(!document.documentElement.classList.contains("dark")));
themeToggleApp.addEventListener("click", ()=> setTheme(!document.documentElement.classList.contains("dark")));
if(localStorage.getItem("dark")==="1") setTheme(true);

/* -----------------------
   AUTH
   ----------------------- */
async function init(){
  const { data } = await supabase.auth.getSession();
  if(data.session && data.session.user){ onSignedIn(data.session.user); }
  else { showLogin(); }
  supabase.auth.onAuthStateChange((event, session) => {
    if(session && session.user) onSignedIn(session.user);
    else showLogin();
  });
}

function showLogin(){
  loginScreen.classList.remove("hidden");
  appHeader.classList.add("hidden");
  appMain.classList.add("hidden");
}

function showApp(){
  loginScreen.classList.add("hidden");
  appHeader.classList.remove("hidden");
  appMain.classList.remove("hidden");
}

async function onSignedIn(user){
  currentUser = user;
  showApp();
  await loadMyRecipes();
}

btnSignUp.addEventListener("click", async ()=>{
  const email = emailInput.value.trim();
  const password = passInput.value;
  if(!email || !password) return alert("email + password required");
  const { error } = await supabase.auth.signUp({ email, password });
  if(error) return alert("Sign up error: "+error.message);
  alert("Registered. Check your email (if confirmation enabled). Sign in now.");
});

btnSignIn.addEventListener("click", async ()=>{
  const email = emailInput.value.trim();
  const password = passInput.value;
  if(!email || !password) return alert("email + password required");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) return alert("Sign in error: "+error.message);
});

btnMagic.addEventListener("click", async ()=>{
  const email = emailInput.value.trim();
  if(!email) return alert("enter email");
  const { error } = await supabase.auth.signInWithOtp({ email });
  if(error) return alert("magic link error: "+error.message);
  alert("Magic link sent to email.");
});

btnLogout.addEventListener("click", async ()=>{
  await supabase.auth.signOut();
  currentUser = null;
  showLogin();
});

/* -----------------------
   PROFILE MENU
   ----------------------- */
profileBtn.addEventListener("click", (e)=>{
  profileMenu.classList.toggle("hidden");
});
menuShared.addEventListener("click", async ()=> {
  profileMenu.classList.add("hidden");
  await viewSharedFeed();
});
menuFriends.addEventListener("click", ()=> {
  profileMenu.classList.add("hidden");
  alert("Friends UI coming soon.");
});
menuAccount.addEventListener("click", ()=> {
  profileMenu.classList.add("hidden");
  alert("Account settings coming soon.");
});

/* -----------------------
   UPLOAD (Supabase Storage)
   ----------------------- */
async function uploadImage(file) {
  if(!file) return null;
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user.id;
  const filename = `${uid}/${Date.now()}_${file.name.replace(/\s/g,"_")}`;
  const { error: uploadError } = await supabase.storage.from("images").upload(filename, file, { upsert: true });
  if(uploadError){
    console.error("upload error", uploadError);
    return null;
  }
  const { data } = supabase.storage.from("images").getPublicUrl(filename);
  return data.publicUrl;
}

/* -----------------------
   SAVE / LOAD / RENDER
   ----------------------- */
async function saveRecipe(title, steps, imageFile){
  const { data: userData } = await supabase.auth.getUser();
  if(!userData || !userData.user) return alert("not signed in");
  const uid = userData.user.id;
  let image_url = null;
  if(imageFile) image_url = await uploadImage(imageFile);
  // insert - image_url can be null
  const { data, error } = await supabase.from("recipes").insert([{
    user_id: uid,
    title,
    steps,
    image_url
  }]);
  if(error) return alert("save error: "+error.message);
  await loadMyRecipes();
}

async function loadMyRecipes(){
  const { data: userData } = await supabase.auth.getUser();
  if(!userData || !userData.user) return;
  const uid = userData.user.id;
  const { data, error } = await supabase.from("recipes").select("*").eq("user_id", uid).order("created_at", { ascending:false });
  if(error){ console.error(error); return; }
  recipes = data || [];
  renderRecipes(recipes);
}

/* render */
function renderRecipes(list){
  recipesDiv.innerHTML = "";
  if(!list || !list.length) {
    recipesDiv.innerHTML = `<p style="color:var(--muted)">No recipes yet.</p>`;
    return;
  }
  list.forEach(r=>{
    const c = document.createElement("div");
    c.className = "recipe-card";
    const h = document.createElement("h3"); h.textContent = r.title || "Untitled";
    const p = document.createElement("p"); p.innerHTML = (r.steps||"").replace(/\n/g,"<br>");
    c.appendChild(h);
    c.appendChild(p);
    if(r.image_url){
      const img = document.createElement("img"); img.src = r.image_url;
      img.addEventListener("click", (e)=>{ e.stopPropagation(); showBigImage(r.image_url); });
      c.appendChild(img);
    }
    // long press delete
    let timer = null;
    c.addEventListener("mousedown", ()=>{
      timer = setTimeout(async ()=>{
        if(!confirm("Delete this recipe?")) return;
        const { error } = await supabase.from("recipes").delete().eq("id", r.id);
        if(error) return alert("delete error: "+error.message);
        await loadMyRecipes();
      }, 600);
    });
    c.addEventListener("mouseup", ()=> clearTimeout(timer));
    c.addEventListener("mouseleave", ()=> clearTimeout(timer));
    recipesDiv.appendChild(c);
  });
}

/* big image popup */
function showBigImage(src){
  const pop = document.createElement("div"); pop.className = "big-image";
  const img = document.createElement("img"); img.src = src;
  pop.appendChild(img); pop.onclick = ()=> pop.remove();
  document.body.appendChild(pop);
}

/* add recipe */
addRecipeBtn.addEventListener("click", async ()=>{
  const title = titleInput.value.trim();
  const steps = stepsInput.value.trim();
  if(!title) return alert("Please add a title");
  const file = stepImageInput.files[0];
  await saveRecipe(title, steps, file);
  titleInput.value = ""; stepsInput.value = ""; stepImageInput.value = "";
});

/* SEARCH + SUGGESTIONS */
let lastSearchTimeout = null;
searchInput.addEventListener("input", async ()=>{
  const q = searchInput.value.trim().toLowerCase();
  if(!q){ suggestions.classList.add("hidden"); renderRecipes(recipes); return; }
  // local filter first
  const matches = recipes.filter(r=> (r.title||"").toLowerCase().includes(q));
  renderRecipes(matches);
  // suggestions from DB
  const { data, error } = await supabase.from("recipes").select("id,title").ilike("title", `%${q}%`).limit(6);
  if(!data || error){ suggestions.classList.add("hidden"); return; }
  suggestions.innerHTML = "";
  data.forEach(d=>{
    const li = document.createElement("li"); li.textContent = d.title;
    li.addEventListener("click", async ()=>{
      searchInput.value = d.title; suggestions.classList.add("hidden");
      const r = await supabase.from("recipes").select("*").eq("id", d.id).single();
      if(r.error) return;
      renderRecipes([r.data]);
    });
    suggestions.appendChild(li);
  });
  suggestions.classList.toggle("hidden", data.length===0);
});
clearSearch.addEventListener("click", ()=>{
  searchInput.value = ""; suggestions.classList.add("hidden"); renderRecipes(recipes);
});

/* shared feed (recipes by people you follow + you) */
async function viewSharedFeed(){
  const { data: userData } = await supabase.auth.getUser();
  if(!userData || !userData.user) return;
  const uid = userData.user.id;
  // get following
  const { data: following } = await supabase.from("follows").select("following_id").eq("follower_id", uid);
  const ids = (following || []).map(f=>f.following_id);
  ids.push(uid);
  const { data, error } = await supabase.from("recipes").select("*").in("user_id", ids).order("created_at", { ascending:false });
  if(error) return console.error(error);
  renderRecipes(data || []);
}

/* init */
init();
