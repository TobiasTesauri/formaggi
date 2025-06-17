/**
 * Remin Admin Panel 2.0
 * Sistema di gestione migliorato per l'amministrazione del sito Remin
 * Ultimo aggiornamento: 17/06/2025
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementi del DOM
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const adminDashboard = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logout-btn');
    const tabButtons = document.querySelectorAll('.list-group-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const addProductBtn = document.getElementById('add-product-btn');
    const productFormContainer = document.getElementById('product-form-container');
    const cancelProductBtn = document.getElementById('cancel-product');
    const productForm = document.getElementById('product-form');
    const productsList = document.getElementById('products-list');
    const messageList = document.getElementById('message-list');
    const messageContent = document.getElementById('message-content');
    const unreadCount = document.getElementById('unread-count');
    const lastLoginDate = document.getElementById('last-login-date');
    const totalProducts = document.getElementById('total-products');
    const totalCategories = document.getElementById('total-categories');
    const totalViews = document.getElementById('total-views');
    const popularProducts = document.getElementById('popular-products');
    
    // Inizializza la sessione
    initSession();
    
    // Funzionalità di login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember')?.checked || false;
            
            // Verifica credenziali
            if (username === 'admin' && password === 'formaggio2023') {
                // Login riuscito
                localStorage.setItem('adminLoggedIn', 'true');
                if (remember) {
                    localStorage.setItem('adminRemember', 'true');
                }
                
                // Mostra il dashboard e nascondi l'overlay di login
                loginOverlay.style.display = 'none';
                adminDashboard.classList.remove('hidden');
                
                // Mostra notifica
                showToast('Accesso effettuato con successo!', 'success');
                
                // Carica i dati
                loadProducts();
                loadMessages();
            } else {
                // Mostra errore
                if (loginError) {
                    loginError.style.display = 'block';
                    
                    // Animazione scuotimento
                    const loginContainer = loginError.parentElement;
                    loginContainer.classList.add('shake');
                    
                    setTimeout(() => {
                        loginContainer.classList.remove('shake');
                    }, 500);
                }
            }
        });
    }
    
    // Gestione logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminRemember');
            window.location.reload();
        });
    }
    
    // Gestione tab
    if (tabButtons) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Rimuovi classe active da tutti i tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Aggiungi classe active al tab selezionato
                this.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }
    
    // Gestione form prodotti
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            document.getElementById('form-title').textContent = 'Aggiungi Prodotto';
            document.getElementById('product-id').value = '';
            productForm.reset();
            productFormContainer.classList.remove('hidden');
        });
    }
    
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', function() {
            productFormContainer.classList.add('hidden');
        });
    }
      if (productForm) {        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Ottieni il form validato da Bootstrap
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            const productId = document.getElementById('product-id').value || Date.now().toString();
            const productName = document.getElementById('product-name').value;
            const productCategory = document.getElementById('product-category').value;
            const productMilk = document.getElementById('product-milk').value;
            const productWeight = document.getElementById('product-weight').value;
            const productStock = document.getElementById('product-stock').value;
            const productDescription = document.getElementById('product-description')?.value || '';
            
            // Ottieni immagine selezionata se presente
            let imageName = 'product-placeholder.jpg';
            const imageInput = document.getElementById('product-image');
            
            // Se stiamo modificando un prodotto esistente
            if (productId) {
                const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
                const existingProduct = existingProducts.find(p => p.id === productId);
                
                if (existingProduct && existingProduct.image) {
                    imageName = existingProduct.image;
                }
            }
            
            // Se è stata selezionata una nuova immagine
            if (imageInput && imageInput.files && imageInput.files.length > 0) {
                // In una app reale, qui caricheremmo l'immagine sul server
                // Per la demo, usiamo il nome del file se l'utente ha selezionato un'immagine
                imageName = imageInput.files[0].name;
                
                // Opzionale: verifichiamo che l'immagine esista nell'elenco delle immagini disponibili
                const availableImages = ['Aperitaly.png', 'Biancaneve.png', 'Blu di capra.png', 'blu mirtillo.png', 
                    'blu montis.png', 'BLU.png', 'Bucaneve.png', 'Caprifoglio.png', 'Cenerentola.png', 
                    'Dalila.png', 'Fiordaliso.png', 'Foglia.png', 'Giglio.png', 'gin.png', 'Girasole.png', 
                    'Grappa.png', 'La tenera.png', 'Lilia.png', 'Margherita.png', 'mini.png', 'Narciso.png', 
                    'Primula.png', 'ratafia.png', 'Robiolina.png', 'Robiolone mirtillo e pistacchio.png', 
                    'Robiolone.png', 'Rosita.png', 'rosso.png', 'Specialita-al-Tartufo.png', 
                    'Specialita-al-Tartufo.png.png', 'Stagionatura.png', 'Toma bianca.png', 
                    'Toma Stracchinata.png', 'Verde.png', 'Violetta.png', 'vite.png'];
                
                if (!availableImages.includes(imageName)) {
                    // Se l'immagine non esiste nella lista, cerchiamo di abbinare un'immagine con nome simile
                    for (const img of availableImages) {
                        if (img.toLowerCase().includes(productName.toLowerCase())) {
                            imageName = img;
                            break;
                        }
                    }
                }
            }
            
            // Crea oggetto prodotto
            const product = {
                id: productId,
                name: productName,
                category: productCategory,
                milk: productMilk,
                weight: productWeight,
                stock: productStock,
                description: productDescription,
                image: imageName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Salva prodotto
            saveProduct(product);
            
            // Aggiorna lista prodotti
            loadProducts();
            
            // Nascondi form
            productFormContainer.classList.add('hidden');
            
            // Mostra notifica
            showToast('Prodotto salvato con successo!', 'success');
        });
    }
    
    // Aggiorna le statistiche della dashboard
    function updateDashboardStats() {
        // Conta prodotti
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        if (totalProducts) {
            totalProducts.textContent = products.length;
        }
        
        // Conta categorie uniche
        if (totalCategories) {
            const categories = [...new Set(products.map(p => p.category))];
            totalCategories.textContent = categories.length || 0;
        }
        
        // Simula visualizzazioni
        if (totalViews) {
            const views = localStorage.getItem('totalProductViews') || '1254';
            totalViews.textContent = views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        // Prodotti popolari
        if (popularProducts) {
            const popularCount = products.filter(p => p.popular).length;
            popularProducts.textContent = popularCount || Math.min(6, Math.ceil(products.length / 4));
        }
    }
    
    // Funzioni di utilità
    function initSession() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (isLoggedIn) {
            if (loginOverlay) loginOverlay.style.display = 'none';
            if (adminDashboard) adminDashboard.classList.remove('hidden');
            
            // Mostra l'ultimo accesso
            const savedLastLogin = localStorage.getItem('lastLoginDate');
            if (savedLastLogin && lastLoginDate) {
                lastLoginDate.textContent = savedLastLogin;
            }
            
            // Carica i dati iniziali
            loadProducts();
            loadMessages();
            updateDashboardStats();
        } else {
            if (loginOverlay) loginOverlay.style.display = 'flex';
            if (adminDashboard) adminDashboard.classList.add('hidden');
        }
    }
      function saveProduct(product) {
        // Ottieni i prodotti esistenti
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Controlla se il prodotto esiste già
        const index = products.findIndex(p => p.id === product.id);
        
        if (index !== -1) {
            // Aggiorna prodotto esistente
            // Mantieni l'immagine originale se non ne è stata selezionata una nuova
            if (product.image === 'product-placeholder.jpg' && products[index].image !== 'product-placeholder.jpg') {
                product.image = products[index].image;
            }
            products[index] = product;
        } else {
            // Aggiungi nuovo prodotto
            products.push(product);
        }
        
        // Salva nel localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        // Aggiorna le statistiche della dashboard
        updateDashboardStats();
        
        return product;
    }
      function loadProducts() {
        if (!productsList) return;
        
        // Ottieni i prodotti dal localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Pulisci lista esistente
        productsList.innerHTML = '';
        
        // Aggiorna le statistiche della dashboard
        updateDashboardStats();
        
        if (products.length === 0) {
            // Mostra messaggio se non ci sono prodotti
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <div class="empty-state">
                        <i class="fas fa-cheese"></i>
                        <p>Nessun prodotto presente</p>
                        <button id="add-sample-products" class="btn btn-outline-primary mt-3">
                            <i class="fas fa-plus-circle me-2"></i>Aggiungi prodotti di esempio
                        </button>
                    </div>
                </td>
            `;
            productsList.appendChild(emptyRow);
        } else {
            // Popola la tabella con i prodotti
            products.forEach(product => {
                const row = document.createElement('tr');
                
                // Mappa le categorie ai nomi in italiano
                const categoryNames = {
                    'fresh': 'Freschi peso fisso',
                    'mold': 'Muffettati',
                    'creations': 'Le Creazioni',
                    'toma': 'Tome',
                    'erborinati': 'Erborinati'
                };
                
                // Mappa i tipi di latte ai nomi in italiano
                const milkNames = {
                    'cow': 'Mucca',
                    'goat': 'Capra',
                    'mix': 'Misto',
                    'sheep': 'Pecora'
                };
                  // Verifica se l'immagine esiste
                const checkImage = (imageSrc) => {
                    if (imageSrc === 'product-placeholder.jpg') {
                        return 'product-placeholder.jpg'; // Usa un placeholder generico
                    }
                    
                    // Lista di tutte le immagini prodotto disponibili
                    const availableImages = ['Aperitaly.png', 'Biancaneve.png', 'Blu di capra.png', 'blu mirtillo.png', 
                        'blu montis.png', 'BLU.png', 'Bucaneve.png', 'Caprifoglio.png', 'Cenerentola.png', 
                        'Dalila.png', 'Fiordaliso.png', 'Foglia.png', 'Giglio.png', 'gin.png', 'Girasole.png', 
                        'Grappa.png', 'La tenera.png', 'Lilia.png', 'Margherita.png', 'mini.png', 'Narciso.png', 
                        'Primula.png', 'ratafia.png', 'Robiolina.png', 'Robiolone mirtillo e pistacchio.png', 
                        'Robiolone.png', 'Rosita.png', 'rosso.png', 'Specialita-al-Tartufo.png', 
                        'Specialita-al-Tartufo.png.png', 'Stagionatura.png', 'Toma bianca.png', 
                        'Toma Stracchinata.png', 'Verde.png', 'Violetta.png', 'vite.png'];
                    
                    // Controlla se l'immagine specificata esiste nell'elenco
                    if (availableImages.includes(imageSrc)) {
                        return imageSrc;
                    }
                    
                    // Prova a trovare un'immagine simile
                    for (const img of availableImages) {
                        if (img.toLowerCase().includes(product.name.toLowerCase())) {
                            return img;
                        }
                    }
                    
                    // Se tutto fallisce, usa un'immagine casuale dall'elenco
                    return availableImages[Math.floor(Math.random() * availableImages.length)];
                };

                // Trova l'immagine corretta da usare
                const imageSrc = checkImage(product.image);
                
                row.innerHTML = `
                    <td>
                        <img src="${imageSrc}" alt="${product.name}" class="product-thumbnail">
                    </td>
                    <td>
                        <strong>${product.name}</strong>
                        ${product.description ? `<p class="small text-muted mb-0">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</p>` : ''}
                    </td>
                    <td><span class="badge bg-primary">${categoryNames[product.category] || product.category}</span></td>
                    <td><span class="badge bg-secondary">${milkNames[product.milk] || product.milk}</span></td>
                    <td>${product.weight || 'N/D'}</td>
                    <td>
                        <span class="badge ${product.stock > 5 ? 'bg-success' : 'bg-warning'}">${product.stock || '0'}</span>
                    </td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${product.id}" title="Modifica">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product.id}" title="Elimina">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                productsList.appendChild(row);
            });
            
            // Aggiungi event listener per edit e delete
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    editProduct(productId);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });
        }
    }
      function editProduct(productId) {
        // Ottieni i prodotti dal localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Trova il prodotto
        const product = products.find(p => p.id === productId);
        
        if (product) {
            // Popola il form
            document.getElementById('form-title').textContent = 'Modifica Prodotto';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-milk').value = product.milk;
            document.getElementById('product-weight').value = product.weight || '';
            document.getElementById('product-stock').value = product.stock || '0';
            
            // Popola la descrizione se esiste l'elemento e il prodotto ha una descrizione
            const descriptionField = document.getElementById('product-description');
            if (descriptionField && product.description) {
                descriptionField.value = product.description;
            }
            
            // Mostra il nome dell'immagine corrente
            const imageInput = document.getElementById('product-image');
            if (imageInput && product.image && product.image !== 'product-placeholder.jpg') {
                const fileInfo = document.createElement('div');
                fileInfo.className = 'mt-2 text-info';
                fileInfo.innerHTML = `<i class="fas fa-image me-1"></i> Immagine corrente: <strong>${product.image}</strong>`;
                
                // Rimuovi eventuali messaggi precedenti
                const existingInfo = imageInput.parentElement.querySelector('.text-info');
                if (existingInfo) {
                    existingInfo.remove();
                }
                
                // Aggiungi il nuovo messaggio
                imageInput.parentElement.appendChild(fileInfo);
            }
            
            // Mostra form
            productFormContainer.classList.remove('hidden');
        }
    }
    
    function deleteProduct(productId) {
        if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
            // Ottieni i prodotti dal localStorage
            let products = JSON.parse(localStorage.getItem('products') || '[]');
            
            // Rimuovi il prodotto
            products = products.filter(p => p.id !== productId);
            
            // Salva nel localStorage
            localStorage.setItem('products', JSON.stringify(products));
            
            // Aggiorna lista prodotti
            loadProducts();
            
            // Mostra notifica
            showToast('Prodotto eliminato con successo!', 'success');
        }
    }
      function loadMessages() {
        if (!messageList || !unreadCount) return;
        
        // Ottieni messaggi dal localStorage
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        
        // Conta messaggi non letti
        const unreadMessages = messages.filter(m => !m.letto);
        unreadCount.textContent = unreadMessages.length;
        
        // Se non ci sono messaggi, mostra l'avviso di aggiungere messaggi di esempio
        if (messages.length === 0) {
            messageList.innerHTML = `
                <div class="empty-state" style="padding: 2rem;">
                    <i class="fas fa-envelope-open"></i>
                    <p>Nessun messaggio presente</p>
                    <button id="add-sample-messages" class="btn btn-outline-primary mt-3">
                        <i class="fas fa-plus-circle me-2"></i>Aggiungi messaggi di esempio
                    </button>
                </div>
            `;
            
            // Reimposta il contenuto
            messageContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-envelope-open"></i>
                    <p>Nessun messaggio presente</p>
                </div>
            `;
            
            // Aggiungi event listener per il pulsante di aggiunta messaggi di esempio
            document.getElementById('add-sample-messages')?.addEventListener('click', function() {
                generateSampleData();
                loadMessages();
                showToast('Messaggi di esempio aggiunti con successo!', 'success');
            });
        } else {
            // Ordina messaggi per data (più recenti prima)
            messages.sort((a, b) => new Date(b.data) - new Date(a.data));
            
            // Usa la funzione renderMessagesList per popolare la lista dei messaggi
            renderMessagesList(messages);
        }
    }
    
    function showMessageContent(message) {
        if (!messageContent) return;
        
        const date = new Date(message.data);
        const formattedDate = date.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageContent.innerHTML = `
            <div class="message-header">
                <div class="message-header-top">
                    <h3 class="message-title">Messaggio da ${message.nome}</h3>
                    <div class="message-actions">
                        <button class="action-btn" onclick="replyToMessage('${message.email}')">
                            <i class="fas fa-reply"></i> Rispondi
                        </button>
                        <button class="action-btn danger" onclick="deleteMessage('${message.id}')">
                            <i class="fas fa-trash"></i> Elimina
                        </button>
                    </div>
                </div>
                <div class="message-info">
                    <span><strong>Da:</strong> ${message.nome} (${message.email})</span>
                    <span><strong>Data:</strong> ${formattedDate}</span>
                    ${message.telefono ? `<span><strong>Tel:</strong> ${message.telefono}</span>` : ''}
                </div>
            </div>
            <div class="message-body">
                ${message.messaggio.replace(/\n/g, '<br>')}
            </div>
        `;
    }
    
    function markMessageAsRead(messageId) {
        // Ottieni messaggi dal localStorage
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        
        // Trova il messaggio
        const index = messages.findIndex(m => m.id === messageId);
        
        if (index !== -1) {
            // Segna come letto
            messages[index].letto = true;
            
            // Salva nel localStorage
            localStorage.setItem('contactMessages', JSON.stringify(messages));
        }
    }
    
    // Funzione globale per rispondere a un messaggio
    window.replyToMessage = function(email) {
        alert(`La funzionalità di risposta a ${email} sarà disponibile nella prossima versione.`);
    };
    
    // Funzione globale per eliminare un messaggio
    window.deleteMessage = function(messageId) {
        if (confirm('Sei sicuro di voler eliminare questo messaggio?')) {
            // Ottieni messaggi dal localStorage
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            
            // Rimuovi il messaggio
            messages = messages.filter(m => m.id !== messageId);
            
            // Salva nel localStorage
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            // Aggiorna lista messaggi
            loadMessages();
            
            // Mostra notifica
            showToast('Messaggio eliminato con successo!', 'success');
            
            // Reimposta il contenuto
            messageContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-envelope-open"></i>
                    <p>Seleziona un messaggio per visualizzarne il contenuto</p>
                </div>
            `;
        }
    };
    
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast || !toastMessage) return;
        
        // Imposta il messaggio
        toastMessage.textContent = message;
        
        // Imposta il tipo
        toast.className = 'toast';
        toast.classList.add(type);
        
        // Mostra il toast
        toast.classList.remove('hidden');
        
        // Nascondi il toast dopo 3 secondi
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }    // Genera dati di esempio se non esistono già
    function generateSampleData() {
        // Controlla se esistono già dei prodotti
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        if (products.length === 0) {
            // Aggiungi prodotti di esempio con tutte le immagini disponibili
            const sampleProducts = [
                {
                    id: '1',
                    name: 'Blu di Capra',
                    category: 'erborinati',
                    milk: 'goat',
                    weight: '2000g',
                    stock: '10',
                    description: 'Formaggio erborinato di capra dal gusto intenso e piacevolmente piccante.',
                    image: 'Blu di capra.png'
                },
                {
                    id: '2',
                    name: 'Robiolone',
                    category: 'mold',
                    milk: 'goat',
                    weight: '2000g',
                    stock: '8',
                    description: 'Formaggio morbido a crosta fiorita, dalla consistenza cremosa.',
                    image: 'Robiolone.png'
                },
                {
                    id: '3',
                    name: 'Primula',
                    category: 'fresh',
                    milk: 'goat',
                    weight: '35g',
                    stock: '25',
                    description: 'Piccolo formaggio fresco dal gusto delicato e leggero.',
                    image: 'Primula.png'
                },
                {
                    id: '4',
                    name: 'Biancaneve',
                    category: 'fresh',
                    milk: 'cow',
                    weight: '250g',
                    stock: '15',
                    description: 'Formaggio fresco dalla consistenza morbida e il sapore dolce.',
                    image: 'Biancaneve.png'
                },
                {
                    id: '5',
                    name: 'Cenerentola',
                    category: 'mold',
                    milk: 'cow',
                    weight: '300g',
                    stock: '12',
                    description: 'Formaggio a crosta fiorita con un cuore morbido.',
                    image: 'Cenerentola.png'
                },
                {
                    id: '6',
                    name: 'Caprifoglio',
                    category: 'toma',
                    milk: 'goat',
                    weight: '500g',
                    stock: '7',
                    description: 'Formaggio a pasta semidura e dal sapore aromatico.',
                    image: 'Caprifoglio.png'
                },
                {
                    id: '7',
                    name: 'Blu Mirtillo',
                    category: 'erborinati',
                    milk: 'cow',
                    weight: '300g',
                    stock: '9',
                    description: 'Erborinato arricchito con mirtilli per un sapore unico.',
                    image: 'blu mirtillo.png'
                },
                {
                    id: '8',
                    name: 'Fiordaliso',
                    category: 'fresh',
                    milk: 'sheep',
                    weight: '200g',
                    stock: '20',
                    description: 'Formaggio fresco di pecora dal gusto caratteristico.',
                    image: 'Fiordaliso.png'
                }
            ];
            
            // Salva nel localStorage
            localStorage.setItem('products', JSON.stringify(sampleProducts));
        }
        
        // Controlla se esistono già dei messaggi
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
          if (messages.length === 0) {
            // Aggiungi messaggi di esempio
            const sampleMessages = [
                {
                    id: '1',
                    nome: 'Mario Rossi',
                    email: 'mario.rossi@example.com',
                    telefono: '3331234567',
                    messaggio: 'Buongiorno,\nvolevo sapere se fate consegne a domicilio nella zona di Milano.\nGrazie!',
                    data: new Date(Date.now() - 86400000).toISOString(), // 1 giorno fa
                    letto: false
                },
                {
                    id: '2',
                    nome: 'Laura Bianchi',
                    email: 'laura.bianchi@example.com',
                    telefono: '',
                    messaggio: 'Salve, mi interesserebbe fare un ordine per il mio ristorante. Posso avere un listino prezzi aggiornato?\nGrazie mille!',
                    data: new Date(Date.now() - 172800000).toISOString(), // 2 giorni fa
                    letto: true
                },
                {
                    id: '3',
                    nome: 'Giuseppe Verdi',
                    email: 'g.verdi@example.com',
                    telefono: '3478901234',
                    messaggio: 'Buonasera,\nsono uno chef e vorrei sapere se è possibile visitare il vostro caseificio per vedere il processo di produzione.\nDistinti saluti,\nGiuseppe Verdi',
                    data: new Date(Date.now() - 43200000).toISOString(), // 12 ore fa
                    letto: false
                },
                {
                    id: '4',
                    nome: 'Francesca Neri',
                    email: 'francesca.neri@example.com',
                    telefono: '3661234567',
                    messaggio: 'Buongiorno,\nho acquistato i vostri formaggi alla fiera e sono rimasta entusiasta! Dove posso trovarli nei negozi della zona di Torino?\nGrazie in anticipo,\nFrancesca',
                    data: new Date(Date.now() - 259200000).toISOString(), // 3 giorni fa
                    letto: true
                },
                {
                    id: '5',
                    nome: 'Marco Ricci',
                    email: 'marco.ricci@example.com',
                    telefono: '',
                    messaggio: 'Salve,\nsono interessato ai vostri prodotti per il mio agriturismo. Possiamo organizzare una degustazione?\nCordiali saluti,\nMarco',
                    data: new Date().toISOString(), // Oggi
                    letto: false
                }
            ];
            
            // Salva nel localStorage
            localStorage.setItem('contactMessages', JSON.stringify(sampleMessages));
        }
    }
    
    // Gestione filtri prodotti
    const productSearch = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            filterProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterProducts();
        });
    }
    
    // Gestione pulsante refresh messaggi
    const refreshMessagesBtn = document.getElementById('refresh-messages');
    
    if (refreshMessagesBtn) {
        refreshMessagesBtn.addEventListener('click', function() {
            loadMessages();
            showToast('Messaggi aggiornati con successo!', 'success');
        });
    }
    
    // Gestione ricerca messaggi
    const messageSearch = document.getElementById('message-search');
    
    if (messageSearch) {
        messageSearch.addEventListener('input', function() {
            filterMessages();
        });
    }
    
    // Genera dati di esempio all'avvio
    generateSampleData();
});

function filterProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const searchTerm = document.getElementById('product-search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('category-filter')?.value || 'all';
    
    // Filtro i prodotti
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    // Pulisci lista esistente
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        // Mostra messaggio se non ci sono prodotti che corrispondono ai filtri
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 2rem;">
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nessun prodotto trovato con questi filtri</p>
                </div>
            </td>
        `;
        productsList.appendChild(emptyRow);
    } else {
        // Popola la tabella con i prodotti filtrati
        renderProductList(filteredProducts);
    }
}

// Funzione per renderizzare la lista prodotti (evita duplicazione codice)
function renderProductList(products) {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    // Mappa le categorie ai nomi in italiano
    const categoryNames = {
        'fresh': 'Freschi peso fisso',
        'mold': 'Muffettati',
        'creations': 'Le Creazioni',
        'toma': 'Tome',
        'erborinati': 'Erborinati'
    };
    
    // Mappa i tipi di latte ai nomi in italiano
    const milkNames = {
        'cow': 'Mucca',
        'goat': 'Capra',
        'mix': 'Misto',
        'sheep': 'Pecora'
    };
    
    // Popola la tabella con i prodotti
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Verifica se l'immagine esiste
        const checkImage = (imageSrc) => {
            if (imageSrc === 'product-placeholder.jpg') {
                return 'product-placeholder.jpg'; // Usa un placeholder generico
            }
            
            // Lista di tutte le immagini prodotto disponibili
            const availableImages = ['Aperitaly.png', 'Biancaneve.png', 'Blu di capra.png', 'blu mirtillo.png', 
                'blu montis.png', 'BLU.png', 'Bucaneve.png', 'Caprifoglio.png', 'Cenerentola.png', 
                'Dalila.png', 'Fiordaliso.png', 'Foglia.png', 'Giglio.png', 'gin.png', 'Girasole.png', 
                'Grappa.png', 'La tenera.png', 'Lilia.png', 'Margherita.png', 'mini.png', 'Narciso.png', 
                'Primula.png', 'ratafia.png', 'Robiolina.png', 'Robiolone mirtillo e pistacchio.png', 
                'Robiolone.png', 'Rosita.png', 'rosso.png', 'Specialita-al-Tartufo.png', 
                'Specialita-al-Tartufo.png.png', 'Stagionatura.png', 'Toma bianca.png', 
                'Toma Stracchinata.png', 'Verde.png', 'Violetta.png', 'vite.png'];
            
            // Controlla se l'immagine specificata esiste nell'elenco
            if (availableImages.includes(imageSrc)) {
                return imageSrc;
            }
            
            // Prova a trovare un'immagine simile
            for (const img of availableImages) {
                if (img.toLowerCase().includes(product.name.toLowerCase())) {
                    return img;
                }
            }
            
            // Se tutto fallisce, usa un'immagine casuale dall'elenco
            return availableImages[Math.floor(Math.random() * availableImages.length)];
        };

        // Trova l'immagine corretta da usare
        const imageSrc = checkImage(product.image);
        
        row.innerHTML = `
            <td>
                <img src="${imageSrc}" alt="${product.name}" class="product-thumbnail" width="50">
            </td>
            <td>
                <strong>${product.name}</strong>
                ${product.description ? `<p class="small text-muted mb-0">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</p>` : ''}
            </td>
            <td><span class="badge bg-primary">${categoryNames[product.category] || product.category}</span></td>
            <td><span class="badge bg-secondary">${milkNames[product.milk] || product.milk}</span></td>
            <td>${product.weight || 'N/D'}</td>
            <td>
                <span class="badge ${product.stock > 5 ? 'bg-success' : 'bg-warning'}">${product.stock || '0'}</span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${product.id}" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product.id}" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        productsList.appendChild(row);
    });
    
    // Aggiungi event listener per edit e delete
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// Funzione per filtrare i messaggi
function filterMessages() {
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const searchTerm = document.getElementById('message-search')?.value.toLowerCase() || '';
    
    // Filtro i messaggi
    const filteredMessages = messages.filter(message => {
        return message.nome.toLowerCase().includes(searchTerm) || 
               message.email.toLowerCase().includes(searchTerm) ||
               message.messaggio.toLowerCase().includes(searchTerm);
    });
    
    // Ordina messaggi per data (più recenti prima)
    filteredMessages.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Renderizza la lista filtrata
    renderMessagesList(filteredMessages);
}

// Funzione per renderizzare la lista messaggi
function renderMessagesList(messages) {
    const messageList = document.getElementById('message-list');
    if (!messageList) return;
    
    // Pulisci lista esistente
    messageList.innerHTML = '';
    
    if (messages.length === 0) {
        // Mostra messaggio se non ci sono messaggi
        messageList.innerHTML = `
            <div class="empty-state" style="padding: 2rem;">
                <i class="fas fa-envelope-open"></i>
                <p>Nessun messaggio trovato</p>
            </div>
        `;
        
        // Reimposta il contenuto
        const messageContent = document.getElementById('message-content');
        if (messageContent) {
            messageContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-envelope-open"></i>
                    <p>Nessun messaggio presente</p>
                </div>
            `;
        }
        return;
    }
    
    // Popola la lista dei messaggi
    messages.forEach(message => {
        const date = new Date(message.data);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        const messageItem = document.createElement('div');
        messageItem.className = `message-item ${!message.letto ? 'unread' : ''}`;
        messageItem.setAttribute('data-id', message.id);
        
        messageItem.innerHTML = `
            <div class="message-item-header">
                <span class="message-sender">${message.nome}</span>
                <span class="message-date">${formattedDate}</span>
            </div>
            <div class="message-subject">${message.email}</div>
        `;
        
        messageItem.addEventListener('click', function() {
            // Rimuovi classe selected da tutti i messaggi
            document.querySelectorAll('.message-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Aggiungi classe selected al messaggio cliccato
            this.classList.add('selected');
            
            // Segna come letto
            if (this.classList.contains('unread')) {
                this.classList.remove('unread');
                markMessageAsRead(message.id);
                
                // Aggiorna contatore messaggi non letti
                const unreadMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]').filter(m => !m.letto);
                const unreadCount = document.getElementById('unread-count');
                if (unreadCount) {
                    unreadCount.textContent = unreadMessages.length;
                }
            }
            
            // Mostra contenuto messaggio
            showMessageContent(message);
        });
        
        messageList.appendChild(messageItem);
    });
}
