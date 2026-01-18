// Translations
const translations = {
    en: {
        all: 'All',
        burgers: 'Beef Burgers',
        chicken: 'Chicken Burgers',
        extras: 'Extras',
        drinks: 'Drinks',
        timeToPrepare: 'Time to Prepare',
        minutes: 'Minutes',
        tapForDetails: 'Tap for details'
    },
    ar: {
        all: 'الكل',
        burgers: 'برجر بقري',
        chicken: 'برجر دجاج',
        extras: 'إضافات',
        drinks: 'مشروبات',
        timeToPrepare: 'وقت التحضير',
        minutes: 'دقائق',
        tapForDetails: 'اضغط للتفاصيل'
    },
    tr: {
        all: 'Tümü',
        burgers: 'Dana Burgerler',
        chicken: 'Tavuk Burgerler',
        extras: 'Ekstralar',
        drinks: 'İçecekler',
        timeToPrepare: 'Hazırlık Süresi',
        minutes: 'Dakika',
        tapForDetails: 'Detaylar için tıklayın'
    }
};

// Menu Data (dynamically fetched)
let menuData = {
    promotions: { isActive: false, text: { en: '', ar: '', tr: '' } },
    burgers: [],
    chicken: [],
    extras: [],
    drinks: []
};

// Current language
let currentLang = 'en';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const categoryTitle = document.getElementById('categoryTitle');
const categoryButtons = document.querySelectorAll('.category-btn');

// Modal Elements
const modal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalClose = document.querySelector('.modal-close');
const modalBackdrop = document.querySelector('.modal-backdrop');

// Current category
let currentCategory = 'burgers';

// Show product modal
function showModal(product) {
    modalImage.src = product.image;
    modalImage.alt = product.name[currentLang];
    modalName.textContent = product.name[currentLang];

    const modalOptions = document.getElementById('modalOptions');
    modalOptions.innerHTML = ''; // Clear previous options

    // Default price
    let currentPrice = product.price;

    if (product.priceDouble) {
        modalOptions.style.display = 'flex';
        // Create Toggle
        const singleBtn = document.createElement('button');
        singleBtn.className = 'option-btn active';
        singleBtn.textContent = 'Single Patty';

        const doubleBtn = document.createElement('button');
        doubleBtn.className = 'option-btn';
        doubleBtn.textContent = 'Double Patty';

        // Event Handlers
        singleBtn.onclick = () => {
            singleBtn.classList.add('active');
            doubleBtn.classList.remove('active');
            currentPrice = product.price;
            modalPrice.innerHTML = currentPrice + '<sup>TZS</sup>';
        };

        doubleBtn.onclick = () => {
            doubleBtn.classList.add('active');
            singleBtn.classList.remove('active');
            currentPrice = product.priceDouble;
            modalPrice.innerHTML = currentPrice + '<sup>TZS</sup>';
        };

        modalOptions.appendChild(singleBtn);
        modalOptions.appendChild(doubleBtn);
    } else {
        modalOptions.style.display = 'none';
    }

    modalPrice.innerHTML = currentPrice + '<sup>TZS</sup>';
    modalDescription.innerHTML = `<strong>${product.calories} kcal</strong> • ${product.description[currentLang]}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close product modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Render products with click handlers
// Persistent Grids Cache
const categoryGrids = {};

// Initialize all category grids once (Persistent DOM)
function initializeAllGrids() {
    // If data is empty, do nothing
    if (!menuData.burgers.length) return;

    productGrid.innerHTML = ''; // Clear once
    const categories = ['all', 'burgers', 'chicken', 'extras', 'drinks'];

    categories.forEach(cat => {
        // Create container for this category
        const gridDiv = document.createElement('div');
        gridDiv.className = 'category-grid-container';
        gridDiv.id = `grid-${cat}`;
        gridDiv.style.display = 'none'; // Hidden by default

        let products;
        if (cat === 'all') {
            products = [...menuData.burgers, ...menuData.chicken, ...menuData.extras, ...menuData.drinks];
        } else {
            products = menuData[cat];
        }

        if (products) {
            products.forEach((product, index) => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.setAttribute('data-description', product.description[currentLang]);

                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name[currentLang]}" class="product-image" loading="lazy">
                    <h3 class="product-name">${product.name[currentLang]}</h3>
                    <div class="product-price">
                        ${product.priceDouble
                        ? `<span style="font-size:0.9em">Single: ${product.price}</span><br><span style="font-size:0.9em">Double: ${product.priceDouble}</span>`
                        : `${product.price}<sup>TZS</sup>`
                    }
                    </div>
                    <span class="product-info"></span>
                `;

                // Add click handler for modal
                card.addEventListener('click', () => showModal(product));
                gridDiv.appendChild(card);
            });
        }

        productGrid.appendChild(gridDiv);
        categoryGrids[cat] = gridDiv;
    });

    // Show initial category
    showCategoryGrid(currentCategory);
}

