// По умолчанию кнопка спрятана
const showMoreBtn = document.getElementById('show-more-btn');
showMoreBtn.style.display = 'none';

// Загружаем первые 3 выставки
let numExhibitions = 3;
let displayedExhibitions = numExhibitions;
const artworkContainer = document.getElementById('aw-container');
const exhibitions = document.querySelectorAll('.exhibition');

for (let i = 0; i < exhibitions.length; i++) {
    if (i >= numExhibitions) {
        exhibitions[i].style.display = 'none';
    }
}

// Добавляем EventListener на "Show More"
showMoreBtn.addEventListener('click', () => {
    numExhibitions += 3;
    for (let i = displayedExhibitions; i < exhibitions.length; i++) {
        if (i < numExhibitions) {
            exhibitions[i].style.display = 'flex';
        } else {
            exhibitions[i].style.display = 'none';
        }
    }
    displayedExhibitions = numExhibitions;

    // Если все выставки уже отображаются - убрать кнопку
    if (displayedExhibitions >= exhibitions.length) {
        showMoreBtn.style.display = 'none';
    }
});

// Если не все уже отображаются - показать кнопку
if (exhibitions.length > numExhibitions) {
    showMoreBtn.style.display = 'flex';
}