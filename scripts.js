/**
 * Remin - Main JavaScript File
 * Contains all functionality for the Remin website
 */

document.addEventListener('DOMContentLoaded', function() {
    // --- NAVIGATION ---
    setupSmoothScrolling();
    setupHeaderScroll();
    setupHamburgerMenu();
    
    // --- PRODUCTS ---
    setupProductFilters();
    setupLightbox();
    
    // --- CONTACT ---
    setupContactForm();
    setupChatbot();
    
    // --- MISC ---
    setupFooterYear();
    
    // --- ADMIN ---
    checkAdminAccess();
});

// --- NAVIGATION FUNCTIONS ---

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function setupHeaderScroll() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        hamburger.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                navLinks.classList.toggle('active');
            }
        });
    }
}

// --- PRODUCT FUNCTIONS ---

// --- PRODUCT FILTERS ---
function setupProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const productSearch = document.getElementById('productSearch');
    const resetFilters = document.getElementById('resetFilters');
    const clearSearch = document.querySelector('.clear-search');
    const activeFiltersContainer = document.querySelector('.active-filters');
    const productsGrid = document.querySelector('.products-grid');
    
    // Log degli elementi trovati per debug
    console.log('Filter buttons:', filterButtons.length);
    console.log('Product cards:', productCards.length);
    console.log('Product search:', productSearch);
    console.log('Reset filters:', resetFilters);
    console.log('Clear search:', clearSearch);
    console.log('Active filters container:', activeFiltersContainer);
    console.log('Products grid:', productsGrid);
    
    if (!productsGrid) return;
    
    let activeFilters = {
        type: 'all',
        milk: 'all'
    };
    
    // Setup clickable tags in product cards
    if (productCards.length > 0) {
        setupClickableTags();
    }
    
    // Ordina i prodotti per peso (dal più basso al più alto)
    sortProductsByWeight();function updateProductVisibility() {
        const searchTerm = productSearch?.value.toLowerCase() || '';
        let visibleCount = 0;
        
        // Ottieni i prodotti aggiornati
        const updatedProductCards = document.querySelectorAll('.product-card');
        
        updatedProductCards.forEach(card => {
            const titleElement = card.querySelector('.product-title');
            if (!titleElement) {
                console.warn('Product card found without title element', card);
                return;
            }
            
            const title = titleElement.textContent.toLowerCase();
            const matchesSearch = !searchTerm || title.includes(searchTerm);
            const matchesType = activeFilters.type === 'all' || card.getAttribute('data-type') === activeFilters.type;
            const matchesMilk = activeFilters.milk === 'all' || card.getAttribute('data-milk') === activeFilters.milk;
            const isVisible = (matchesSearch && matchesType && matchesMilk);
            
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleCount++;
        });
        
        // Update filter visibility
        updateActiveFiltersDisplay();
          // Show message when no products match
        const noResultsMsg = document.getElementById('no-results-message');
        if (visibleCount === 0 && updatedProductCards.length > 0) {
            if (!noResultsMsg) {
                const msg = document.createElement('div');
                msg.id = 'no-results-message';
                msg.className = 'no-results';
                msg.innerHTML = `
                    <p>Nessun prodotto corrisponde ai criteri di ricerca.</p>
                    <button class="reset-filters visible">Cancella filtri</button>
                `;
                const productsGridElement = document.querySelector('.products-grid');
                if (productsGridElement) {
                    productsGridElement.appendChild(msg);
                    
                    msg.querySelector('button').addEventListener('click', () => {
                        resetAllFilters();
                    });
                }
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
        
        // Mantieni l'ordinamento per peso anche dopo l'applicazione dei filtri
        if (visibleCount > 0) {
            sortProductsByWeight();
        }
    }

    function updateActiveFiltersDisplay() {
        if (!activeFiltersContainer) return;
        
        // Clear current active filters
        activeFiltersContainer.innerHTML = '';
        
        // Check if any filter is active
        const hasActiveFilters = Object.values(activeFilters).some(val => val !== 'all') || 
                              (productSearch && productSearch.value.trim() !== '');
        
        // Update reset filters button visibility
        if (resetFilters) {
            resetFilters.classList.toggle('visible', hasActiveFilters);
        }
        
        // Add active filter tags
        if (activeFilters.type !== 'all') {
            addActiveFilterTag('type', getFilterLabel('type', activeFilters.type));
        }
        
        if (activeFilters.milk !== 'all') {
            addActiveFilterTag('milk', getFilterLabel('milk', activeFilters.milk));
        }
        
        if (productSearch && productSearch.value.trim() !== '') {
            addActiveFilterTag('search', `"${productSearch.value.trim()}"`);
        }
    }
      function addActiveFilterTag(filterType, label) {
        if (!activeFiltersContainer) {
            console.warn('Active filters container not found');
            return;
        }
        
        const tag = document.createElement('div');
        tag.className = 'active-filter';
        tag.innerHTML = `
            <span>${label}</span>
            <span class="remove-filter" data-filter="${filterType}">&times;</span>
        `;
        
        activeFiltersContainer.appendChild(tag);
        
        const removeBtn = tag.querySelector('.remove-filter');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (filterType === 'search' && productSearch) {
                    productSearch.value = '';
                } else {
                    activeFilters[filterType] = 'all';
                    
                    // Update UI to show the "all" button as active
                    document.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`).forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    const allButton = document.querySelector(`.filter-btn[data-filter="${filterType}"][data-value="all"]`);
                    if (allButton) {
                        allButton.classList.add('active');
                    }
                }
                
                updateProductVisibility();
            });
        }
    }
    
    function getFilterLabel(filterType, value) {
        // Find the button with the corresponding filter type and value
        const button = document.querySelector(`.filter-btn[data-filter="${filterType}"][data-value="${value}"]`);
        return button ? button.textContent : value;
    }
      function setupClickableTags() {
        // Verifica se ci sono spec-item prima di procedere
        const specItems = document.querySelectorAll('.product-specs .spec-item');
        if (specItems.length === 0) {
            console.warn('No spec items found for clickable tags');
            return;
        }
        
        console.log('Setting up clickable tags for', specItems.length, 'spec items');
        
        // Add clickable class to all spec items
        specItems.forEach(tag => {
            const text = tag.textContent.toLowerCase();
            
            // Determine if this tag represents a filter we can apply
            let filterType = null;
            let filterValue = null;
              // Check for milk type tags
            if (text.includes('latte di capra') || text.includes('latte caprino')) {
                filterType = 'milk';
                // Se si tratta di un formaggio fresco, assegnare a goat, altrimenti assegnare a mix
                const parentCard = tag.closest('.product-card');
                if (parentCard && parentCard.getAttribute('data-type') === 'fresh') {
                    filterValue = 'goat'; // con latte di capra
                } else {
                    filterValue = 'mix';  // capra
                }
            } else if (text.includes('latte vaccino') || text.includes('mucca') || text.includes('vacca')) {
                filterType = 'milk';
                filterValue = 'cow';
            }
            // Check for cheese type tags based on the stagionatura mention
            else if (text.includes('stagionatura:')) {
                if (text.includes('fresco')) {
                    filterType = 'type';
                    filterValue = 'fresh';
                } else if (text.includes('erborinato')) {
                    filterType = 'type';
                    filterValue = 'erborinati';
                } else if (text.includes('muffettato')) {
                    filterType = 'type';
                    filterValue = 'mold';
                } else if (text.includes('le creazioni')) {
                    filterType = 'type';
                    filterValue = 'creations';
                }
            }
            
            // If we identified a valid filter, make the tag clickable
            if (filterType && filterValue) {
                tag.classList.add('clickable-tag');
                tag.dataset.filterType = filterType;
                tag.dataset.filterValue = filterValue;
                
                tag.addEventListener('click', () => {
                    applyFilter(filterType, filterValue);
                });
            }
        });
    }
    
    function applyFilter(filterType, filterValue) {
        activeFilters[filterType] = filterValue;
        
        // Update UI to show the correct button as active
        document.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`).forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.filter-btn[data-filter="${filterType}"][data-value="${filterValue}"]`)?.classList.add('active');
        
        // Scroll to products section
        document.getElementById('products')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        updateProductVisibility();
    }
      function resetAllFilters() {
        activeFilters = {
            type: 'all',
            milk: 'all'
        };
        
        if (productSearch) productSearch.value = '';
        
        // Reset all filter buttons
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'all') {
                btn.classList.add('active');
            }
        });
        
        updateProductVisibility();
        
        // Assicurati che i prodotti siano ancora ordinati per peso
        sortProductsByWeight();
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.getAttribute('data-filter');
            const value = button.getAttribute('data-value');
            const group = button.closest('.filter-group');
            group.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeFilters[filterType] = value;
            updateProductVisibility();
        });
    });

    if (productSearch) {
        productSearch.addEventListener('input', updateProductVisibility);
        
        // Add enter key press handler
        productSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                updateProductVisibility();
            }
        });
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            if (productSearch) {
                productSearch.value = '';
                updateProductVisibility();
                productSearch.focus();
            }
        });
    }

    if (resetFilters) {
        resetFilters.addEventListener('click', resetAllFilters);
    }
    
    // Ordina i prodotti per peso (dal più basso al più alto)
    sortProductsByWeight();
    
    // Initial visibility setup
    updateProductVisibility();
    
    // Setup any new clickable tags that might get added dynamically
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                setupClickableTags();
            }
        });
    });
    
    observer.observe(document.querySelector('.products-grid'), {
        childList: true,
        subtree: true
    });
}

// Funzione per ordinare i prodotti per peso (grammi)
function sortProductsByWeight() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    const productCards = Array.from(productsGrid.querySelectorAll('.product-card'));
    
    // Estrai il peso da ogni scheda prodotto
    productCards.forEach(card => {
        // Se il peso non è già stato impostato nell'attributo data-weight o dobbiamo aggiornarlo
        // Cerca tutti gli elementi spec-item per trovare quello del peso
        const specItems = card.querySelectorAll('.spec-item');
        let weightFound = false;
        
        specItems.forEach(item => {
            // Cerca il tag del peso (formato: ⚖️ XXX g)
            if (item.textContent.includes('⚖️')) {
                const weightText = item.textContent;
                const weightMatch = weightText.match(/(\d+)\s*g/);
                
                if (weightMatch && weightMatch[1]) {
                    const weightGrams = parseInt(weightMatch[1], 10);
                    card.dataset.weight = weightGrams;
                    weightFound = true;
                }
            }
        });
        
        if (!weightFound) {
            card.dataset.weight = 9999; // Default alto per prodotti senza peso specificato
        }
    });
    
    // Ordina le schede per peso (dal più basso al più alto)
    const sortedCards = productCards.sort((a, b) => {
        const weightA = parseInt(a.dataset.weight, 10) || 9999;
        const weightB = parseInt(b.dataset.weight, 10) || 9999;
        return weightA - weightB;
    });
    
    // Svuota e ricrea il grid con le schede ordinate
    productsGrid.innerHTML = '';
    sortedCards.forEach(card => {
        productsGrid.appendChild(card);
    });
    
    console.log('Prodotti ordinati per peso (dal più basso al più alto)');
}

function setupLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (!lightbox) return;
    
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const productImages = document.querySelectorAll('.product-image img');

    productImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// --- CONTACT FUNCTIONS ---

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('nome');
            const email = document.getElementById('email');
            const telefono = document.getElementById('telefono');
            const messaggio = document.getElementById('messaggio');
            let valid = true;
            let msg = '';

            if (!nome || !nome.value.trim() || nome.value.length < 2) {
                valid = false;
                msg += 'Inserisci un nome valido.\n';
            }
            
            if (!email || !email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                valid = false;
                msg += 'Inserisci un indirizzo email valido.\n';
            }
            
            if (!messaggio || !messaggio.value.trim() || messaggio.value.length < 10) {
                valid = false;
                msg += 'Il messaggio deve contenere almeno 10 caratteri.\n';
            }

            if (!valid) {
                alert(msg);
                return;
            }

            // Salva il messaggio nel localStorage
            saveMessage({
                id: Date.now().toString(),
                nome: nome.value.trim(),
                email: email.value.trim(),
                telefono: telefono ? telefono.value.trim() : '',
                messaggio: messaggio.value.trim(),
                data: new Date().toISOString(),
                letto: false
            });

            alert('Grazie per il tuo messaggio! Ti risponderemo al più presto.');
            contactForm.reset();
        });
    }
}

function saveMessage(message) {
    // Recupera i messaggi esistenti
    let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Aggiungi il nuovo messaggio
    messages.push(message);
    
    // Salva nel localStorage
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

// --- ADMIN FUNCTIONALITY ---
function checkAdminAccess() {
    // Check if we're on the admin page
    if (window.location.pathname.includes('admin.html')) {
        console.log('Rilevata pagina admin - inizializzazione pannello admin...');
        setupAdminPanel();
    }
}

function setupAdminPanel() {
    const loginForm = document.getElementById('admin-login-form');
    const adminPanel = document.getElementById('admin-panel');
    const logoutBtn = document.getElementById('admin-logout');
    const errorMessage = document.getElementById('login-error');
    
    console.log('Setup pannello admin iniziato');
    console.log('Login form found:', !!loginForm);
    console.log('Admin panel found:', !!adminPanel);
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    console.log('Stato login:', isLoggedIn);
    
    if (loginForm && adminPanel) {
        // Show/hide appropriate sections
        loginForm.style.display = isLoggedIn ? 'none' : 'block';
        adminPanel.style.display = isLoggedIn ? 'block' : 'none';
        
        // If logged in, load admin content
        if (isLoggedIn) {
            console.log('Utente già loggato, caricamento contenuti admin...');
            if (typeof loadMessages === 'function') loadMessages();
            if (typeof loadProducts === 'function') loadProducts();
        }
    }
    
    // Handle login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Tentativo di login in corso...');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('Username inserito:', username);
            console.log('Password inserita:', password.replace(/./g, '*'));
            
            // Debug login hardcoded
            if (username === 'admin' && password === 'formaggio2023') {
                console.log('Credenziali valide! Accesso consentito.');
                localStorage.setItem('adminLoggedIn', 'true');
                
                // Nascondi il form di login
                loginForm.style.display = 'none';
                
                // Mostra il pannello admin
                if (adminPanel) {
                    adminPanel.style.display = 'block';
                    
                    // Carica i dati
                    if (typeof loadMessages === 'function') loadMessages();
                    if (typeof loadProducts === 'function') loadProducts();
                } else {
                    console.error('Pannello admin non trovato!');
                }
                
                // Pulisci eventuali messaggi di errore
                if (errorMessage) {
                    errorMessage.style.display = 'none';
                }
            } else {
                console.log('Credenziali non valide!');
                
                // Mostra messaggio di errore
                if (errorMessage) {
                    errorMessage.textContent = 'Username o password non validi. Riprova.';
                    errorMessage.style.display = 'block';
                } else {
                    alert('Credenziali non valide!');
                }
            }
        });
    } else {
        console.error('Form di login non trovato!');
    }
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.reload();
        });
    }
    
    // Handle tabs
    if (tabLinks.length > 0) {
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all tabs
                tabLinks.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to current tab
                this.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => content.style.display = 'none');
                
                // Show the target tab content
                const targetId = this.getAttribute('data-tab');
                document.getElementById(targetId).style.display = 'block';
            });
        });
    }
    
    // --- MESSAGES FUNCTIONALITY ---
    setupMessagesPanel();
    
    // --- PRODUCTS FUNCTIONALITY ---
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productData = {
                id: document.getElementById('product-id').value || Date.now().toString(),
                title: document.getElementById('product-title').value,
                type: document.getElementById('product-type').value,
                milk: document.getElementById('product-milk').value,
                weight: document.getElementById('product-weight').value,
                packaging: document.getElementById('product-packaging').value,
                aging: document.getElementById('product-aging').value
            };
            
            saveProduct(productData);
            productForm.reset();
            document.getElementById('product-id').value = '';
            loadProducts();
        });
    }
}

function setupMessagesPanel() {
    const messagesList = document.getElementById('messages-list-body');
    const selectAllCheckbox = document.getElementById('select-all-messages');
    const deleteSelectedBtn = document.getElementById('delete-selected-messages');
    const refreshBtn = document.getElementById('refresh-messages');
    const searchInput = document.getElementById('search-messages-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const replyBtn = document.getElementById('reply-message');
    const deleteBtn = document.getElementById('delete-message');
    const modal = document.getElementById('reply-modal');
    const closeModal = document.querySelector('.modal .close');
    const replyForm = document.getElementById('reply-form');
    
    if (!messagesList) return;
    
    // Select all messages
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = messagesList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateDeleteSelectedButton();
        });
    }
    
    // Update delete selected button
    function updateDeleteSelectedButton() {
        if (!deleteSelectedBtn) return;
        
        const checkedBoxes = messagesList.querySelectorAll('input[type="checkbox"]:checked');
        deleteSelectedBtn.disabled = checkedBoxes.length === 0;
    }
    
    // Delete selected messages
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', function() {
            if (!confirm('Sei sicuro di voler eliminare i messaggi selezionati?')) return;
            
            const checkedBoxes = messagesList.querySelectorAll('input[type="checkbox"]:checked');
            const idsToDelete = Array.from(checkedBoxes).map(checkbox => checkbox.value);
            
            deleteMessages(idsToDelete);
            loadMessages();
            updateMessagePreview(null);
            
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
        });
    }
    
    // Refresh messages
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadMessages();
            updateMessagePreview(null);
        });
    }
    
    // Search messages
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterMessages(this.value.toLowerCase());
        });
    }
    
    // Clear search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                filterMessages('');
            }
        });
    }
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // When user clicks outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle reply form
    if (replyForm) {
        replyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const to = document.getElementById('reply-to').value;
            const subject = document.getElementById('reply-subject').value;
            const message = document.getElementById('reply-message').value;
            
            // In a real app, this would send an email
            alert(`Email inviata a: ${to}\nOggetto: ${subject}\nMessaggio: ${message}`);
            
            modal.style.display = 'none';
            replyForm.reset();
        });
    }
    
    // Reply to message
    if (replyBtn) {
        replyBtn.addEventListener('click', function() {
            const selectedMessage = getSelectedMessage();
            if (!selectedMessage || !modal) return;
            
            document.getElementById('reply-to').value = selectedMessage.email;
            document.getElementById('reply-subject').value = `Re: Contatto dal sito - ${selectedMessage.nome}`;
            
            // Add signature and quote to message
            const quoteText = selectedMessage.messaggio.split('\n').map(line => `> ${line}`).join('\n');
            document.getElementById('reply-message').value = `\n\n--\nIn risposta al messaggio di ${selectedMessage.nome}:\n\n${quoteText}`;
            
            modal.style.display = 'block';
        });
    }
    
    // Delete message
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const selectedMessage = getSelectedMessage();
            if (!selectedMessage) return;
            
            if (!confirm(`Sei sicuro di voler eliminare il messaggio da ${selectedMessage.nome}?`)) return;
            
            deleteMessages([selectedMessage.id]);
            loadMessages();
            updateMessagePreview(null);
        });
    }
}

function loadMessages() {
    const messagesList = document.getElementById('messages-list-body');
    if (!messagesList) return;
    
    // Get messages from localStorage
    let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Sort by date (newest first)
    messages.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Clear current list
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="empty-state" style="padding: 20px; text-align: center;">Nessun messaggio presente</div>';
        return;
    }
    
    // Add each message to the list
    messages.forEach(message => {
        const row = document.createElement('div');
        row.className = `message-item${message.letto ? '' : ' unread'}`;
        row.setAttribute('data-id', message.id);
        
        const date = new Date(message.data);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        row.innerHTML = `
            <input type="checkbox" value="${message.id}" onchange="updateDeleteSelectedButton()">
            <span class="sender-col">${message.nome}</span>
            <span class="subject-col">Contatto dal sito</span>
            <span class="date-col">${formattedDate}</span>
        `;
        
        row.addEventListener('click', function(e) {
            // Don't trigger if the checkbox was clicked
            if (e.target.type === 'checkbox') return;
            
            // Remove selected class from all rows
            messagesList.querySelectorAll('.message-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selected class to current row
            this.classList.add('selected');
            
            // Mark as read
            markMessageAsRead(message.id);
            
            // Show message preview
            updateMessagePreview(message);
        });
        
        messagesList.appendChild(row);
    });
}

function filterMessages(query) {
    const messagesList = document.getElementById('messages-list-body');
    if (!messagesList) return;
    
    const items = messagesList.querySelectorAll('.message-item');
    
    items.forEach(item => {
        const sender = item.querySelector('.sender-col').textContent.toLowerCase();
        const subject = item.querySelector('.subject-col').textContent.toLowerCase();
        const showItem = sender.includes(query) || subject.includes(query);
        
        item.style.display = showItem ? '' : 'none';
    });
}

function updateMessagePreview(message) {
    const previewSubject = document.getElementById('message-preview-subject');
    const previewSender = document.getElementById('message-preview-sender');
    const previewDate = document.getElementById('message-preview-date');
    const previewContent = document.getElementById('message-preview-content');
    const replyBtn = document.getElementById('reply-message');
    const deleteBtn = document.getElementById('delete-message');
    
    if (!previewSubject || !previewSender || !previewDate || !previewContent) return;
    
    if (!message) {
        previewSubject.textContent = 'Seleziona un messaggio';
        previewSender.textContent = '';
        previewDate.textContent = '';
        previewContent.innerHTML = '<p class="empty-state">Nessun messaggio selezionato</p>';
        
        if (replyBtn) replyBtn.disabled = true;
        if (deleteBtn) deleteBtn.disabled = true;
        return;
    }
    
    previewSubject.textContent = 'Contatto dal sito';
    previewSender.textContent = `${message.nome} <${message.email}>`;
    
    const date = new Date(message.data);
    const formattedDate = date.toLocaleDateString('it-IT', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    previewDate.textContent = formattedDate;
    
    let content = message.messaggio.replace(/\n/g, '<br>');
    
    if (message.telefono) {
        content = `<p><strong>Telefono:</strong> ${message.telefono}</p>` + content;
    }
    
    previewContent.innerHTML = `<div class="message-body">${content}</div>`;
    
    if (replyBtn) replyBtn.disabled = false;
    if (deleteBtn) deleteBtn.disabled = false;
}

function markMessageAsRead(id) {
    // Get messages from localStorage
    let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Find the message
    const index = messages.findIndex(m => m.id === id);
    
    if (index !== -1) {
        messages[index].letto = true;
        
        // Save back to localStorage
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Update UI
        const messageItem = document.querySelector(`.message-item[data-id="${id}"]`);
        if (messageItem) {
            messageItem.classList.remove('unread');
        }
    }
}

function getSelectedMessage() {
    const selectedItem = document.querySelector('.message-item.selected');
    if (!selectedItem) return null;
    
    const id = selectedItem.getAttribute('data-id');
    
    // Get messages from localStorage
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Find the message
    return messages.find(m => m.id === id);
}

function deleteMessages(ids) {
    // Get messages from localStorage
    let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Remove the messages
    messages = messages.filter(message => !ids.includes(message.id));
    
    // Save back to localStorage
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

function loadProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    // Get products from localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Clear current list
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nessun prodotto presente</td></tr>';
        return;
    }
    
    // Add each product to the list
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>${product.type}</td>
            <td>${product.milk}</td>
            <td>${product.weight}</td>
            <td>${product.packaging}</td>
            <td>${product.aging}</td>
            <td>
                <button class="edit-product" data-id="${product.id}">Modifica</button>
                <button class="delete-product" data-id="${product.id}">Elimina</button>
            </td>
        `;
        
        productsList.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

function saveProduct(productData) {
    // Get existing products
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Check if product already exists (for editing)
    const existingIndex = products.findIndex(p => p.id === productData.id);
    
    if (existingIndex >= 0) {
        // Update existing product
        products[existingIndex] = productData;
    } else {
        // Add new product
        products.push(productData);
    }
    
    // Save back to localStorage
    localStorage.setItem('products', JSON.stringify(products));
}

function editProduct(productId) {
    // Get products from localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Find the product
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Populate the form
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-title').value = product.title;
        document.getElementById('product-type').value = product.type;
        document.getElementById('product-milk').value = product.milk;
        document.getElementById('product-weight').value = product.weight;
        document.getElementById('product-packaging').value = product.packaging;
        document.getElementById('product-aging').value = product.aging;
        
        // Scroll to the form
        document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteProduct(productId) {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    
    // Get products from localStorage
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Remove the product
    products = products.filter(p => p.id !== productId);
    
    // Save back to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update products list
    loadProducts();
}



// --- MISC FUNCTIONS ---

function setupFooterYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}
