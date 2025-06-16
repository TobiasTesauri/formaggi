/**
 * Remin Admin Panel
 * Questo file gestisce tutte le funzionalità del pannello di amministrazione
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementi del DOM
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const adminDashboard = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logout-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const addProductBtn = document.getElementById('add-product-btn');
    const productFormContainer = document.getElementById('product-form-container');
    const cancelProductBtn = document.getElementById('cancel-product');
    const productForm = document.getElementById('product-form');
    const productsList = document.getElementById('products-list');
    const messageList = document.getElementById('message-list');
    const messageContent = document.getElementById('message-content');
    const unreadCount = document.getElementById('unread-count');
    
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
    
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productId = document.getElementById('product-id').value || Date.now().toString();
            const productName = document.getElementById('product-name').value;
            const productCategory = document.getElementById('product-category').value;
            const productMilk = document.getElementById('product-milk').value;
            const productWeight = document.getElementById('product-weight').value;
            const productStock = document.getElementById('product-stock').value;
            
            // Crea oggetto prodotto
            const product = {
                id: productId,
                name: productName,
                category: productCategory,
                milk: productMilk,
                weight: productWeight,
                stock: productStock,
                image: 'product-placeholder.jpg' // In un'app reale, gestire il caricamento immagini
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
    
    // Funzioni di utilità
    function initSession() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (isLoggedIn) {
            if (loginOverlay) loginOverlay.style.display = 'none';
            if (adminDashboard) adminDashboard.classList.remove('hidden');
            
            // Carica i dati iniziali
            loadProducts();
            loadMessages();
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
            products[index] = product;
        } else {
            // Aggiungi nuovo prodotto
            products.push(product);
        }
        
        // Salva nel localStorage
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    function loadProducts() {
        if (!productsList) return;
        
        // Ottieni i prodotti dal localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Pulisci lista esistente
        productsList.innerHTML = '';
        
        if (products.length === 0) {
            // Mostra messaggio se non ci sono prodotti
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <div class="empty-state">
                        <i class="fas fa-cheese"></i>
                        <p>Nessun prodotto presente</p>
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
                
                row.innerHTML = `
                    <td><img src="${product.image || 'product-placeholder.jpg'}" alt="${product.name}"></td>
                    <td>${product.name}</td>
                    <td>${categoryNames[product.category] || product.category}</td>
                    <td>${milkNames[product.milk] || product.milk}</td>
                    <td>${product.weight || 'N/D'}</td>
                    <td>${product.stock || '0'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="edit-btn" data-id="${product.id}" title="Modifica">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${product.id}" title="Elimina">
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
        
        // Pulisci lista esistente
        messageList.innerHTML = '';
        
        // Conta messaggi non letti
        const unreadMessages = messages.filter(m => !m.letto);
        unreadCount.textContent = unreadMessages.length;
        
        if (messages.length === 0) {
            // Mostra messaggio se non ci sono messaggi
            messageList.innerHTML = `
                <div class="empty-state" style="padding: 2rem;">
                    <i class="fas fa-envelope-open"></i>
                    <p>Nessun messaggio presente</p>
                </div>
            `;
            
            // Reimposta il contenuto
            messageContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-envelope-open"></i>
                    <p>Nessun messaggio presente</p>
                </div>
            `;
        } else {
            // Ordina messaggi per data (più recenti prima)
            messages.sort((a, b) => new Date(b.data) - new Date(a.data));
            
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
                        unreadCount.textContent = unreadMessages.length;
                    }
                    
                    // Mostra contenuto messaggio
                    showMessageContent(message);
                });
                
                messageList.appendChild(messageItem);
            });
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
    }

    // Genera dati di esempio se non esistono già
    function generateSampleData() {
        // Controlla se esistono già dei prodotti
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        if (products.length === 0) {
            // Aggiungi prodotti di esempio
            const sampleProducts = [
                {
                    id: '1',
                    name: 'Blu di Capra',
                    category: 'erborinati',
                    milk: 'goat',
                    weight: '2000g',
                    stock: '10',
                    image: 'Blu di capra.png'
                },
                {
                    id: '2',
                    name: 'Robiolone',
                    category: 'mold',
                    milk: 'goat',
                    weight: '2000g',
                    stock: '8',
                    image: 'Robiolone.png'
                },
                {
                    id: '3',
                    name: 'Primula',
                    category: 'fresh',
                    milk: 'goat',
                    weight: '35g',
                    stock: '25',
                    image: 'Primula.png'
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
                }
            ];
            
            // Salva nel localStorage
            localStorage.setItem('contactMessages', JSON.stringify(sampleMessages));
        }
    }
    
    // Genera dati di esempio all'avvio
    generateSampleData();
});