// Switch visible grid without re-rendering
function showCategoryGrid(category) {
    Object.values(categoryGrids).forEach(grid => grid.style.display = 'none');
    if (categoryGrids[category]) {
        categoryGrids[category].style.display = 'grid';
        // Re-trigger simple fade in if needed, or just show
        categoryGrids[category].style.opacity = '1';
    }
}

// Deprecated: renderProducts (kept for compatibility in case of leftovers)
function renderProducts(category) {
    // Forward to new system
    showCategoryGrid(category);
}

// Update category title
function updateCategoryTitle(category) {
    if (translations[currentLang]) {
        categoryTitle.textContent = translations[currentLang][category];
    }
}

// Update UI language
function updateUILanguage() {
    // Update category buttons
    categoryButtons.forEach(btn => {
        const cat = btn.dataset.category;
        btn.textContent = translations[currentLang][cat];
    });

    // Update time to prepare text
    const timeLabel = document.querySelector('.time-label');
    const timeValue = document.querySelector('.time-value');
    if (timeLabel) timeLabel.textContent = translations[currentLang].timeToPrepare;
    if (timeValue) timeValue.textContent = '15 ' + translations[currentLang].minutes;

    // Update RTL direction for Arabic
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // Re-render all grids with new language
    updateCategoryTitle(currentCategory);
    initializeAllGrids();
}

// Update banner theme color and body theme for buttons
function updateBannerTheme(category) {
    const banner = document.querySelector('.hero-banner');
    if (!banner) return;

    // Check for Billboard Mode (Active Promotion + Billboards)
    const billboards = menuData.promotions ? (menuData.promotions.billboards || []) : [];
    // Fallback for legacy data (if 'image' property exists)
    if (menuData.promotions && menuData.promotions.image && billboards.length === 0) {
        billboards.push(menuData.promotions.image);
    }

    if (menuData.promotions && menuData.promotions.isActive && billboards.length > 0) {
        banner.classList.remove('theme-burgers', 'theme-chicken', 'theme-extras', 'theme-drinks', 'theme-all');
        banner.classList.add('billboard-active');

        // Reset any img tag injection from previous attempts
        const existingImg = banner.querySelector('.billboard-img');
        if (existingImg) existingImg.remove();
        banner.style.padding = '';

        // Apply strict "Fixed Frame" dimensions (Matches the wide banner look)
        banner.style.backgroundImage = `url('${billboards[0]}?v=5')`;
        banner.style.backgroundRepeat = 'no-repeat';
        banner.style.backgroundPosition = 'center';
        banner.style.backgroundSize = 'contain';
        banner.style.backgroundColor = '#101010';

        // Force Fixed Aspect Ratio (2.5:1)
        banner.style.height = 'auto';
        banner.style.minHeight = 'unset';
        banner.style.aspectRatio = '2.5 / 1';
        banner.style.width = '100%';
        banner.style.display = 'flex';


        // Hide 3D Model Canvas if present
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.style.display = 'none';

        // Hide Text Overlays
        const title = document.getElementById('categoryTitle');
        if (title) title.style.display = 'none';

        const timeInfo = document.querySelector('.time-to-prepare');
        if (timeInfo) timeInfo.style.display = 'none';

        const pattern = document.querySelector('.checkered-pattern');
        if (pattern) pattern.style.display = 'none';

        // Override CSS variables for consistency (using Golden Amber)
        const root = document.documentElement;
        root.style.setProperty('--category-primary', '#f59e0b');
        root.style.setProperty('--category-glow', 'rgba(245, 158, 11, 0.5)');

        return; // Skip standard theme logic
    }

    // Reset Standard Theme
    banner.classList.remove('billboard-active');
    banner.style.backgroundImage = ''; // Clear inline style to let CSS take over
    banner.style.height = '';
    const canvas = document.querySelector('canvas');
    if (canvas) canvas.style.display = 'block';

    banner.classList.remove('theme-burgers', 'theme-chicken', 'theme-extras', 'theme-drinks', 'theme-all');
    banner.classList.add(`theme-${category}`);

    // Also update body class for FABs and indicators
    document.body.classList.remove('theme-burgers', 'theme-chicken', 'theme-extras', 'theme-drinks', 'theme-all');
    document.body.classList.add(`theme-${category}`);

    // Update CSS variable for dynamic components
    const root = document.documentElement;
    if (category === 'chicken') {
        root.style.setProperty('--category-primary', 'var(--chicken-primary)');
        root.style.setProperty('--category-glow', 'rgba(217, 119, 6, 0.5)');
    }
    else if (category === 'extras') {
        root.style.setProperty('--category-primary', 'var(--extras-primary)');
        root.style.setProperty('--category-glow', 'rgba(220, 38, 38, 0.5)');
    }
    else if (category === 'drinks') {
        root.style.setProperty('--category-primary', 'var(--drinks-primary)');
        root.style.setProperty('--category-glow', 'rgba(8, 145, 178, 0.5)');
    }
    else {
        root.style.setProperty('--category-primary', 'var(--burgers-primary)');
        root.style.setProperty('--category-glow', 'rgba(220, 38, 38, 0.5)');
    }
}

