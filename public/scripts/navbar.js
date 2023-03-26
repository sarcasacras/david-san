const hamburger = document.querySelector('#hamburger');
const sidebar = document.querySelector('#sidebar');

hamburger.onclick = function() {
    sidebar.classList.toggle("active");
}