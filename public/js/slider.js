document.addEventListener("DOMContentLoaded", () => {

const slides = document.querySelectorAll(".slide");
const next = document.querySelector(".slider-arrow.next");
const prev = document.querySelector(".slider-arrow.prev");
const dotsContainer = document.querySelector(".dots");

if (!slides.length) return;

let heroIndex = 0;
let autoSlide;

/* CREATE DOTS */

slides.forEach((_, i) => {

  const dot = document.createElement("span");
  dot.classList.add("dot");

  if (i === 0) dot.classList.add("active");

  dot.addEventListener("click", () => {
    heroIndex = i;
    updateSlider();
    restartAuto();
  });

  dotsContainer.appendChild(dot);

});

const dots = document.querySelectorAll(".dot");

/* UPDATE */

function updateSlider(){

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[heroIndex].classList.add("active");
  dots[heroIndex].classList.add("active");

}

/* NEXT */

function nextSlide(){
  heroIndex = (heroIndex + 1) % slides.length;
  updateSlider();
}

/* PREV */

function prevSlide(){
  heroIndex = (heroIndex - 1 + slides.length) % slides.length;
  updateSlider();
}

next.addEventListener("click", () => {
  nextSlide();
  restartAuto();
});

prev.addEventListener("click", () => {
  prevSlide();
  restartAuto();
});

/* AUTO */

function startAuto(){
  autoSlide = setInterval(nextSlide, 5000);
}

function restartAuto(){
  clearInterval(autoSlide);
  startAuto();
}

startAuto();

});