// Handle category click
function handleCategoryClick(e) {
    const btn = e.target;
    const category = btn.dataset.category;

    if (category === currentCategory) return;

    // Update active button
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update current category
    currentCategory = category;

    // Update banner theme
    updateBannerTheme(category);

    // Animate out
    productGrid.style.opacity = '0';
    productGrid.style.transform = 'translateY(20px)';

    setTimeout(() => {
        updateCategoryTitle(category);
        showCategoryGrid(category); // Use new persistent grid switch
        productGrid.style.opacity = '1';
        productGrid.style.transform = 'translateY(0)';

        // Switch 3D model in banner (burgers → fries for extras)
        if (typeof switchFoodModel === 'function') {
            switchFoodModel(category);
        }
    }, 200);
}

// Add transition styles
if (productGrid) {
    productGrid.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
}

// Event listeners
if (categoryButtons) {
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', handleCategoryClick);
    });
}

// Modal close handlers
if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}
if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Language selector
const languageSelector = document.getElementById('languageSelector');
const currentFlag = document.getElementById('currentFlag');
const currentLangEl = document.getElementById('currentLang');

if (languageSelector) {
    languageSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        languageSelector.classList.toggle('open');
    });
}

document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.dataset.lang;
        const flag = option.dataset.flag;
        const langNames = { en: 'English', ar: 'العربية', tr: 'Türkçe' };

        currentLang = lang;
        currentFlag.textContent = flag;
        currentLangEl.textContent = langNames[lang];

        if (languageSelector) languageSelector.classList.remove('open');
        updateUILanguage();
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    if (languageSelector) languageSelector.classList.remove('open');
});

// Floating translate button - opens language popup
const fabTranslate = document.getElementById('fabTranslateBtn');
const fabMenu = document.getElementById('fabLanguageMenu');

if (fabTranslate && fabMenu) {
    fabTranslate.addEventListener('click', (e) => {
        e.stopPropagation();
        fabMenu.classList.toggle('active');
        // Close header dropdown if open
        if (languageSelector) languageSelector.classList.remove('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!fabMenu.contains(e.target) && e.target !== fabTranslate) {
            fabMenu.classList.remove('active');
        }
    });

    // Handle options
    fabMenu.querySelectorAll('.fab-lang-item').forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.dataset.lang;
            const flags = { en: '🇬🇧', ar: '🇸🇦', tr: '🇹🇷' };
            const langNames = { en: 'English', ar: 'العربية', tr: 'Türkçe' };

            currentLang = lang;
            if (currentFlag) currentFlag.textContent = flags[lang];
            if (currentLangEl) currentLangEl.textContent = langNames[lang];

            updateUILanguage();
            fabMenu.classList.remove('active');
        });
    });
}

