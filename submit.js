const $ = (sel) => document.querySelector(sel);

const form = $("#submitForm");
const msg = $("#formMsg");
const list = $("#submissionList");
const clearBtn = $("#clearSubsBtn");

const LS_SUBS = "arcadia_submissions_v1";

const getSubs = () => JSON.parse(localStorage.getItem(LS_SUBS) || "[]");
const setSubs = (subs) => localStorage.setItem(LS_SUBS, JSON.stringify(subs));

function renderSubs(){
  const subs = getSubs();
  list.innerHTML = "";

  if (!subs.length){
    list.innerHTML = `<p class="muted">No submissions yet.</p>`;
    return;
  }

  subs.slice().reverse().forEach(s => {
    const div = document.createElement("div");
    div.className = "subCard";
    div.innerHTML = `
      <strong>${escapeHtml(s.title)}</strong>
      <span class="muted">${escapeHtml(s.artist)} • ${s.year}</span>
      <span class="muted">${escapeHtml(s.tags.join(", "))}</span>
      <p class="muted" style="margin:8px 0 0">${escapeHtml(s.desc)}</p>
      <a class="btn btn--ghost" style="margin-top:10px" href="${s.img}" target="_blank" rel="noopener">Open Image</a>
    `;
    list.appendChild(div);
  });
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function cleanTags(raw){
  return raw
    .split(",")
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

function isImageUrl(url){
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
}

function showMsg(text, type="info"){
  msg.textContent = text;
  msg.style.color = type === "ok" ? "rgba(52,211,153,0.95)" : type === "bad" ? "rgba(251,113,133,0.95)" : "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  showMsg("");

  const fd = new FormData(form);
  const title = String(fd.get("title") || "").trim();
  const artist = String(fd.get("artist") || "").trim();
  const year = Number(fd.get("year"));
  const img = String(fd.get("img") || "").trim();
  const desc = String(fd.get("desc") || "").trim();
  const tags = cleanTags(String(fd.get("tags") || ""));

  if (title.length < 2 || title.length > 60) return showMsg("Title must be 2–60 characters.", "bad");
  if (artist.length < 2 || artist.length > 40) return showMsg("Artist name must be 2–40 characters.", "bad");
  if (!Number.isFinite(year) || year < 2010 || year > 2035) return showMsg("Year must be between 2010 and 2035.", "bad");
  if (!img.startsWith("http")) return showMsg("Image URL must start with http/https.", "bad");
  if (!isImageUrl(img)) return showMsg("Image URL should end in .jpg, .png, .webp, etc.", "bad");
  if (desc.length < 15 || desc.length > 220) return showMsg("Description must be 15–220 characters.", "bad");
  if (!tags.length) return showMsg("Add at least one tag.", "bad");

  const subs = getSubs();
  subs.push({ title, artist, year, img, desc, tags, created: Date.now() });
  setSubs(subs);

  form.reset();
  showMsg("Submitted! Saved locally for demo purposes.", "ok");
  renderSubs();
});

clearBtn.addEventListener("click", () => {
  localStorage.removeItem(LS_SUBS);
  renderSubs();
  showMsg("Submissions cleared.", "info");
});

renderSubs();