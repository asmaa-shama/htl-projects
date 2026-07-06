function loadVocab() {
    const localSet = JSON.parse(localStorage.getItem("set"));
    if (!localSet || !localSet.id) return;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/sets");
    xhr.onload = function() {
        if (xhr.status === 200) {
            const allSets = JSON.parse(xhr.responseText);
            const data = allSets.find(s => s.id === localSet.id);
            
            if (!data || !data.vocab) return;

            localStorage.setItem("set", JSON.stringify(data));

            const container = document.getElementById('vocabList');
            const totalSpan = document.getElementById('totalCards');
            container.replaceChildren();
            totalSpan.textContent = data.vocab.length;

            data.vocab.forEach((element, index) => {
                let carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if (index === 0) carouselItem.classList.add('active');

                let flipCard = document.createElement('div');
                flipCard.classList.add('flip-card', 'mx-auto');

                let flipCardInner = document.createElement('div');
                flipCardInner.classList.add('flip-card-inner');

                let flipCardFront = document.createElement('div');
                flipCardFront.classList.add('flip-card-front', 'shadow-sm');
                
                if (element.known === true) {
                    flipCardFront.classList.add('vocab-known-true');
                } else if (element.known === false) {
                    flipCardFront.classList.add('vocab-known-false');
                }

                flipCardFront.innerHTML = `<div class="card-content">
                                            <small class="text-muted d-block mb-4">Begriff</small>
                                            <h2 class="display-5">${element.word}</h2>
                                           </div>`;

                let flipCardBack = document.createElement('div');
                flipCardBack.classList.add('flip-card-back', 'shadow-sm');
                flipCardBack.innerHTML = `<div class="card-content">
                                            <small class="text-white-50 d-block mb-4">Definition</small>
                                            <h2 class="display-5">${element.def || '...'}</h2>
                                          </div>`;

                flipCard.addEventListener('click', () => {
                    flipCardInner.classList.toggle('flipped');
                });

                flipCardInner.appendChild(flipCardFront);
                flipCardInner.appendChild(flipCardBack);
                flipCard.appendChild(flipCardInner);
                carouselItem.appendChild(flipCard);
                container.appendChild(carouselItem);
            });
        }
    };
    xhr.send();

    const carouselEl = document.getElementById('vocabCarousel');
    carouselEl.addEventListener('slide.bs.carousel', event => {
        document.getElementById('currentCardIndex').textContent = event.to + 1;
    });
}
function markVocab(isCorrect) {
    const data = JSON.parse(localStorage.getItem("set"));
    if (!data || !data.vocab) return;

    const container = document.getElementById('vocabList');
    const activeItem = container.querySelector('.carousel-item.active');
    const allItems = Array.from(container.querySelectorAll('.carousel-item'));
    const currentIndex = allItems.indexOf(activeItem);

    if (currentIndex === -1) return;

    data.vocab[currentIndex].known = isCorrect;
    localStorage.setItem("set", JSON.stringify(data));

    const currentFrontCard = activeItem.querySelector('.flip-card-front');
    if (currentFrontCard) {
        currentFrontCard.classList.remove('vocab-known-true', 'vocab-known-false');
        if (isCorrect) {
            currentFrontCard.classList.add('vocab-known-true');
        } else {
            currentFrontCard.classList.add('vocab-known-false');
        }
    }

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `/sets/${data.id}/vocab/${currentIndex}`);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
        if (xhr.status === 200) {
            console.log(`Zustand gespeichert: ${isCorrect}`);
        } else {
            console.error("Fehler beim Senden des Status:", xhr.status);
        }
    };

    xhr.send(JSON.stringify({ known: isCorrect }));

    const carouselEl = document.getElementById('vocabCarousel');
    const carousel = bootstrap.Carousel.getInstance(carouselEl) || new bootstrap.Carousel(carouselEl);
    carousel.next();
}

document.addEventListener("DOMContentLoaded", loadVocab);