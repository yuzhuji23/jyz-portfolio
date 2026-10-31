const field = document.querySelector(".field");
const mark = document.querySelector(".mark");
const glow = document.getElementById("glow");
const figureHit = document.querySelector(".figure-hit");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function openRoom(id, cx, cy) {
  const room = document.getElementById("room-" + id);
  if (!room) return;
  document.querySelectorAll(".room.is-on").forEach((open) => {
    open.classList.remove("is-on");
    open.inert = true;
  });
  room.style.setProperty("--cx", cx);
  room.style.setProperty("--cy", cy);
  room.inert = false;
  room.classList.add("is-on");
  document.body.classList.add("in-room");
}

function closeRoom() {
  document.querySelectorAll(".room.is-on").forEach((open) => {
    open.classList.remove("is-on");
    open.inert = true;
  });
  document.body.classList.remove("in-room");
  delete document.body.dataset.hover;
}

function openDetail(id, cx, cy) {
  document.querySelectorAll(".room.is-detail.is-on").forEach((open) => {
    open.classList.remove("is-on");
    open.inert = true;
  });
  const room = document.getElementById("room-" + id);
  if (!room) return;
  const parent = document.getElementById(room.dataset.parent || "");
  if (parent) parent.inert = true;
  room.style.setProperty("--cx", cx);
  room.style.setProperty("--cy", cy);
  room.inert = false;
  room.classList.add("is-on");
  document.body.classList.add("in-room");
}

function closeDetail() {
  const detail = document.querySelector(".room.is-detail.is-on");
  if (!detail) return false;
  detail.classList.remove("is-on");
  detail.inert = true;
  const parent = document.getElementById(detail.dataset.parent || "");
  if (parent && parent.classList.contains("is-on")) parent.inert = false;
  return true;
}

field.addEventListener("click", (event) => {
  const node = event.target.closest(".node");
  if (!node) return;
  const planet = node.querySelector(".planet");
  const rect = (planet || node).getBoundingClientRect();
  const cx = ((rect.left + rect.width / 2) / window.innerWidth) * 100 + "%";
  const cy = ((rect.top + rect.height / 2) / window.innerHeight) * 100 + "%";
  openRoom(node.dataset.room, cx, cy);
});

field.addEventListener("pointerover", (event) => {
  const node = event.target.closest(".node");
  if (node) document.body.dataset.hover = node.dataset.room;
});

field.addEventListener("pointerout", (event) => {
  const node = event.target.closest(".node");
  if (!node) return;
  if (node.contains(event.relatedTarget)) return;
  if (!document.body.classList.contains("in-room")) delete document.body.dataset.hover;
});

mark.addEventListener("click", () => {
  if (document.body.classList.contains("in-room")) closeRoom();
});

figureHit.addEventListener("click", () => {
  const rect = figureHit.getBoundingClientRect();
  const cx = ((rect.left + rect.width / 2) / window.innerWidth) * 100 + "%";
  const cy = ((rect.top + rect.height / 2) / window.innerHeight) * 100 + "%";
  openRoom(figureHit.dataset.room, cx, cy);
});

function clickedBlank(event) {
  const target = event.target;
  if (target.closest("button, a, img")) return false;
  return target === event.currentTarget || target.matches(".room-inner, .split-copy, .lane, .stack, .rail, .posts, .frames");
}

function stepBack(room) {
  if (room.classList.contains("is-detail")) closeDetail();
  else closeRoom();
}

document.querySelectorAll(".room").forEach((room) => {
  room.addEventListener("click", (event) => {
    const post = event.target.closest(".post");
    if (room.classList.contains("has-posts") && post) {
      const planet = post.querySelector(".planet");
      const rect = (planet || post).getBoundingClientRect();
      const cx = ((rect.left + rect.width / 2) / window.innerWidth) * 100 + "%";
      const cy = ((rect.top + rect.height / 2) / window.innerHeight) * 100 + "%";
      openDetail(post.dataset.room, cx, cy);
      return;
    }
    if (clickedBlank(event)) stepBack(room);
  });
});

const sheet = document.getElementById("sheet");
const sheetPages = document.getElementById("sheet-pages");
const courseworkSheet = document.getElementById("coursework-sheet");
pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";

function closeSheet() {
  sheet.hidden = true;
  sheetPages.hidden = true;
  sheetPages.replaceChildren();
  courseworkSheet.hidden = true;
}

