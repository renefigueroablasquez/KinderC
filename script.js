const character = document.getElementById('character');
const school = document.getElementById('school');
const gameContainer = document.getElementById('game-container');

let positionX = 50;
let positionY = 50;
let isJumping = false;
let keysPressed = {};
let hasWon = false; // Variable para controlar si ya se ganó
let groundLevel = 50; // Nivel del suelo por defecto
let animationFrameId;

function handleKeyDown(event) {
    keysPressed[event.key] = true;

    if (event.key === ' ' && !isJumping) {
        isJumping = true;
        jump(100);
    }
}

function handleKeyUp(event) {
    keysPressed[event.key] = false;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function updateDebugPanel() {
    document.getElementById('debug-position-x').textContent = positionX;
    document.getElementById('debug-position-y').textContent = positionY;
    document.getElementById('debug-is-jumping').textContent = isJumping;
    document.getElementById('debug-keys-pressed').textContent = JSON.stringify(keysPressed);

    // Extraer solo el nombre del archivo de la URL de backgroundImage
    const backgroundImage = character.style.backgroundImage;
    const imageName = backgroundImage.match(/[^/]+\.png/); // Corrige la expresión regular
    document.getElementById('debug-background-image').textContent = imageName ? imageName[0] : 'none';

    // Actualiza el estado de checkWin en el panel de depuración
    const characterRect = character.getBoundingClientRect();
    const schoolRect = school.getBoundingClientRect();
    const isWinning = (
        characterRect.right >= schoolRect.left &&
        characterRect.left <= schoolRect.right &&
        characterRect.bottom >= schoolRect.top &&
        characterRect.top <= schoolRect.bottom
    );
    document.getElementById('debug-check-win').textContent = isWinning;

    document.getElementById('debug-ground-level').textContent = groundLevel; // Muestra el nivel del suelo
}

function checkPlatformCollision() {
    const characterRect = character.getBoundingClientRect();
    const platformRect = document.getElementById('platform').getBoundingClientRect();
    const isOnPlatform = (
        characterRect.bottom >= platformRect.top &&
        characterRect.bottom <= platformRect.top + 5 && // Tolerancia para la colisión
        characterRect.right > platformRect.left &&
        characterRect.left < platformRect.right
    );

    // Verifica si el personaje está sobre la plataforma
    if (isOnPlatform) {
        groundLevel = 115; // Ajusta el nivel del suelo a la plataforma
    } else {
        var hasToFall = groundLevel != 50;
        groundLevel = 50; // Restablece el nivel del suelo al valor por defecto

        if (hasToFall) {
            jump(0); // Si el personaje no está en la plataforma, inicia la caída
        }
    }
}

function jump(j) {
    let jumpHeight = j;

    const jumpUp = setInterval(() => {
        if (jumpHeight > 0) {
            positionY += 5;
            jumpHeight -= 5;
            character.style.bottom = `${positionY}px`;
            character.style.animation = 'jump-up-animation 0.5s steps(1) infinite'; // Imagen de salto hacia arriba
        } else {
            clearInterval(jumpUp);
            character.style.animation = 'jump-fall-animation 0.5s steps(1) infinite'; // Imagen de caída

            const fallDown = setInterval(() => {
                if (positionY > groundLevel) {
                    positionY -= 5;
                    character.style.bottom = `${positionY}px`;
                } else {
                    clearInterval(fallDown);
                    isJumping = false;
                    if (!keysPressed['ArrowLeft'] && !keysPressed['ArrowRight']) {
                        character.style.animation = 'idle-animation 0.5s steps(2) infinite'; // Restaurar animación de reposo
                    }
                }
            }, 20);
        }
    }, 20);
}

function updateCharacterPosition() {
    if (hasWon) return; // Si ya se ganó, no hacer nada
    
    const step = 5;
    const containerRect = gameContainer.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();

    if (keysPressed['ArrowLeft'] && characterRect.left > containerRect.left) {
        positionX -= step;
        if (!isJumping) {
            character.style.animation = 'run-animation 0.5s steps(4) infinite';
        }
        character.style.transform = 'scaleX(-1)';
    }

    if (keysPressed['ArrowRight'] && characterRect.right < containerRect.right) {
        positionX += step;
        if (!isJumping) {
            character.style.animation = 'run-animation 0.5s steps(4) infinite';
        }
        character.style.transform = 'scaleX(1)';
    }

    if (!keysPressed['ArrowLeft'] && !keysPressed['ArrowRight'] && !isJumping) {
        character.style.animation = 'idle-animation 0.5s steps(2) infinite';
    }

    character.style.left = `${positionX}px`;

    checkPlatformCollision(); // Verifica la colisión con la plataforma
    checkWin(); // Llama a la función para verificar si el personaje llegó al colegio

    updateDebugPanel(); // Actualiza el panel de depuración
    animationFrameId = requestAnimationFrame(updateCharacterPosition);
}

updateCharacterPosition();

function checkWin() {
    if (hasWon) return; // Si ya se ganó, no hacer nada

    const characterRect = character.getBoundingClientRect();
    const schoolRect = school.getBoundingClientRect();
    const isWinning = (
        characterRect.right >= schoolRect.left &&
        characterRect.left <= schoolRect.right &&
        characterRect.bottom >= schoolRect.top &&
        characterRect.top <= schoolRect.bottom
    );

    if (isWinning) {
        hasWon = true; // Marcar que ya se ganó
        cancelAnimationFrame(animationFrameId); // Detener el bucle de actualización

        // Mover el personaje al centro
        positionX = (gameContainer.offsetWidth - character.offsetWidth) / 2;
        positionY = 50; // Mantenerlo sobre el suelo
        character.style.left = `${positionX}px`;
        character.style.bottom = `${positionY}px`;

        // Cambiar a la animación idle
        character.style.animation = 'idle-animation 0.5s steps(2) infinite';

        // Deshabilitar movimiento y salto
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);

        // Mostrar la imagen de victoria y los fuegos artificiales
        const winOverlay = document.getElementById('win-overlay');
        const fireworks = document.querySelector('.fireworks');
        winOverlay.style.visibility = 'visible';
        fireworks.style.visibility = 'visible';
    }
}