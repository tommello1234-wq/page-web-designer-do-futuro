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
                        parallax: { enable: true, force: 60, smooth: 10 } 
                    },
                    resize: true
                },
                modes: {
                    push: { quantity: 4 },
                    grab: { 
                        distance: 200, 
                        links: { opacity: 0.5, color: "#FF6600" } 
                    }
                }
            },
            particles: {
                color: { value: ["#FF6600", "#6100B7", "#CB3395"] },
                links: { 
                    color: "#6100B7", 
                    distance: 150, 
                    enable: true, 
                    opacity: 0.2, 
                    width: 1 
                },
                collisions: { enable: false },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: { default: "bounce" },
                    random: true,
                    speed: 0.8,
                    straight: false
                },
                number: { 
                    density: { enable: true, area: 800 }, 
                    value: 60 
                },
                opacity: {
                    value: { min: 0.1, max: 0.5 },
                    animation: { enable: true, speed: 1, minimumValue: 0.1 }
                },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 3 } }
            },
            detectRetina: true
        });
    };

    // Run immediately since this script is already lazy-loaded
    initParticles();
