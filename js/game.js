// =============================
// SISTEMA XP + NIVEL (HUD)
// =============================

// VARIABLES GLOBALES DESDE BD
let PLAYER_NIVEL = 1;
let PLAYER_EXP = 0;
let PLAYER_EXP_MAX = 1000;

// Recursos
let gold = 0;
let wood = 0;
let stone = 0;

// Torre
let towerLevel = 1;

// =============================
// BARRA DE EXP
// =============================

function actualizarBarraExp(exp, exp_max) {
    let porcentaje = (exp / exp_max) * 100;
    document.getElementById("exp-bar-fill").style.width = porcentaje + "%";
    document.getElementById("exp-bar-glow").style.width = porcentaje + "%";
    document.getElementById("exp-text").textContent = `${exp} / ${exp_max} EXP`;
}

function animacionSubirNivel() {
    const glow = document.getElementById("exp-bar-glow");
    glow.style.transition = "width 0.2s ease-out";
    glow.style.width = "100%";

    setTimeout(() => {
        glow.style.width = "0%";
        glow.style.transition = "width 0.9s ease-out";
    }, 250);
}

// =============================
// ../php LOADERS
// =============================

async function cargarJugador() {
    let res = await fetch("../php/get_player.php");
    let data = await res.json();

    if (data.error) {
        console.error("Error al cargar jugador:", data.error);
        return;
    }

    PLAYER_NIVEL = data.nivel;
    PLAYER_EXP = data.exp;
    PLAYER_EXP_MAX = data.exp_max;

    document.getElementById("nivel").textContent = PLAYER_NIVEL;
    actualizarBarraExp(PLAYER_EXP, PLAYER_EXP_MAX);
}

async function cargarRecursos() {
    let res = await fetch("../php/get_resources.php");
    let data = await res.json();

    if (!data.error) {
        gold = data.oro;
        wood = data.madera;
        stone = data.piedra;
        updateUI();
    }
}

function saveResources() {
    fetch("../php/save_resources.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            oro: gold,
            madera: wood,
            piedra: stone
        })
    });
}

function saveProgress() {
    fetch("../php/save_progress.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ oleada: currentRound })
    });
}

function saveTroops() {
    fetch("../php/save_troops.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            tropas: {
                melee: meleeCount,
                shotgun: shotgunCount,
                rifle: rifleCount
            }
        })
    });
}

function saveTower() {
    fetch("../php/save_tower.php", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            vida: tower.health,
            nivel: towerLevel
        })
    });
}

// =============================
// SUMAR EXP (SERVER)
// =============================

async function ganarExp(cantidad) {
    let res = await fetch("../php/add_exp.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ exp: cantidad })
    });

    let data = await res.json();

    if (data.error) {
        console.error("Error al sumar EXP:", data.error);
        return;
    }

    PLAYER_NIVEL = data.nivel;
    PLAYER_EXP = data.exp;
    PLAYER_EXP_MAX = data.exp_max;

    document.getElementById("nivel").textContent = PLAYER_NIVEL;
    actualizarBarraExp(PLAYER_EXP, PLAYER_EXP_MAX);

    if (data.subio_nivel) {
        animacionSubirNivel();
    }
}

// =============================
// TOWER DEFENSE GAME
// =============================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ========================================
// VARIABLES GLOBALES DEL JUEGO
// ========================================

let upgradeCost = 50;
let damageBonus = 0;

// Contadores tropas
let meleeCount = 0;
let shotgunCount = 0;
let rifleCount = 0;

// Arrays
let allies = [];
let enemies = [];
let projectiles = [];
let damageTexts = [];

// Centro del mapa
const center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 80
};

// Torre
const tower = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    health: 100,
    maxHealth: 100
};

// Oleadas
let currentRound = 0;
let enemiesPerRound = 5;
let enemiesSpawnedThisRound = 0;
let roundActive = false;
let roundBreakTimer = 0;
let roundBreakDuration = 15 * 60;
let enemySpawnTimer = 0;
let enemySpawnInterval = 120;
let gameRunning = true;

