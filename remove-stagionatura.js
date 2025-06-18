// Script per rimuovere tutti i riferimenti alla stagionatura e gestire le categorie
document.addEventListener('DOMContentLoaded', function() {
    // Seleziona tutti gli elementi con indicazione di stagionatura o categoria
    const specItems = document.querySelectorAll('.spec-item');
    
    // Filtra gli elementi relativi alla stagionatura e rimuovili
    specItems.forEach(function(element) {
        if (element.textContent.includes('Stagionatura:') || 
            element.textContent.includes('🕒 Stagionatura') ||
            element.textContent.includes('🕒 Categoria')) {
            element.remove();
        }
    });
    
    // Aggiorna anche le descrizioni dei prodotti
    const productDescriptions = document.querySelectorAll('.product-details p');
    productDescriptions.forEach(function(description) {
        if (description.textContent.toLowerCase().includes('stagionatura')) {
            // Rimuovi solo la frase che contiene "stagionatura"
            const text = description.textContent;
            const sentences = text.split('.');
            const filteredSentences = sentences.filter(sentence => 
                !sentence.toLowerCase().includes('stagionatura')
            );
            description.textContent = filteredSentences.join('.') + (sentences.length > filteredSentences.length ? '.' : '');
        }
    });
    
    // Correggi il link di Blu e nero se non è ancora stato risolto
    const bluENeroLinks = document.querySelectorAll('.product-image a');
    bluENeroLinks.forEach(link => {
        if (link.nextElementSibling && 
            link.nextElementSibling.tagName === 'IMG' && 
            link.nextElementSibling.alt === "Blu e nero" && 
            link.getAttribute('href') === '#') {
            link.setAttribute('href', 'BLU.png');
        }
    });
});