// Preload all product images AND banner images for instant category switching
function preloadImages() {
    // Collect all products for preloading
    // If loading for first time, menuData might be empty, so we check
    const allProducts = [...(menuData.burgers || []), ...(menuData.chicken || []), ...(menuData.extras || []), ...(menuData.drinks || [])];

    // Banner images to preload
    const bannerImages = [
        'images/banner_all.png',
        'images/banner_burgers.png',
        'images/banner_chicken.png',
        'images/banner_extras.png'
    ];

    // Product image promises
    const productPromises = allProducts.map(product => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Continue even if error
            img.src = product.image;
        });
    });

    // Banner image promises with EAGER DECODE
    const bannerPromises = bannerImages.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            // Use decode() to eagerly decode image into GPU memory
            if (img.decode) {
                img.decode().then(resolve).catch(resolve);
            } else {
                img.onload = resolve;
                img.onerror = resolve;
            }
        });
    });

    return Promise.all([...bannerPromises, ...productPromises]);
}

// Initialization Logic
async function init() {
    try {
        console.log('Fetching live menu from API...');
        // Correctly point to the dashboard server API
        // Correctly point to the dashboard server API (Relative path works for both)
        const API_URL = '/api/menu';

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menuData = await response.json();
        console.log('Menu data loaded from cloud:', menuData);

        // Render Promotion Banner
        const heroBanner = document.querySelector('.hero-banner');
        // Check if there is actual text to show
        const promoText = (menuData.promotions.text[currentLang] || menuData.promotions.text.en || '').trim();

        if (menuData.promotions && menuData.promotions.isActive && heroBanner && promoText) {
            // Inject Keyframes Style
            if (!document.getElementById('marquee-style')) {
                const style = document.createElement('style');
                style.id = 'marquee-style';
                style.textContent = `
            @keyframes marquee-scroll {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
        `;
                document.head.appendChild(style);
            }

            const promoDiv = document.createElement('div');
            promoDiv.style.background = '#f59e0b';
            promoDiv.style.color = '#000';
            promoDiv.style.padding = '0.75rem';
            promoDiv.style.fontWeight = 'bold';
            promoDiv.style.position = 'absolute';
            promoDiv.style.top = '0';
            promoDiv.style.left = '0';
            promoDiv.style.width = '100%';
            promoDiv.style.zIndex = '100';
            promoDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            promoDiv.style.overflow = 'hidden';
            promoDiv.style.whiteSpace = 'nowrap';
            promoDiv.style.display = 'flex';
            promoDiv.style.alignItems = 'center';

            // Animated Text Container
            const textSpan = document.createElement('div');
            textSpan.textContent = menuData.promotions.text[currentLang] || menuData.promotions.text.en;
            textSpan.style.display = 'inline-block';
            textSpan.style.animation = 'marquee-scroll 15s linear infinite';
            textSpan.style.textAlign = 'center';
            textSpan.style.width = 'auto';
            textSpan.style.minWidth = '100%';

            promoDiv.appendChild(textSpan);

            // Allow closing
            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.right = '1rem';
            closeBtn.style.top = '50%';
            closeBtn.style.transform = 'translateY(-50%)';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontWeight = 'bold';
            closeBtn.style.fontSize = '1.2rem';
            closeBtn.style.zIndex = '101';
            closeBtn.onclick = () => promoDiv.remove();
            promoDiv.appendChild(closeBtn);

            heroBanner.appendChild(promoDiv);
            heroBanner.style.paddingTop = '3rem';
        }

        // Initialize Grid
        initializeAllGrids();

        // Initialize Theme
        updateBannerTheme(currentCategory);

        // Multi-Billboard Popup Logic
        if (menuData.promotions && menuData.promotions.isActive) {
            const billboards = menuData.promotions.billboards || [];
            // Support legacy single image just in case
            if (billboards.length === 0 && menuData.promotions.image) {
                billboards.push(menuData.promotions.image);
            }

            if (billboards.length > 0) {
                showBillboardPopup(billboards);
            }
        }

        // Start preloading images
        preloadImages().then(() => {
            console.log('All images loaded.');
        });

    } catch (e) {
        console.error('Error loading menu:', e);
    }
}



