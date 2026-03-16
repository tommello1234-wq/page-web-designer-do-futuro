/**
 * scroll-animation.js
 * Lerp-based Scroll-Linked Video Frame Sequence Animation
 */
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('scroll-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // ==========================================
    // 1. CONFIGURAÇÕES
    // ==========================================
    const startFrame = 42;
    const endFrame = 169;
    const frameCount = endFrame - startFrame + 1;
    const framePath = (index) => `./ASSETS/FRAMES/frame_${(index + startFrame).toString().padStart(4, '0')}.webp`;
    
    // ==========================================
    // 2. PRELOAD NA MEMÓRIA
    // ==========================================
    const images = [];
    let loadedCount = 0;

    const preloadImages = () => {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === frameCount) {
                    console.log("All frames loaded successfully.");
                    startAnimation(); // Start loop after loading
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load frame: ${framePath(i)}`);
                loadedCount++; // Still increment to avoid blocking if one fails
            };
            img.src = framePath(i);
            images.push(img);
        }
    };

    // ==========================================
    // 3. VARIÁVEIS DE CÁLCULO FÍSICO (LERP)
    // ==========================================
    let targetFrame = 0;
    let currentDisplayFrame = 0;
    const lerpFactor = 0.05; // Ultra-smooth glide (reduced from 0.15)

    // ==========================================
    // 4. MOTOR DE RENDERIZAÇÃO
    // ==========================================
    let isAnimating = false;

    const renderHero = () => {
        // Linear Interpolation (Lerp)
        const frameDiff = targetFrame - currentDisplayFrame;
        currentDisplayFrame += frameDiff * lerpFactor;
        
        const index = Math.round(currentDisplayFrame);
        const imgIndex = Math.max(0, Math.min(index, frameCount - 1));
        const img = images[imgIndex];

        if (img && img.complete && img.naturalWidth !== 0) {
            // Adjust canvas internal resolution to match layout size
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                // Support high-DPI displays
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
            }
            
            const cw = rect.width;
            const ch = rect.height;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;
            
            // "Object-fit: contain" math
            const scale = Math.min(cw / iw, ch / ih);
            const dw = iw * scale;
            const dh = ih * scale;
            const dx = (cw - dw) / 2;
            const dy = (ch - dh) / 2;

            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, dx, dy, dw, dh);
        }
        
        // Stop animation if we're close enough to target
        if (Math.abs(frameDiff) > 0.01) {
            requestAnimationFrame(renderHero);
        } else {
            isAnimating = false;
        }
    };

    const startAnimation = () => {
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(renderHero);
        }
    };

    // ==========================================
    // 5. EVENTO DE SCROLL
    // ==========================================
    const heroSection = document.getElementById('inicio');
    
    const updateScrollProgress = () => {
        if (!heroSection) return;
        
        const rect = heroSection.getBoundingClientRect();
        const sectionHeight = heroSection.offsetHeight;
        
        // Progress based on how much of the section has scrolled past the top
        const scrollOffset = -rect.top;
        
        // Acceleration: We want the animation to finish SOONER.
        // We multiply the raw fraction by 2.0 so it reaches 1.0 twice as fast.
        const accelerationFactor = 2.0; 
        const scrollFraction = Math.max(0, Math.min((scrollOffset / sectionHeight) * accelerationFactor, 1.0));
        
        targetFrame = (frameCount - 1) * scrollFraction;
        startAnimation();
    };

    window.addEventListener('resize', () => {
        // Recalcular progresso no resize para manter sincronia
        updateScrollProgress();
    });
    
    // ==========================================
    // 6. LENIS SMOOTH SCROLL (Premium Inertial)
    // ==========================================
    const lenis = new Lenis({
        duration: 2.5, // Ultra-premium slow inertia (increased from 1.2)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0, 
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync animation with Lenis smooth scroll
    lenis.on('scroll', () => {
        updateScrollProgress();
    });

    // 7. SMOOTH INTERPRETATION OF ANCHOR LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: 0,
                    duration: 2.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // Initialize
    preloadImages();
    updateScrollProgress();
    startAnimation(); 
});
