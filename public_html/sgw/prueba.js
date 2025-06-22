        // Product data
        const products = [
            {
                id: 1,
                name: "arroz chino 2",
                type: "producto",
                stock: 0,
                price: "R$ 26.00",
                hasStock: false,
                unit: "",
                hasWarning: false
            },
            {
                id: 2,
                name: "combo promo",
                type: "combo",
                stock: 15,
                price: "R$ 70.00",
                hasStock: true,
                unit: "unt",
                hasWarning: false
            },
            {
                id: 3,
                name: "coca cola",
                type: "producto",
                stock: 0,
                price: "R$ 7.00",
                hasStock: false,
                unit: "",
                hasWarning: true
            },
            {
                id: 4,
                name: "arroz cocido",
                type: "insumo",
                stock: 8000,
                price: "R$ 0.80",
                hasStock: true,
                unit: "g",
                hasWarning: false
            },
            {
                id: 5,
                name: "arroz crudo",
                type: "insumo",
                stock: 0,
                price: "R$ 0.20",
                hasStock: false,
                unit: "g",
                hasWarning: false
            },
            {
                id: 6,
                name: "arroz crudo",
                type: "insumo",
                stock: 0,
                price: "R$ 0.20",
                hasStock: false,
                unit: "g",
                hasWarning: false
            }
        ];

        let filteredProducts = [...products];

        // Render products
        function renderProducts(productsToRender = filteredProducts) {
            const grid = document.getElementById('productGrid');
            grid.innerHTML = '';

            productsToRender.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                card.innerHTML = `
                    <div class="product-header">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <span class="product-type type-${product.type}">${product.type}</span>
                        </div>
                        <div>
                            ${getProductIcon(product)}
                        </div>
                    </div>
                    
                    <div class="product-details">
                        <div class="stock-info ${!product.hasStock ? 'stock-warning' : ''}">
                            ${getStockIcon(product)}
                            <span class="stock-text">
                                ${product.hasStock 
                                    ? (product.type === 'combo' ? `${product.stock} ${product.unit}` : `${product.stock} ${product.unit}`)
                                    : `Stock: ${product.stock}${product.unit ? ' ' + product.unit : ''}`
                                }
                            </span>
                        </div>
                        <span class="product-price">${product.price}</span>
                    </div>
                    
                    <div class="product-actions">
                        <div class="action-group">
                            <button class="action-btn" onclick="editProduct(${product.id})">
                                <svg viewBox="0 0 24 24">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                            </button>
                            <button class="action-btn" onclick="addStock(${product.id})">
                                <svg viewBox="0 0 24 24">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                            </button>
                            <button class="action-btn green" onclick="quickAdd(${product.id})">
                                <svg viewBox="0 0 24 24">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                            </button>
                            <button class="action-btn" onclick="viewDetails(${product.id})">
                                ${product.type === 'combo' 
                                    ? '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
                                    : '<svg viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19V21Z"/></svg>'
                                }
                            </button>
                        </div>
                        <div class="action-group">
                            ${!product.hasStock ? `
                                <button class="action-btn green" onclick="quickAdd(${product.id})">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg>
                                </button>
                                <button class="action-btn" onclick="undoAction(${product.id})">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                                    </svg>
                                </button>
                                <button class="action-btn" onclick="refreshStock(${product.id})">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                    </svg>
                                </button>
                            ` : ''}
                            <button class="action-btn" onclick="moreOptions(${product.id})">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                
                grid.appendChild(card);
            });
        }

        function getProductIcon(product) {
            if (product.id === 2) {
                return '<svg class="product-icon" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
            } else if (product.hasWarning) {
                return '<svg class="product-icon warning-icon" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
            } else if ([1, 5, 6].includes(product.id)) {
                return '<svg class="product-icon" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>';
            }
            return '';
        }

        function getStockIcon(product) {
            if (!product.hasStock) {
                return '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
            } else if (product.type === 'combo') {
                return '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
            } else {
                return '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            }
        }

        // Filter functions
        function filterProducts() {
            const typeFilter = document.getElementById('typeFilter').value;
            const stockFilter = document.getElementById('stockFilter').value;
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();

            filteredProducts = products.filter(product => {
                const matchesType = !typeFilter || product.type === typeFilter;
                const matchesStock = !stockFilter || 
                    (stockFilter === 'available' && product.hasStock) ||
                    (stockFilter === 'out' && !product.hasStock) ||
                    (stockFilter === 'low' && product.stock > 0 && product.stock < 10);
                const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm);

                return matchesType && matchesStock && matchesSearch;
            });

            renderProducts();
        }

        function searchProducts() {
            filterProducts();
        }

        // Action functions
        function addNewProduct() {
            alert('Agregar nuevo producto');
        }

        function editProduct(id) {
            alert(`Editar producto ${id}`);
        }

        function addStock(id) {
            alert(`Agregar stock al producto ${id}`);
        }

        function quickAdd(id) {
            alert(`Agregar rápido al producto ${id}`);
        }

        function viewDetails(id) {
            alert(`Ver detalles del producto ${id}`);
        }

        function undoAction(id) {
            alert(`Deshacer acción del producto ${id}`);
        }

        function refreshStock(id) {
            alert(`Actualizar stock del producto ${id}`);
        }

        function moreOptions(id) {
            alert(`Más opciones para el producto ${id}`);
        }

        function showAlerts() {
            alert('Mostrar alertas');
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            renderProducts();
        });