// ========================================
// CLASES
// ========================================

class Ally {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = 15;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.attackCooldown = 0;

        if (type === 'melee') {
            this.color = '#4CAF50';
            this.maxHealth = 10;
            this.health = 10;
            this.damage = 1;
            this.attackSpeed = 60;
            this.range = 30;
        } else if (type === 'shotgun') {
            this.color = '#FF9800';
            this.maxHealth = 8;
            this.health = 8;
            this.damage = 1;
            this.attackSpeed = 90;
            this.range = 150;
        } else if (type === 'rifle') {
            this.color = '#2196F3';
            this.maxHealth = 6;
            this.health = 6;
            this.damage = 2;
            this.attackSpeed = 75;
            this.range = 200;
        }
    }

    update() {
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Buscar enemigo
        this.target = null;
        let minDist = this.range;

        for (let enemy of enemies) {
            let dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < minDist) {
                minDist = dist;
                this.target = enemy;
            }
        }

        // Melee persigue
        if (this.type === 'melee' && this.target) {
            let dx = this.target.x - this.x;
            let dy = this.target.y - this.y;
            let dist = Math.hypot(dx, dy);

            if (dist > this.range - 5) {
                let speed = 1.5;
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            }
        }

        // Atacar
        if (this.target && this.attackCooldown === 0) {
            this.attack();
            this.attackCooldown = this.attackSpeed;
        }
    }

    attack() {
        if (this.type === 'melee') {
            let isCrit = Math.random() < 0.25;
            let dmg = this.damage + damageBonus;
            if (isCrit) dmg *= 2;

            this.target.takeDamage(dmg, isCrit);

        } else if (this.type === 'shotgun') {
            for (let i = 0; i < 5; i++) {
                let angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                angle += (Math.random() - 0.5) * 0.4;

                projectiles.push(new Projectile(
                    this.x, this.y, angle, 'shotgun', this.damage + damageBonus
                ));
            }

        } else if (this.type === 'rifle') {
            for (let i = 0; i < 3; i++) {
                let angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                angle += (Math.random() - 0.5) * 0.1;

                setTimeout(() => {
                    projectiles.push(new Projectile(
                        this.x, this.y, angle, 'rifle', this.damage + damageBonus
                    ));
                }, i * 100);
            }
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) this.die();
    }

    die() {
        let index = allies.indexOf(this);
        if (index > -1) allies.splice(index, 1);

        if (this.type === 'melee') meleeCount--;
        if (this.type === 'shotgun') shotgunCount--;
        if (this.type === 'rifle') rifleCount--;

        saveTroops();
        updateUI();
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        let barWidth = this.size;
        let healthPercent = this.health / this.maxHealth;

        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 8, barWidth, 4);

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 8, barWidth * healthPercent, 4);
    }
}

// =============================
// ENEMY CLASS
// =============================

class Enemy {
    constructor() {
        let side = Math.floor(Math.random() * 4);
        if (side === 0) {
            this.x = Math.random() * canvas.width;
            this.y = -20;
        } else if (side === 1) {
            this.x = canvas.width + 20;
            this.y = Math.random() * canvas.height;
        } else if (side === 2) {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 20;
        } else {
            this.x = -20;
            this.y = Math.random() * canvas.height;
        }

        this.size = 12;
        this.health = 10;
        this.maxHealth = 10;
        this.speed = 1;
        this.damage = 1;
        this.attackCooldown = 0;
        this.color = '#F44336';
    }

