document.addEventListener("DOMContentLoaded", () => {
    const initParticles = async () => {
        if (!window.tsParticles) return;
        await tsParticles.load("tsparticles", {
        fullScreen: { enable: false },
        background: { color: { value: "transparent" } },
        fpsLimit: 120,
        interactivity: {
            events: {
                onClick: { enable: true, mode: "push" },
                onHover: { 
                    enable: true, 
                    mode: "grab", 
                    parallax: { enable: true, force: 30, smooth: 15 } 
                },
                resize: true
            },
            modes: {
                push: { quantity: 4 },
                grab: { 
                    distance: 180, 
                    links: { opacity: 0.35, color: "#FF6600" } 
                }
            }
        },
        particles: {
            color: { value: ["#FF6600", "#6100B7", "#CB3395"] },
            links: { 
                color: "#6100B7", 
                distance: 140, 
                enable: true, 
                opacity: 0.15, 
                width: 1 
            },
            collisions: { enable: false },
            move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: true,
                speed: 0.6,
                straight: false
            },
            number: { 
                density: { enable: true, area: 800 }, 
                value: 55 
            },
            opacity: {
                value: { min: 0.1, max: 0.4 },
                animation: { enable: true, speed: 0.8, minimumValue: 0.1 }
            },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 2.5 } }
        },
        detectRetina: true
    });
};

    // Delay initialization to improve Total Blocking Time (TBT)
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            setTimeout(initParticles, 1500);
        });
    } else {
        setTimeout(initParticles, 2000);
    }
});
