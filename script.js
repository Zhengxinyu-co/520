const photoSources = [
  "assets/photos/photo-01.jpg",
  "assets/photos/photo-02.jpg",
  "assets/photos/photo-03.jpg",
  "assets/photos/photo-04.jpg",
];

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const closeButton = lightbox.querySelector(".close-button");
const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll(".dot")];
const prevButton = document.querySelector(".slider-button.prev");
const nextButton = document.querySelector(".slider-button.next");
const musicButton = document.querySelector(".music-toggle");
const musicLabel = document.querySelector(".music-label");

let currentSlide = 0;
let slideTimer = window.setInterval(showNextSlide, 4200);
let audioContext;
let masterGain;
let musicNodes = [];
let isMusicPlaying = false;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentSlide);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentSlide);
  });
}

function showNextSlide() {
  showSlide(currentSlide + 1);
}

function resetSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(showNextSlide, 4200);
}

function createTone(frequency, delay) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.0001;

  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(audioContext.currentTime + delay);

  return { oscillator, gain };
}

function startMusic() {
  audioContext ||= new AudioContext();
  masterGain ||= audioContext.createGain();
  masterGain.gain.value = 0.16;
  masterGain.connect(audioContext.destination);

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const notes = [261.63, 329.63, 392, 523.25];
  musicNodes = notes.map((note, index) => createTone(note, index * 0.14));

  musicNodes.forEach(({ gain }, index) => {
    const now = audioContext.currentTime + index * 0.14;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 1.2);
    gain.gain.linearRampToValueAtTime(0.025, now + 3.8);
  });

  isMusicPlaying = true;
  musicButton.classList.add("is-playing");
  musicButton.setAttribute("aria-pressed", "true");
  musicLabel.textContent = "暂停音乐";
}

function stopMusic() {
  const stopAt = audioContext.currentTime + 0.4;

  musicNodes.forEach(({ oscillator, gain }) => {
    gain.gain.cancelScheduledValues(audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.0001, stopAt);
    oscillator.stop(stopAt + 0.1);
  });

  musicNodes = [];
  isMusicPlaying = false;
  musicButton.classList.remove("is-playing");
  musicButton.setAttribute("aria-pressed", "false");
  musicLabel.textContent = "播放音乐";
}

document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("click", () => {
    lightboxImage.src = card.dataset.photo;
    lightbox.showModal();
  });
});

prevButton.addEventListener("click", () => {
  showSlide(currentSlide - 1);
  resetSlideTimer();
});

nextButton.addEventListener("click", () => {
  showSlide(currentSlide + 1);
  resetSlideTimer();
});

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    resetSlideTimer();
  });
});

musicButton.addEventListener("click", () => {
  if (isMusicPlaying) {
    stopMusic();
    return;
  }

  startMusic();
});

closeButton.addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

lightbox.addEventListener("close", () => {
  lightboxImage.src = "";
});