    update() {
        if (this.attackCooldown > 0) this.attackCooldown--;

        let dx = tower.x - this.x;
        let dy = tower.y - this.y;
        let dist = Math.hypot(dx, dy);

        if (dist > tower.size / 2 + 5) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;

            for (let ally of allies) {
                let d2 = Math.hypot(ally.x - this.x, ally.y - this.y);
                if (d2 < this.size + ally.size && this.attackCooldown === 0) {
                    ally.takeDamage(this.damage);
                    this.attackCooldown = 60;
                }
            }
        } else {
            if (this.attackCooldown === 0) {
                tower.health -= this.damage;
                saveTower();

                if (tower.health <= 0) {
                    gameOver();
                }

                this.attackCooldown = 60;
            }
        }
    }

    takeDamage(dmg, isCrit) {
        this.health -= dmg;
        damageTexts.push(new DamageText(this.x, this.y, dmg, isCrit));

        if (this.health <= 0) this.die();
    }

    die() {
        let index = enemies.indexOf(this);
        if (index > -1) enemies.splice(index, 1);

        gold += 25;
        saveResources();
        ganarExp(1);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        let healthPercent = this.health / this.maxHealth;

        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2 - 7, this.size, 3);

        ctx.fillStyle = '#F44336';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2 - 7, this.size * healthPercent, 3);
    }
}

// =============================
// PROJECTILE
// =============================

class Projectile {
    constructor(x, y, angle, type, damage) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.type = type;
        this.damage = damage;
        this.speed = type === 'rifle' ? 8 : 6;
        this.size = type === 'rifle' ? 4 : 3;
        this.life = 100;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life--;

        for (let enemy of enemies) {
            let dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < enemy.size) {
                let isCrit = Math.random() < 0.25;
                let dmg = this.damage;
                if (isCrit) dmg *= 2;

                enemy.takeDamage(dmg, isCrit);
                this.life = 0;
                break;
            }
        }

        if (this.life <= 0 ||
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height
        ) {
            let index = projectiles.indexOf(this);
            if (index > -1) projectiles.splice(index, 1);
        }
    }

    draw() {
        ctx.fillStyle = this.type === 'rifle' ? '#2196F3' : '#FF9800';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =============================
// DAMAGE TEXT
// =============================

class DamageText {
    constructor(x, y, damage, isCrit) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.isCrit = isCrit;
        this.life = 60;
        this.vy = -2;
    }

    update() {
        this.y += this.vy;
        this.life--;

        if (this.life <= 0) {
            let index = damageTexts.indexOf(this);
            if (index > -1) damageTexts.splice(index, 1);
        }
    }

    draw() {
        ctx.font = this.isCrit ? 'bold 18px Arial' : 'bold 14px Arial';
        ctx.fillStyle = this.isCrit ? '#FF0000' : '#FFF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        let text = this.isCrit ? 'CRÍTICO!' : `-${this.damage}`;

        ctx.strokeText(text, this.x, this.y);
        ctx.fillText(text, this.x, this.y);
    }
}

// =============================
// GAME FUNCTIONS
// =============================

function spawnEnemy() {
    if (roundActive && enemiesSpawnedThisRound < enemiesPerRound) {
        enemies.push(new Enemy());
        enemiesSpawnedThisRound++;

        if (enemiesSpawnedThisRound >= enemiesPerRound) {
            roundActive = false;
        }
    }
}

function buyAlly(type) {
    let cost, maxCount, currentCount;

    if (type === 'melee') {
        cost = 50;
        maxCount = 10;
        currentCount = meleeCount;
    } else if (type === 'shotgun') {
        cost = 100;
        maxCount = 5;
        currentCount = shotgunCount;
    } else if (type === 'rifle') {
        cost = 150;
        maxCount = 3;
        currentCount = rifleCount;
    }

    if (gold >= cost && currentCount < maxCount) {
        gold -= cost;
        saveResources();

        let x = center.x + (Math.random() - 0.5) * (center.size - 20);
        let y = center.y + (Math.random() - 0.5) * (center.size - 20);

        allies.push(new Ally(type, x, y));

        if (type === 'melee') meleeCount++;
        if (type === 'shotgun') shotgunCount++;
        if (type === 'rifle') rifleCount++;

        saveTroops();
        updateUI();
    }
}

function upgradeAllies() {
    if (PLAYER_EXP >= upgradeCost) {
        ganarExp(-upgradeCost);
        damageBonus++;
        upgradeCost += 50;
        updateUI();
    }
}

