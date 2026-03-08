const sliders = document.querySelectorAll(".product-slider");

sliders.forEach(slider => {

  const track = slider.querySelector(".product-track");
  const nextBtn = slider.querySelector(".product-arrow.next");
  const prevBtn = slider.querySelector(".product-arrow.prev");
  const cards = slider.querySelectorAll(".product-card");

  let index = 0;

  const cardWidth = cards[0].offsetWidth + 20;
  const visibleCards = 4; // how many are visible
  const maxIndex = cards.length - visibleCards;

  function updateSlider(){
    track.style.transform = `translateX(${-index * cardWidth}px)`;
  }

  nextBtn.onclick = () => {
    index++;

    if(index > maxIndex){
      index = 0; // LOOP BACK
    }

    updateSlider();
  };

  prevBtn.onclick = () => {
    index--;

    if(index < 0){
      index = maxIndex; // LOOP TO END
    }

    updateSlider();
  };

});