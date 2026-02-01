const translations = {
    en: {
        all: 'All',
        burgers: 'Beef Burgers',
        burger: 'Beef Burgers', // Alias
        chicken: 'Chicken Burgers',
        extras: 'Extras',
        drinks: 'Drinks',
        timeToPrepare: 'Time to Prepare',
        minutes: 'Minutes',
        tapForDetails: 'Tap for details',
        singlePatty: 'Single Patty',
        doublePatty: 'Double Patty',
        kcal: 'kcal'
    },
    ar: {
        all: 'الكل',
        burgers: 'برجر بقري',
        burger: 'برجر بقري', // Alias
        chicken: 'برجر دجاج',
        extras: 'إضافات',
        drinks: 'مشروبات',
        timeToPrepare: 'وقت التحضير',
        minutes: 'دقائق',
        tapForDetails: 'اضغط للتفاصيل',
        singlePatty: 'شريحة واحدة',
        doublePatty: 'شريحتين',
        kcal: 'سعرة'
    },
    tr: {
        all: 'Tümü',
        burgers: 'Dana Burgerler',
        burger: 'Dana Burgerler', // Alias
        chicken: 'Tavuk Burgerler',
        extras: 'Ekstralar',
        drinks: 'İçecekler',
        timeToPrepare: 'Hazırlık Süresi',
        minutes: 'Dakika',
        tapForDetails: 'Detaylar için tıklayın',
        singlePatty: 'Tek Köfte',
        doublePatty: 'Çift Köfte',
        kcal: 'kcal'
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

// Cloudinary Optimizer Helper
function getOptimizedImageUrl(url, width = 'auto') {
    if (!url) return '';
    if (url.includes('cloudinary.com') && !url.includes('/f_auto')) {
        // Insert params after /upload/
        const parts = url.split('/upload/');
        if (parts.length === 2) {
            let params = 'f_auto,q_auto';
            if (width !== 'auto') params += `,w_${width}`;
            return `${parts[0]}/upload/${params}/${parts[1]}`;
        }
    }
    return url;
}

// Current language
let currentLang = 'en';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const categoryTitle = document.getElementById('categoryTitle');
let categoryButtons = document.querySelectorAll('.category-btn');

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
    modalImage.src = getOptimizedImageUrl(product.image, 800);
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
        singleBtn.textContent = translations[currentLang].singlePatty;

        const doubleBtn = document.createElement('button');
        doubleBtn.className = 'option-btn';
        doubleBtn.textContent = translations[currentLang].doublePatty;

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
    modalDescription.innerHTML = `<strong>${product.calories} ${translations[currentLang].kcal}</strong> • ${product.description[currentLang]}`;

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

// Update category title fallback
// Update category title fallback
// Update category title fallback
function getCategoryLabel(cat) {
    // 1. Dynamic Setting
    if (menuData.categorySettings && menuData.categorySettings[cat] && menuData.categorySettings[cat].titles && menuData.categorySettings[cat].titles[currentLang]) {
        const dbTitle = menuData.categorySettings[cat].titles[currentLang];
        // SMART CHECK: If DB title is basically the same as the raw key (e.g. "chicken" == "chicken"), assume it's a weak default and prefer our translation
        // Also check if it's just Capitalized version of key (e.g. "Chicken" == "chicken")
        if (dbTitle.toLowerCase() !== cat.toLowerCase()) {
            return dbTitle;
        }
    }
    // 2. Translation Map (Robust Check)
    if (translations[currentLang] && translations[currentLang][cat]) {
        return translations[currentLang][cat];
    }
    // 3. Fallback to Capitalized Key (handle underscores)
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Update UI language
function updateUILanguage() {
    // Update category buttons (Dynamic)
    categoryButtons.forEach(btn => {
        const cat = btn.dataset.category;
        btn.textContent = getCategoryLabel(cat);
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
    // initializeAllGrids no longer needed for language switch as grids persist, just update Text?
    // Actually, product names/desc need re-render. 
    initializeAllGrids();
}

// Update category title
// Update category title
function updateCategoryTitle(category) {
    // Removed legacy hardcoded override and .title check
    // Use the robust getCategoryLabel function which handles all cases
    categoryTitle.textContent = getCategoryLabel(category);
}

// Render products with click handlers
// Persistent Grids Cache
// Persistent Grids Cache
// const categoryGrids = {}; // Removed duplicate

// Initialize all category grids once (Persistent DOM)
function initializeAllGrids() {
    // If data is empty, do nothing
    // if (!menuData.burgers.length) return; // REMOVED: Now generic

    productGrid.innerHTML = ''; // Clear once

    // Dynamic Categories: Get all keys except 'promotions' and 'categorySettings', and ensure 'all' is first
    const dataKeys = Object.keys(menuData).filter(k => k !== 'promotions' && k !== 'categorySettings');
    const categories = ['all', ...dataKeys];

    // Update Navigation Buttons Dynamically if new categories exist
    const nav = document.querySelector('.category-nav');
    if (nav) {
        // Clear existing buttons except logic (rebuild is safer for order)
        nav.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
            btn.dataset.category = cat;
            btn.textContent = getCategoryLabel(cat);
            btn.addEventListener('click', handleCategoryClick);
            nav.appendChild(btn);
        });
        // Update global reference
        categoryButtons = document.querySelectorAll('.category-btn');
    }

    categories.forEach(cat => {
        // Create container for this category
        const gridDiv = document.createElement('div');
        gridDiv.className = 'category-grid-container';
        gridDiv.id = `grid-${cat}`;
        gridDiv.style.display = 'none'; // Hidden by default

        let products;
        if (cat === 'all') {
            // Combine all arrays
            products = dataKeys.reduce((acc, key) => {
                return Array.isArray(menuData[key]) ? acc.concat(menuData[key]) : acc;
            }, []);
        } else {
            products = menuData[cat] || [];
        }

        if (products) {
            products.forEach((product, index) => {
                const card = document.createElement('div');
                // Fallback to English if translation is missing/empty
                const desc = product.description[currentLang] || product.description['en'] || '';
                const name = product.name[currentLang] || product.name['en'] || 'Unnamed Product';

                card.setAttribute('data-description', desc);

                const optimizedThumb = getOptimizedImageUrl(product.image, 500);
                card.innerHTML = `
                    <img src="${optimizedThumb}" alt="${name}" class="product-image" loading="lazy">
                    <h3 class="product-name">${name}</h3>
                    <div class="card-bottom">
                        <div class="product-price">
                            ${product.priceDouble
                        ? `<span style="font-size:0.9em">${translations[currentLang].singlePatty}: ${product.price}</span><br><span style="font-size:0.9em">${translations[currentLang].doublePatty}: ${product.priceDouble}</span>`
                        : `${product.price}<sup>TZS</sup>`
                    }
                        </div>
                        <button class="more-info-btn" aria-label="View Details">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12S7.86 19.5 12 19.5 19.5 16.14 19.5 12 16.14 4.5 12 4.5zm0 16.5c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm1-4h-2v-6h2v6zm0-8h-2V7h2v1.5z"/>
                            </svg>
                        </button>
                    </div>
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
// Update category title - Uses dynamic label helper
function updateCategoryTitle(category) {
    categoryTitle.textContent = getCategoryLabel(category);
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
        banner.style.margin = '0'; // Remove margin to eliminate side gaps (Full Width)
        banner.style.borderRadius = '0'; // Optional: squared look for full width

        // Apply strict "Fixed Frame" dimensions (Matches the wide banner look)
        const optimizedBanner = getOptimizedImageUrl(billboards[0], 1200);
        banner.style.backgroundImage = `url('${optimizedBanner}')`;
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

    // Check for Dynamic Settings first
    const settings = menuData.categorySettings ? menuData.categorySettings[category] : null;

    if (settings) {
        if (settings.image) {
            const optimizedHeader = getOptimizedImageUrl(settings.image, 1200);
            banner.style.backgroundImage = `url('${optimizedHeader}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center center';
            banner.style.backgroundRepeat = 'no-repeat';
        }
        if (settings.color) {
            banner.style.backgroundColor = settings.color;
            const root = document.documentElement;
            root.style.setProperty('--category-primary', settings.color);
            root.style.setProperty('--category-glow', settings.color + '80');
        }
    } else {
        // Fallback
        banner.classList.add(`theme-${category}`);
    }

    // Also update body class for FABs and indicators
    document.body.classList.remove('theme-burgers', 'theme-chicken', 'theme-extras', 'theme-drinks', 'theme-all');
    document.body.classList.add(`theme-${category}`);

    // Update CSS variable for dynamic components (Legacy Support)
    const root = document.documentElement;
    if (!settings) {
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
}

// Handle category click
function handleCategoryClick(e) {
    const btn = e.target;
    const category = btn.dataset.category;

    if (category === currentCategory) return;

    // Update active button
    // Update active button
    categoryButtons.forEach(b => {
        b.classList.remove('active');
        // Reset dynamic styles
        b.style.backgroundColor = '';
        b.style.color = '';
        b.style.boxShadow = '';
    });
    btn.classList.add('active');

    // Apply dynamic active color if available
    if (menuData.categorySettings && menuData.categorySettings[category]) {
        const settings = menuData.categorySettings[category];
        if (settings.color) {
            btn.style.backgroundColor = settings.color;
            btn.style.color = 'white';
            btn.style.boxShadow = `0 4px 15px ${settings.color}66`; // 40% opacity hex
        }
    }

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
            // Preload the OPTIMIZED version
            img.src = getOptimizedImageUrl(product.image, 500);
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

// Initial Skeleton Loader
function renderSkeletonGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Create a temporary container for skeletons
    // Using 4 columns x 2 rows = 8 cards
    let html = '<div class="category-grid-container" style="display:grid; opacity:1;">';

    for (let i = 0; i < 8; i++) {
        html += `
        <div class="product-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-text title" style="width: 60%; margin: 0 auto 12px;"></div>
            <div class="skeleton skeleton-text medium"></div>
            <div class="skeleton skeleton-text short"></div>
        </div>
        `;
    }
    html += '</div>';
    grid.innerHTML = html;
}

// Show skeletons immediately
renderSkeletonGrid();

// Initialization Logic
async function init() {
    try {
        console.log('Fetching live menu from API...');
        // SMART API DETECTION
        // If on localhost (dev), assume port 5174. If on Render (prod), use relative path.
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_URL = isLocal && window.location.port === '5173' ? 'http://localhost:5174/api/menu' : '/api/menu';

        let response;
        try {
            response = await fetch(API_URL);
            if (!response.ok) throw new Error('API unreachable');
        } catch (err) {
            console.warn('API failed, falling back to local menu.json', err);
            response = await fetch('menu.json');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menuData = await response.json();
        console.log('Menu data loaded:', menuData);

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
