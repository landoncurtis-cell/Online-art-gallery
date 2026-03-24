import { ART } from "./data.js";

const $ = (sel) => document.querySelector(sel);

const LS_THEME = "arcadia_theme_v1";
const LS_FAVS = "arcadia_favs_v1";

export const getFavs = () => new Set(JSON.parse(localStorage.getItem(LS_FAVS) || "[]"));
export const setFavs = (set) => localStorage.setItem(LS_FAVS, JSON.stringify([...set]));

function applyTheme(){
  const t = localStorage.getItem(LS_THEME);
  if (t === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");

  const btn = $("#themeBtn");
  if (btn){
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    btn.setAttribute("aria-pressed", String(isLight));
  }
}

function toggleTheme(){
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  localStorage.setItem(LS_THEME, isLight ? "dark" : "light");
  applyTheme();
}

function setFooterYear(){
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function homeStats(){
  const pieces = $("#statPieces");
  const tags = $("#statTags");
  const favs = $("#statFavs");

  if (pieces) pieces.textContent = String(ART.length);

  if (tags){
    const tagSet = new Set();
    ART.forEach(a => a.tags.forEach(t => tagSet.add(t)));
    tags.textContent = String(tagSet.size);
  }

  if (favs) favs.textContent = String(getFavs().size);
}

function homeFeatured(){
  const img = $("#featuredImg");
  const title = $("#featuredTitle");
  const desc = $("#featuredDesc");
  const meta = $("#featuredMeta");
  const link = $("#featuredLink");

  if (!img || !title || !desc || !meta) return;

  const featured = ART.filter(a => a.featured);
  const pick = featured[Math.floor(Math.random() * featured.length)] || ART[0];

  img.src = pick.img;
  title.textContent = pick.title;
  desc.textContent = pick.desc;
  meta.textContent = `${pick.year} • ${pick.tags.join(" • ")}`;

  if (link) link.href = `gallery.html#${pick.id}`;
}

function registerSW(){
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try{
      await navigator.serviceWorker.register("./sw.js");
    }catch{
      // silent fail for school networks that block service workers
    }
  });
}

const themeBtn = $("#themeBtn");
if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

applyTheme();
setFooterYear();
homeStats();
homeFeatured();
registerSW();