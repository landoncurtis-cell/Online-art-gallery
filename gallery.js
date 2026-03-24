import { ART } from "./data.js";
import { getFavs, setFavs } from "./app.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const gallery = $("#gallery");
const emptyState = $("#emptyState");

const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");
const yearRange = $("#yearRange");
const yearValue = $("#yearValue");
const viewSelect = $("#viewSelect");

const resultCount = $("#resultCount");
const favCount = $("#favCount");
const resetBtn = $("#resetBtn");
const clearFavsBtn = $("#clearFavsBtn");

// Modal
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalMeta = $("#modalMeta");
const modalImg = $("#modalImg");
const modalDesc = $("#modalDesc");
const closeBtn = $("#closeBtn");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const favBtn = $("#favBtn");
const favBtnText = $("#favBtnText");
const downloadLink = $("#downloadLink");

let activeTag = "all";
let filtered = [...ART];
let currentIndex = 0;
let lastFocusEl = null;

function normalize(s){ return String(s).toLowerCase().trim(); }

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function getFilters(){
  return {
    q: normalize(searchInput.value),
    maxYear: Number(yearRange.value),
    sort: sortSelect.value,
    tag: activeTag,
    view: viewSelect.value
  };
}

function applyViewMode(view){
  gallery.classList.remove("gallery--masonry","gallery--grid","gallery--focus");
  gallery.classList.add(`gallery--${view}`);
}

function filterAndSort(){
  const { q, maxYear, sort, tag, view } = getFilters();
  applyViewMode(view);

  filtered = ART.filter(a => {
    const inYear = a.year <= maxYear;
    const inTag = (tag === "all") ? true : a.tags.includes(tag);
    const hay = normalize(`${a.title} ${a.artist} ${a.desc} ${a.tags.join(" ")} ${a.year}`);
    const inSearch = q ? hay.includes(q) : true;
    return inYear && inTag && inSearch;
  });

  if (sort === "featured"){
    filtered.sort((a,b)=> Number(b.featured)-Number(a.featured) || b.year-a.year || a.title.localeCompare(b.title));
  } else if (sort === "newest"){
    filtered.sort((a,b)=> b.year-a.year || a.title.localeCompare(b.title));
  } else {
    filtered.sort((a,b)=> a.title.localeCompare(b.title) || b.year-a.year);
  }

  render();
  syncCounts();
  syncHashOpen();
}

function syncCounts(){
  resultCount.textContent = String(filtered.length);
  favCount.textContent = String(getFavs().size);
  emptyState.classList.toggle("hidden", filtered.length !== 0);
}

function render(){
  gallery.innerHTML = "";
  const favs = getFavs();
  const frag = document.createDocumentFragment();

  filtered.forEach((a, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${Math.min(i * 35, 220)}ms`;

    const tagBadges = a.tags.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("");

    card.innerHTML = `
      <div class="thumb">
        <img loading="lazy" src="${a.img}" alt="${escapeHtml(a.title)} artwork preview" />
        <div class="badges">
          ${a.featured ? `<span class="badge">featured</span>` : ``}
          <span class="badge">${a.year}</span>
          <span class="badge">${escapeHtml(a.artist)}</span>
        </div>
        <button class="fav ${favs.has(a.id) ? "is-on" : ""}" type="button" aria-label="Toggle favorite" data-fav="${a.id}">
          ${favs.has(a.id) ? "★" : "☆"}
        </button>
      </div>

      <div class="card__body">
        <div class="card__titleRow">
          <h3>${escapeHtml(a.title)}</h3>
          <span class="muted" style="font-size:12px">${a.year}</span>
        </div>
        <p class="card__desc">${escapeHtml(a.desc)}</p>
        <div class="card__meta">${tagBadges}</div>
        <button class="btn open" type="button" data-open="${a.id}">Open</button>
      </div>
    `;

    frag.appendChild(card);
  });

  gallery.appendChild(frag);
}

function toggleFavorite(id){
  const favs = getFavs();
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  setFavs(favs);
}

function openModal(index){
  currentIndex = clamp(index, 0, filtered.length - 1);
  const a = filtered[currentIndex];
  if (!a) return;

  lastFocusEl = document.activeElement;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  modalTitle.textContent = a.title;
  modalMeta.textContent = `${a.artist} • ${a.year} • ${a.tags.join(" • ")}${a.featured ? " • featured" : ""}`;
  modalDesc.textContent = a.desc;

  modalImg.src = a.img;
  modalImg.alt = `${a.title} full view`;
  downloadLink.href = a.img;

  syncModalFavorite();
  closeBtn.focus();
}

function closeModal(){
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  modalImg.src = "";

  if (lastFocusEl && typeof lastFocusEl.focus === "function") lastFocusEl.focus();
}

function next(){
  if (!filtered.length) return;
  openModal((currentIndex + 1) % filtered.length);
}
function prev(){
  if (!filtered.length) return;
  openModal((currentIndex - 1 + filtered.length) % filtered.length);
}

function syncModalFavorite(){
  const a = filtered[currentIndex];
  const favs = getFavs();
  const on = favs.has(a.id);
  favBtnText.textContent = on ? "Remove Favorite" : "Add to Favorites";
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function debounce(fn, wait){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function syncHashOpen(){
  const hash = (location.hash || "").replace("#","");
  if (!hash) return;
  const idx = filtered.findIndex(a => a.id === hash);
  if (idx >= 0) openModal(idx);
}

$$(".tag").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".tag").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeTag = btn.dataset.tag;
    filterAndSort();
  });
});

searchInput.addEventListener("input", debounce(filterAndSort, 140));
sortSelect.addEventListener("change", filterAndSort);
viewSelect.addEventListener("change", filterAndSort);

yearRange.addEventListener("input", () => {
  yearValue.textContent = `≤ ${yearRange.value}`;
  filterAndSort();
});

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  sortSelect.value = "featured";
  viewSelect.value = "masonry";
  yearRange.value = yearRange.max;
  yearValue.textContent = `≤ ${yearRange.value}`;
  activeTag = "all";
  $$(".tag").forEach(b => b.classList.toggle("is-active", b.dataset.tag === "all"));
  filterAndSort();
});

clearFavsBtn.addEventListener("click", () => {
  localStorage.removeItem("arcadia_favs_v1");
  filterAndSort();
});

gallery.addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]");
  const open = e.target.closest("[data-open]");

  if (fav){
    toggleFavorite(fav.dataset.fav);
    filterAndSort();
    return;
  }
  if (open){
    const id = open.dataset.open;
    const idx = filtered.findIndex(a => a.id === id);
    location.hash = id;
    openModal(idx >= 0 ? idx : 0);
  }
});

favBtn.addEventListener("click", () => {
  const a = filtered[currentIndex];
  toggleFavorite(a.id);
  syncModalFavorite();
  favCount.textContent = String(getFavs().size);
});

nextBtn.addEventListener("click", next);
prevBtn.addEventListener("click", prev);
closeBtn.addEventListener("click", () => {
  history.replaceState(null, "", location.pathname); // clears hash without jump
  closeModal();
});

modal.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true"){
    history.replaceState(null, "", location.pathname);
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  const isOpen = !modal.classList.contains("hidden");
  if (!isOpen) return;

  if (e.key === "Escape"){
    history.replaceState(null, "", location.pathname);
    closeModal();
  }
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();

  // basic focus trap
  if (e.key === "Tab"){
    const focusables = modal.querySelectorAll('button, a, img, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
});

yearValue.textContent = `≤ ${yearRange.value}`;
filterAndSort();