function showImage(url) {
  courseworkSheet.hidden = true;
  sheetPages.hidden = false;
  sheetPages.replaceChildren();
  const img = document.createElement("img");
  img.src = url;
  img.alt = "";
  sheetPages.appendChild(img);
  sheet.hidden = false;
}

async function showPdf(url) {
  courseworkSheet.hidden = true;
  sheetPages.hidden = false;
  sheetPages.replaceChildren();
  sheet.hidden = false;
  const pdf = await pdfjsLib.getDocument(url).promise;
  const width = Math.min(920, window.innerWidth * 0.86);
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    sheetPages.appendChild(canvas);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  }
}

document.addEventListener("click", (event) => {
  const proof = event.target.closest(".proof");
  if (!proof) return;
  if (proof.dataset.image) showImage(proof.dataset.image);
  else if (proof.dataset.proof) showPdf(proof.dataset.proof);
  else {
    sheetPages.hidden = true;
    sheetPages.replaceChildren();
    courseworkSheet.hidden = false;
    sheet.hidden = false;
  }
});

sheet.addEventListener("click", (event) => {
  if (event.target === sheet) closeSheet();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!sheet.hidden) closeSheet();
  else if (!closeDetail()) closeRoom();
});

const orbits = document.getElementById("orbits");
const planets = [
  { room: "projects", ring: 1, angle: 220, mRing: 2, mAngle: 260 },
  { room: "interests", ring: 0, angle: 216, mRing: 1, mAngle: 256 },
  { room: "languages", ring: 0, angle: 196, mRing: 1, mAngle: 242 },
  { room: "contests", ring: 1, angle: 192, mRing: 2, mAngle: 236 },
  { room: "honors", ring: 2, angle: 190, mRing: 3, mAngle: 240 },
  { room: "research", ring: 2, angle: 214, mRing: 3, mAngle: 258 },
  { room: "internships", ring: 3, angle: 206, mRing: 2, mAngle: 248 },
  { room: "education", ring: 3, angle: 230, mRing: 3, mAngle: 250 }
];
let orbitKey = "";

function systemFrame(time) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mobile = w < 760;
  const cx = w * (mobile ? 1.08 : 0.96);
  const cy = h * (mobile ? 1.08 : 0.98);
  const rings = mobile ? [1.02, 1.34, 1.66, 2.0] : [0.5, 0.66, 0.82, 0.98];
  // 16:9 keeps the current fan. Wider screens compress vertically so the
  // top planet stays inside; taller screens open the fan so the top is used.
  const vCap = (cy - Math.min(124, h * 0.12)) / 0.81;
  const v = mobile ? w : Math.min(h * 0.58 * 16 / 9, vCap);
  const labelRoom = Math.min(168, Math.max(120, w * 0.1));
  const uCap = (cx - labelRoom) / 0.92;
  const u = mobile ? w : Math.min(w, uCap);
  const fig = document.querySelector(".figure").getBoundingClientRect();
  const body = {
    left: fig.left + fig.width * 0.04,
    top: fig.top + fig.height * 0.2,
    right: fig.right + 8,
    bottom: fig.bottom
  };
  const blocked = (x, y) => x > body.left - 28 && x < body.right && y > body.top - 16 && y < body.bottom + 12;
  const at = (ring, deg) => {
    const rad = deg * Math.PI / 180;
    const rx = rings[ring] * u;
    const ry = rings[ring] * v;
    return { x: cx + Math.cos(rad) * rx, y: cy + Math.sin(rad) * ry };
  };
  const drift = reduce ? 0 : Math.sin(time / 11000) * (mobile ? 4 : 5);
  planets.forEach((planet) => {
    const node = document.querySelector('.node[data-room="' + planet.room + '"]');
    if (!node) return;
    const ring = mobile ? planet.mRing : planet.ring;
    const base = mobile ? planet.mAngle : planet.angle;
    const p = at(ring, base + drift);
    node.style.left = p.x + "px";
    node.style.top = p.y + "px";
    const vx = p.x - cx;
    const vy = p.y - cy;
    node.classList.remove("out-left", "out-up");
    if (mobile || vy < vx) node.classList.add("out-up");
    else node.classList.add("out-left");
    const box = node.getBoundingClientRect();
    if (box.left < 10) {
      node.classList.remove("out-left");
      node.classList.add("out-up");
    }
    if (node.getBoundingClientRect().top < 8) node.classList.remove("out-up");
  });
  const key = w + "x" + h + ":" + Math.round(fig.width) + ":" + Math.round(fig.left);
  if (key !== orbitKey) {
    orbitKey = key;
    const ns = "http://www.w3.org/2000/svg";
    orbits.setAttribute("viewBox", "0 0 " + w + " " + h);
    orbits.replaceChildren();
    rings.forEach((ring) => {
      const rx = ring * u;
      const ry = ring * v;
      let d = "";
      let drawing = false;
      for (let deg = 176; deg <= 262; deg += 1.2) {
        const rad = deg * Math.PI / 180;
        const x = cx + Math.cos(rad) * rx;
        const y = cy + Math.sin(rad) * ry;
        if (x < -80 || y < -80 || x > w - 8 || y > h - 8 || blocked(x, y)) {
          drawing = false;
          continue;
        }
        d += (drawing ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " ";
        drawing = true;
      }
      [true, false].forEach((soft) => {
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", d);
        if (soft) path.setAttribute("class", "soft");
        orbits.appendChild(path);
      });
    });
    placeStars();
  }
  if (!reduce) requestAnimationFrame(systemFrame);
}

