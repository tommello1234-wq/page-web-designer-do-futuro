/**
 * Scroll-based Canvas Animation
 * High-Ticket "Apple Style" smooth transition
 */

const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d");

const frameCount = 120;
const currentFrame = index => (
  `ASSETS/frames/frame_${index.toString().padStart(4, '0')}.webp`
);

const images = [];
const frameState = {
  frame: 1
};

// Preload images
const preloadImages = () => {
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }
};

const render = () => {
    const img = images[frameState.frame - 1];
    if (img && img.complete) {
        // Object-fit: cover logic for canvas
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawWidth = canvas.height * imgAspect;
            drawHeight = canvas.height;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
};

const handleScroll = () => {
    const html = document.documentElement;
    const heroSection = document.querySelector('.hero');
    const sectionTop = heroSection.offsetTop;
    const sectionHeight = heroSection.offsetHeight;
    const scrollTop = window.pageYOffset || html.scrollTop;
    
    // Calculate progress within the hero section
    let progress = (scrollTop - sectionTop) / (sectionHeight - window.innerHeight);
    progress = Math.max(0, Math.min(1, progress));
    
    const nextFrame = Math.max(1, Math.min(frameCount, Math.ceil(progress * frameCount)));
    
    if (frameState.frame !== nextFrame) {
        frameState.frame = nextFrame;
        requestAnimationFrame(render);
    }
};

const initCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
};

window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', initCanvas);

// Initial scale and load
preloadImages();
// Force first render when first image loads
images[0].onload = render;

// Set hero height to allow scroll (e.g., 300vh for a substantial animation)
// This can also be set in CSS
initCanvas();
