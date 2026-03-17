/**
 * UI Interactions for Section 3 & Interactive Switch
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. HOLOGRAM CARD TRACKING
    const cards = document.querySelectorAll('.holographic-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // 2. ELITE MODE TOGGLE & MEDIA SWITCHER
    const toggle = document.getElementById('elite-toggle');
    const body = document.body;
    const mediaImg = document.getElementById('media-img');
    const mediaVideo = document.getElementById('media-video');
    const switchThumb = toggle?.querySelector('.luxury-switch-thumb');
    const statusLabel = document.getElementById('power-status-label');

    if (toggle) {
        toggle.addEventListener('click', () => {
            const isActive = toggle.classList.toggle('active');
            body.classList.toggle('elite-mode');
            
            // Update Status Text
            if (statusLabel) {
                statusLabel.textContent = isActive 
                    ? 'Status: Site Interativo e animado' 
                    : 'Status: Site Estático';
            }
            
            // Trigger Switch Spark
            if (switchThumb) {
                switchThumb.classList.remove('spark');
                void switchThumb.offsetWidth;
                switchThumb.classList.add('spark');
            }
            
            if (isActive) {
                // Switch to Video — lazy create iframe on first activation
                if (mediaVideo && !mediaVideo.querySelector('iframe')) {
                    const iframe = document.createElement('iframe');
                    iframe.src = 'https://www.youtube.com/embed/3y9NK0ZF9io?start=203&autoplay=1&mute=1&loop=1&playlist=3y9NK0ZF9io&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1';
                    iframe.frameBorder = '0';
                    iframe.allow = 'autoplay; fullscreen; encrypted-media';
                    iframe.setAttribute('playsinline', '');
                    mediaVideo.appendChild(iframe);
                }
                mediaImg.classList.remove('active');
                mediaVideo.classList.add('active');
            } else {
                // Switch back to Image
                mediaImg.classList.add('active');
                mediaVideo.classList.remove('active');
            }
            
            console.log('Visual Mode:', isActive ? 'ELITE' : 'COMMON');
        });
    }

    // 2.5 YOUTUBE FACADE — auto-load iframe on scroll into view
    const facadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const facade = entry.target;
                const id = facade.dataset.ytId;
                const iframe = document.createElement('iframe');
                iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&mute=1&loop=1&playlist=' + id + '&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1';
                iframe.frameBorder = '0';
                iframe.allow = 'autoplay; fullscreen; encrypted-media';
                iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
                iframe.setAttribute('playsinline', '');
                facade.innerHTML = '';
                facade.appendChild(iframe);
                facade.style.cursor = 'default';
                facadeObserver.unobserve(facade);
            }
        });
    }, { rootMargin: '200px' });

    document.querySelectorAll('.yt-facade').forEach(facade => {
        facadeObserver.observe(facade);
    });

    // 3. REVEAL ON SCROLL
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animate-in elements
    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

    // 4. 3D MODULE SLIDER ROTATION
    const banner3d = document.querySelector('.banner-3d');
    const slider3d = document.querySelector('.banner-3d .slider');

    if (slider3d && banner3d) {
        let rotationY = 0;
        let velocity = 0.2;
        let targetVelocity = 0.2;
        const acceleration = 0.02;
        let isSliderVisible = false;

        const sliderObserver = new IntersectionObserver((entries) => {
            isSliderVisible = entries[0].isIntersecting;
        }, { threshold: 0.1 });

        sliderObserver.observe(banner3d);

        function animate3dSlider() {
            if (!isSliderVisible) {
                requestAnimationFrame(animate3dSlider);
                return;
            }

            if (velocity < targetVelocity) {
                velocity = Math.min(velocity + acceleration, targetVelocity);
            } else if (velocity > targetVelocity) {
                velocity = Math.max(velocity - acceleration, targetVelocity);
            }

            rotationY += velocity;

            slider3d.style.transform = `rotateX(-16deg) rotateY(${rotationY}deg)`;

            requestAnimationFrame(animate3dSlider);
        }

        animate3dSlider();

        slider3d.addEventListener('mouseenter', () => {
            targetVelocity = 0;
        });

        slider3d.addEventListener('mouseleave', () => {
            targetVelocity = 0.2;
        });
    }

    // 5. MOBILE MENU TOGGLE
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
            // Prevent scrolling when menu is open
            if (document.body.classList.contains('menu-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.remove('menu-open');
                document.body.style.overflow = '';
            });
        });
    }

});

/**
 * Global function for Showcase Accordion Interaction
 * @param {HTMLElement} element 
 */
function setActiveShowcase(element) {
    const parent = element.closest('.showcase-accordion');
    if (!parent) return;

    const items = parent.querySelectorAll('.showcase-item');
    
    items.forEach(item => {
        item.classList.remove('active');
    });

    element.classList.add('active');
}
