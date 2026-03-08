const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let index = 0;

function showSlide() {
  slides.forEach(s => s.classList.remove("active"));
  if (slides[index]) slides[index].classList.add("active");
}

function nextSlide() {
  index++;
  if (index >= slides.length) index = 0;
  showSlide();
}

function prevSlide() {
  index--;
  if (index < 0) index = slides.length - 1;
  showSlide();
}

if (nextBtn && prevBtn) {
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);
  setInterval(nextSlide, 4000);
}


/* =========================
   FLY TO CART ANIMATION
========================= */

document.addEventListener("click", function (e) {

  const btn = e.target.closest(".add-to-cart-btn, .cart-btn");
  if (!btn) return;

  const form = btn.closest("form");
  const cartIcon = document.querySelector("#cart-icon");
  const cartCount = document.querySelector("#cart-count");

  /* =========================
     FIND PRODUCT IMAGE
  ========================= */

  let img = document.querySelector("#mainImage");

  // fallback สำหรับ wishlist page
  if (!img) {
    const card = btn.closest(".wishlist-card");
    img = card ? card.querySelector(".wishlist-image") : null;
  }

  if (!img || !cartIcon || !form) return;

  /* =========================
     SIZE VALIDATION (FIX)
  ========================= */

  const sizeField = form.querySelector('[name="size"]');

  if (sizeField) {

    const sizeValue = sizeField.value;

    if (!sizeValue) {
      alert("Please select a size first");
      return;
    }

  }

  /* =========================
     CONTINUE ADD TO CART
  ========================= */

  e.preventDefault();

  const flyingImg = img.cloneNode(true);

  const imgRect = img.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  flyingImg.style.position = "fixed";
  flyingImg.style.left = imgRect.left + "px";
  flyingImg.style.top = imgRect.top + "px";
  flyingImg.style.width = imgRect.width + "px";
  flyingImg.style.zIndex = "9999";
  flyingImg.style.transition = "all 0.7s ease";

  document.body.appendChild(flyingImg);

  setTimeout(() => {

    flyingImg.style.left = cartRect.left + "px";
    flyingImg.style.top = cartRect.top + "px";
    flyingImg.style.width = "30px";
    flyingImg.style.opacity = "0.5";

  }, 20);

  setTimeout(() => {

    flyingImg.remove();

    fetch(form.action, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams(new FormData(form))
    })
      .then(res => res.json())
      .then(data => {

        if (data.success && cartCount) {

          cartCount.textContent = data.cartCount;

          /* cart bump animation */

          cartCount.classList.add("bump");

          setTimeout(() => {
            cartCount.classList.remove("bump");
          }, 300);
        }

      });

  }, 700);

});