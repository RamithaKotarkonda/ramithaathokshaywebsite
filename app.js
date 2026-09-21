const video = document.querySelector("#journey-film");
const chapters = [...document.querySelectorAll(".chapter")];
const loading = document.querySelector("#loading");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const rsvpDialog = document.querySelector("#rsvp-dialog");
const openRsvp = document.querySelector("#open-rsvp");
const rsvpForm = rsvpDialog.querySelector(".rsvp-form");
const rsvpStorageKey = "engagement-rsvp-preview";

let targetProgress = 0;
let currentProgress = 0;
let frameRequest = 0;
let requestedTime = -1;
let pendingTime = -1;
let seekInFlight = false;

const clamp = (value, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

function readScrollProgress() {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  targetProgress = scrollRange > 0 ? clamp(window.scrollY / scrollRange) : 0;
}

function chapterOpacity(progress, start, peak, end) {
  if (progress < start || progress > end) return 0;
  if (start === 0 && progress <= peak) return 1;
  if (end === 1 && progress >= peak) return 1;
  if (progress <= peak) return clamp((progress - start) / (peak - start));
  return clamp((end - progress) / (end - peak));
}

function updateChapters(progress) {
  chapters.forEach((chapter) => {
    const start = Number(chapter.dataset.start);
    const peak = Number(chapter.dataset.peak);
    const end = Number(chapter.dataset.end);
    const opacity = chapterOpacity(progress, start, peak, end);
    const offset = (1 - opacity) * 24;

    chapter.style.opacity = opacity.toFixed(3);
    chapter.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    chapter.classList.toggle("is-visible", opacity > 0.01);
    chapter.setAttribute("aria-hidden", opacity <= 0.01 ? "true" : "false");
  });
}

function seekVideo(progress) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;

  pendingTime = clamp(progress) * Math.max(video.duration - 0.05, 0);
  flushVideoSeek();
}

function flushVideoSeek() {
  if (seekInFlight || pendingTime < 0) return;
  if (Math.abs(video.currentTime - pendingTime) < 1 / 30) {
    requestedTime = pendingTime;
    return;
  }

  requestedTime = pendingTime;
  seekInFlight = true;
  video.currentTime = requestedTime;
}

function animate() {
  const easing = reducedMotion.matches ? 1 : 0.085;
  currentProgress += (targetProgress - currentProgress) * easing;

  if (Math.abs(targetProgress - currentProgress) < 0.0001) {
    currentProgress = targetProgress;
  }

  document.documentElement.style.setProperty("--page-progress", currentProgress.toFixed(4));
  seekVideo(targetProgress);
  updateChapters(currentProgress);
  frameRequest = window.requestAnimationFrame(animate);
}

function markReady() {
  loading.classList.add("is-ready");
  readScrollProgress();
  seekVideo(targetProgress);
}

function handleVideoError() {
  document.body.classList.add("video-unavailable");
  markReady();
}

async function loadSeekableVideo() {
  const sourceUrl = video.dataset.src;

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Video request failed: ${response.status}`);

    const objectUrl = URL.createObjectURL(await response.blob());
    video.src = objectUrl;
    video.load();
    window.addEventListener("pagehide", () => URL.revokeObjectURL(objectUrl), { once: true });
  } catch {
    video.src = sourceUrl;
    video.load();
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    markReady();
    return;
  }

  video.addEventListener("loadeddata", markReady, { once: true });
  video.addEventListener("error", handleVideoError, { once: true });
}

window.addEventListener("scroll", readScrollProgress, { passive: true });
window.addEventListener("resize", readScrollProgress, { passive: true });
window.addEventListener("pagehide", () => window.cancelAnimationFrame(frameRequest));
video.addEventListener("seeked", () => {
  seekInFlight = false;
  if (Math.abs(pendingTime - requestedTime) >= 1 / 30) flushVideoSeek();
});

openRsvp.addEventListener("click", () => {
  const savedReply = JSON.parse(localStorage.getItem(rsvpStorageKey) || "null");
  if (savedReply) {
    Object.entries(savedReply).forEach(([name, value]) => {
      const field = rsvpForm.elements.namedItem(name);
      if (field) field.value = value;
    });
  }
  rsvpDialog.showModal();
});
rsvpDialog.addEventListener("click", (event) => {
  if (event.target === rsvpDialog) rsvpDialog.close();
});
rsvpForm.addEventListener("submit", () => {
  const reply = Object.fromEntries(new FormData(rsvpForm));
  localStorage.setItem(rsvpStorageKey, JSON.stringify(reply));
});

readScrollProgress();
updateChapters(0);
frameRequest = window.requestAnimationFrame(animate);
loadSeekableVideo();