const hamburger = document.querySelector('#hamburger');
const navbar = document.querySelector('#navbar');

hamburger.onclick = function() {
    navbar.classList.toggle("active");
}