const starfield = document.getElementById("stars");
const starCtx = starfield.getContext("2d");
let dots = [];

function placeStars() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  starfield.width = Math.floor(window.innerWidth * dpr);
  starfield.height = Math.floor(window.innerHeight * dpr);
  starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const zones = [...document.querySelectorAll(".node, .mark")].map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      rad: Math.max(rect.width, rect.height) * 0.46
    };
  });
  zones.push({
    x: window.innerWidth * 0.86,
    y: window.innerHeight * 0.72,
    rad: Math.min(window.innerWidth, window.innerHeight) * 0.22
  });
  const count = Math.round((window.innerWidth * window.innerHeight) / 11000);
  dots = [];
  let guard = 0;
  while (dots.length < count && guard < count * 40) {
    guard += 1;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const clear = zones.every((zone) => {
      const dx = x - zone.x;
      const dy = y - zone.y;
      return dx * dx + dy * dy > zone.rad * zone.rad;
    });
    if (!clear) continue;
    const bright = Math.random() < 0.08;
    const warm = Math.random() < 0.12;
    dots.push({
      x,
      y,
      r: bright ? 1.15 + Math.random() * 0.45 : 0.4 + Math.random() * 0.5,
      a: bright ? 0.5 + Math.random() * 0.2 : 0.16 + Math.random() * 0.22,
      warm,
      p: Math.random() * Math.PI * 2,
      s: 0.35 + Math.random() * 0.7
    });
  }
}

function paintStars(time) {
  starCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const dot of dots) {
    const twinkle = reduce ? 1 : 0.62 + 0.38 * Math.sin(time * 0.0008 * dot.s + dot.p);
    const alpha = dot.a * twinkle;
    const core = dot.warm ? "255, 214, 186" : "244, 242, 236";
    starCtx.fillStyle = "rgba(" + core + ", " + (alpha * 0.28) + ")";
    starCtx.beginPath();
    starCtx.arc(dot.x, dot.y, dot.r * 3.4, 0, Math.PI * 2);
    starCtx.fill();
    starCtx.fillStyle = "rgba(" + core + ", " + alpha + ")";
    starCtx.beginPath();
    starCtx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    starCtx.fill();
  }
  if (!reduce) requestAnimationFrame(paintStars);
}

systemFrame(0);
paintStars(0);
function fitRooms() {
  const desktop = window.innerWidth >= 761;
  document.querySelectorAll(".room-inner, .lane, .stack").forEach((el) => {
    el.style.zoom = "1";
    if (!desktop) {
      el.style.zoom = "";
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.height < 2 || rect.width < 2) return;
    let zoom = Math.min((window.innerHeight * 0.92) / rect.height, (window.innerWidth * 0.96) / rect.width);
    if (!isFinite(zoom) || zoom <= 0) return;
    if (zoom > 1) zoom = 1;
    el.style.zoom = String(Math.round(zoom * 100) / 100);
  });
}

window.addEventListener("resize", () => {
  orbitKey = "";
  fitRooms();
  if (reduce) systemFrame(0);
});
fitRooms();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitRooms);

if (!reduce) {
  let tx = window.innerWidth * 0.5;
  let ty = window.innerHeight * 0.4;
  let x = tx;
  let y = ty;
  window.addEventListener("pointermove", (event) => {
    tx = event.clientX;
    ty = event.clientY;
  });
  const follow = () => {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    glow.style.transform = "translate(" + x + "px," + y + "px)";
    requestAnimationFrame(follow);
  };
  follow();
}