// Show Billboard Popup (Now supports multiple)
function showBillboardPopup(images) {
    if (!Array.isArray(images)) images = [images];
    if (images.length === 0) return;

    // Check if seen in this session
    if (sessionStorage.getItem('billboardSeen')) return;

    // Mark as seen
    sessionStorage.setItem('billboardSeen', 'true');

    let currentIndex = 0;
    let autoPlayTimer = null;

    const stopAutoPlay = () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    };

    const startAutoPlay = () => {
        if (images.length <= 1) return;
        stopAutoPlay();
        autoPlayTimer = setInterval(() => updateImage(1), 5000);
    };

    // Create Modal Elements
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.maxWidth = '90%';
    container.style.maxHeight = '90%';
    container.style.borderRadius = '12px';
    container.style.overflow = 'hidden';
    container.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
    container.style.transform = 'scale(0.9)';
    container.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    const img = document.createElement('img');
    img.src = images[0] + '?v=5';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.maxHeight = '85vh';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    img.style.transition = 'opacity 0.2s ease-in-out';
    img.style.userSelect = 'none';

    // Swipe Support
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX, { passive: true });
    container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) updateImage(1);
        if (touchStartX - touchEndX < -50) updateImage(-1);
    }, { passive: true });

    // Scroll Support
    let lastWheelTime = 0;
    container.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (now - lastWheelTime < 500) return;
        lastWheelTime = now;
        if (e.deltaY > 0 || e.deltaX > 0) updateImage(1);
        else updateImage(-1);
    }, { passive: true });

    const updateImage = (dir) => {
        currentIndex = (currentIndex + dir + images.length) % images.length;
        if (img) img.style.opacity = '0';
        setTimeout(() => {
            if (img) {
                img.src = images[currentIndex] + '?v=5';
                img.style.opacity = '1';
                updateCounter();
            }
        }, 200);
        startAutoPlay();
    };

    const updateCounter = () => {
        const c = container.querySelector('.billboard-counter');
        if (c) c.textContent = `${currentIndex + 1} / ${images.length}`;
    };

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.background = 'rgba(0,0,0,0.5)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.width = '36px';
    closeBtn.style.height = '36px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.lineHeight = '1';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10';
    closeBtn.style.backdropFilter = 'blur(4px)';

    const closePopup = () => {
        stopAutoPlay();
        overlay.style.opacity = '0';
        container.style.transform = 'scale(0.9)';
        setTimeout(() => overlay.remove(), 300);
    };

    closeBtn.onclick = closePopup;
    overlay.onclick = (e) => {
        if (e.target === overlay) closePopup();
    };

    container.appendChild(img);
    container.appendChild(closeBtn);

    // Navigation Controls if multiple
    if (images.length > 1) {
        const createNavBtn = (icon, isLeft) => {
            const btn = document.createElement('button');
            btn.innerHTML = icon;
            btn.style.position = 'absolute';
            btn.style.top = '50%';
            btn.style.transform = 'translateY(-50%)';
            btn.style[isLeft ? 'left' : 'right'] = '15px';
            btn.style.background = 'rgba(255,255,255,0.15)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.width = '44px';
            btn.style.height = '44px';
            btn.style.borderRadius = '50%';
            btn.style.fontSize = '20px';
            btn.style.cursor = 'pointer';
            btn.style.backdropFilter = 'blur(10px)';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            return btn;
        };

        const prevBtn = createNavBtn('&#10094;', true);
        const nextBtn = createNavBtn('&#10095;', false);

        prevBtn.onclick = (e) => { e.stopPropagation(); updateImage(-1); };
        nextBtn.onclick = (e) => { e.stopPropagation(); updateImage(1); };

        container.appendChild(prevBtn);
        container.appendChild(nextBtn);

        // Counter
        const counter = document.createElement('div');
        counter.className = 'billboard-counter';
        counter.style.position = 'absolute';
        counter.style.bottom = '15px';
        counter.style.left = '50%';
        counter.style.transform = 'translateX(-50%)';
        counter.style.background = 'rgba(0,0,0,0.5)';
        counter.style.color = 'white';
        counter.style.padding = '4px 12px';
        counter.style.borderRadius = '20px';
        counter.style.fontSize = '0.8rem';
        counter.style.backdropFilter = 'blur(4px)';
        counter.style.zIndex = '10';

        container.appendChild(counter);
        updateCounter();
        startAutoPlay();
    }

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        container.style.transform = 'scale(1)';
    });
}

// Initialize on window load (after HTML is parsed)
window.addEventListener('load', () => {
    init();
});

// Scroll to Top Logic
const fabScrollTop = document.getElementById('fabScrollTop');
if (fabScrollTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            fabScrollTop.classList.add('visible');
        } else {
            fabScrollTop.classList.remove('visible');
        }
    });
    fabScrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
