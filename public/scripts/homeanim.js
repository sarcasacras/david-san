let slideIndex = 0;
showSlides();

function showSlides() {
  let slides = document.getElementsByClassName("slideshow-image");
  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  slides[slideIndex - 1].classList.add("active");
  if (slideIndex === slides.length) {
    clearInterval(intervalId);
  }
}

const intervalId = setInterval(showSlides, 400);