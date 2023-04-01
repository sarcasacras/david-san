window.addEventListener('scroll', function () {
    const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
    const topButton = document.querySelector('.to-the-top');
    if (scrollPosition > 1500) {
        topButton.classList.add('shown');
    } else {
        topButton.classList.remove('shown');
    }
});