function updateUI() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('wood').textContent = wood;
    document.getElementById('stone').textContent = stone;
    document.getElementById('melee-count').textContent = meleeCount;
    document.getElementById('shotgun-count').textContent = shotgunCount;
    document.getElementById('rifle-count').textContent = rifleCount;
    document.getElementById('upgrade-cost').textContent = upgradeCost;
}

function guardarOleadaAlTerminar() {
    if (!roundActive && enemies.length === 0 && enemiesSpawnedThisRound > 0) {
        saveProgress();
    }
}

function gameOver() {
    gameRunning = false;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#FF0000';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillText('La torre ha sido destruida', canvas.width / 2, canvas.height / 2 + 50);
}

// =============================
// GAME LOOP
// =============================

function gameLoop() {
    if (!gameRunning) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    ctx.fillRect(center.x - center.size/2, center.y - center.size/2, center.size, center.size);

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(center.x - center.size/2, center.y - center.size/2, center.size, center.size);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(tower.x - tower.size/2, tower.y - tower.size/2, tower.size, tower.size);

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(tower.x - tower.size/2, tower.y - tower.size/2, tower.size, tower.size);

    let towerHealthPercent = tower.health / tower.maxHealth;

    ctx.fillStyle = '#333';
    ctx.fillRect(center.x - center.size/2, center.y + center.size/2 + 10, center.size, 8);

    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(center.x - center.size/2, center.y + center.size/2 + 10, center.size * towerHealthPercent, 8);

    if (roundActive) {
        enemySpawnTimer++;
        if (enemySpawnTimer >= enemySpawnInterval) {
            spawnEnemy();
            enemySpawnTimer = 0;
        }
    } else {
        if (enemies.length === 0) {
            guardarOleadaAlTerminar();

            roundBreakTimer++;
            let secondsLeft = Math.ceil((roundBreakDuration - roundBreakTimer) / 60);

            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';

            if (currentRound === 0) {
                ctx.fillText('¡Prepárate para la batalla!', canvas.width / 2, 50);
                ctx.fillText(`La ronda 1 comienza en: ${secondsLeft}s`, canvas.width / 2, 80);
            } else {
                ctx.fillText(`Ronda ${currentRound} Completada!`, canvas.width / 2, 50);
                ctx.fillText(`Siguiente ronda en: ${secondsLeft}s`, canvas.width / 2, 80);
            }

            if (roundBreakTimer >= roundBreakDuration) {
                currentRound++;
                if (currentRound > 1) enemiesPerRound += 3;

                enemiesSpawnedThisRound = 0;
                roundActive = true;
                roundBreakTimer = 0;
            }
        }
    }

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'left';

    if (currentRound > 0) {
        ctx.fillText(`Ronda: ${currentRound}`, 10, 30);
        ctx.fillText(`Enemigos: ${enemies.length}/${enemiesPerRound}`, 10, 55);
        if (roundActive) {
            ctx.fillText(`Por aparecer: ${enemiesPerRound - enemiesSpawnedThisRound}`, 10, 80);
        }
    } else {
        ctx.fillText('Preparación...', 10, 30);
    }

    for (let ally of allies) {
        ally.update();
        ally.draw();
    }

    for (let enemy of enemies) {
        enemy.update();
        enemy.draw();
    }

    for (let proj of projectiles) {
        proj.update();
        proj.draw();
    }

    for (let text of damageTexts) {
        text.update();
        text.draw();
    }

    requestAnimationFrame(gameLoop);
}

// =============================
// EVENTS
// =============================

document.getElementById('btn-melee').addEventListener('click', () => buyAlly('melee'));
document.getElementById('btn-shotgun').addEventListener('click', () => buyAlly('shotgun'));
document.getElementById('btn-rifle').addEventListener('click', () => buyAlly('rifle'));
document.getElementById('btn-upgrade').addEventListener('click', () => upgradeAllies());

// =============================
// INIT
// =============================

cargarJugador().then(() => {
    cargarRecursos().then(() => {
        updateUI();
        gameLoop();
    });
});
