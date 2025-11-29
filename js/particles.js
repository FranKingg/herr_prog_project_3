//FUNCIONES PARA PARTICULAS

function createParticle() {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    const size = Math.random() * 6 + 4; 
    particle.style.width = size + "px";
    particle.style.height = size + "px";

    particle.style.left = Math.random() * window.innerWidth + "px";
    particle.style.top = (window.innerHeight - 20) + "px";

    particle.style.animationDuration = (Math.random() * 3 + 2) + "s";

    document.getElementById("particles").appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 4000);
}

setInterval(createParticle, 120);

function spawnLavaParticle() {
    const dot = document.createElement("div");
    dot.classList.add("lava-dot");

    // tamaño aleatorio
    const size = Math.random() * 4 + 4;
    dot.style.width = size + "px";
    dot.style.height = size + "px";

    // posición aleatoria horizontal
    dot.style.left = Math.random() * window.innerWidth + "px";

    // posición inicial baja
    dot.style.top = (window.innerHeight - 10) + "px";

    // velocidad aleatoria
    dot.style.animationDuration = (Math.random() * 2 + 2) + "s";

    document.getElementById("lava-particles").appendChild(dot);

    // eliminar después de animarse
    setTimeout(() => {
        dot.remove();
    }, 4000);
}

// crear partículas constantemente
setInterval(spawnLavaParticle, 120);
