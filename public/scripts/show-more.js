// По умолчанию кнопка спрятана
const showMoreBtn = document.getElementById('show-more-btn');
showMoreBtn.style.display = 'none';

// Загружаем первые 3 картины
let numArtworks = 3;
let displayedArtworks = numArtworks;
const artworkContainer = document.getElementById('aw-container');
const artworks = document.querySelectorAll('.artwork');

for (let i = 0; i < artworks.length; i++) {
    if (i >= numArtworks) {
        artworks[i].style.display = 'none';
    }
}

// Добавляем EventListener на "Show More"
showMoreBtn.addEventListener('click', () => {
    numArtworks += 3;
    for (let i = displayedArtworks; i < artworks.length; i++) {
        if (i < numArtworks) {
            artworks[i].style.display = 'flex';
        } else {
            artworks[i].style.display = 'none';
        }
    }
    displayedArtworks = numArtworks;

    // Если все работы уже отображаются - убрать кнопку
    if (displayedArtworks >= artworks.length) {
        showMoreBtn.style.display = 'none';
    }
});

// Если не все уже отображаются - показать кнопку
if (artworks.length > numArtworks) {
    showMoreBtn.style.display = 'flex';
}