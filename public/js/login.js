const loginBtn = document.querySelector(".login-button");
const modal = document.getElementById("loginModal");
const closeBtn = document.querySelector(".close-btn");

// function สำหรับเปิด modal
function openLoginModal() {
  modal.style.display = "flex";
}

// function ปิด
function closeLoginModal() {
  modal.style.display = "none";
}

// ปุ่ม login
if (loginBtn) {
  loginBtn.onclick = openLoginModal;
}

// ปุ่ม X
if (closeBtn) {
  closeBtn.onclick = closeLoginModal;
}

// กดนอกกรอบ modal จะปิด modal
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};