
// ==========================================
// Mouse Drag Scroll for PC
// ==========================================
function enableDragScroll(selector) {
    const slider = document.querySelector(selector);
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        // Disable pointer events on buttons during drag to prevent clicking
        slider.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = 'none');
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
        // Re-enable clicks
        slider.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = 'auto');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
        // Small delay to allow distinguishing click from drag, but simple 'auto' works for now
        setTimeout(() => {
            slider.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = 'auto');
        }, 50);
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Enable for Category Nav
window.addEventListener('DOMContentLoaded', () => {
    // Also style the cursor initially
    const nav = document.querySelector('.category-nav');
    if (nav) nav.style.cursor = 'grab';
    enableDragScroll('.category-nav');
});
