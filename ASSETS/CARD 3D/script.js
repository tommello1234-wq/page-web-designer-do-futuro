document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.slider');
    const centerPhoto = document.querySelector('.center-photo');

    let rotationY = 0;
    let velocity = 0.5; // Velocidade inicial
    let targetVelocity = 0.5;
    const acceleration = 0.02; // Quão rápido ele acelera/desacelera

    function animate() {
        // Suavizar a transição da velocidade (Efeito de Inércia)
        if (velocity < targetVelocity) {
            velocity = Math.min(velocity + acceleration, targetVelocity);
        } else if (velocity > targetVelocity) {
            velocity = Math.max(velocity - acceleration, targetVelocity);
        }

        rotationY += velocity;

        // Aplicar a rotação ao slider
        if (slider) {
            slider.style.transform = `rotateX(-16deg) rotateY(${rotationY}deg)`;
        }

        // Aplicar a rotação inversa à foto central para mantê-la estável
        // Mantendo o translateZ(0) para o contexto 3D correto
        if (centerPhoto) {
            centerPhoto.style.transform = `translate(-50%, -50%) rotateY(${-rotationY}deg) translateZ(0)`;
        }

        requestAnimationFrame(animate);
    }

    // Iniciar a animação
    animate();

    // Controles de hover
    slider.addEventListener('mouseenter', () => {
        targetVelocity = 0; // Desacelera até parar
    });

    slider.addEventListener('mouseleave', () => {
        targetVelocity = 0.5; // Volta à velocidade normal
    });
});
