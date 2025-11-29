// ========================================
// TOWER DEFENSE GAME
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ========================================
// VARIABLES GLOBALES
// ========================================

let gold = 100;
let exp = 0;
let upgradeCost = 50;
let damageBonus = 0;

// Contadores de unidades
let meleeCount = 0;
let shotgunCount = 0;
let rifleCount = 0;

// Arrays de entidades
let allies = [];
let enemies = [];
let projectiles = [];
let damageTexts = [];

// Centro del juego (cuadrado negro)
const center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 80
};

// Torre central (objetivo real de los enemigos)
const tower = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    health: 100,
    maxHealth: 100
};

// Control de oleadas
let currentRound = 0;
let enemiesPerRound = 5;
let enemiesSpawnedThisRound = 0;
let roundActive = false;
let roundBreakTimer = 0;
let roundBreakDuration = 15 * 60; // 15 segundos a 60 FPS
let enemySpawnTimer = 0;
let enemySpawnInterval = 120; // frames entre spawns
let gameRunning = true;

// ========================================
// CLASES
// ========================================

class Ally {
    constructor(type, x, y) {
        this.type = type; // 'melee', 'shotgun', 'rifle'
        this.x = x;
        this.y = y;
        this.size = 15;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.attackCooldown = 0;
        this.target = null;
        
        // Configuración según tipo
        if (type === 'melee') {
            this.color = '#4CAF50';
            this.maxHealth = 10;
            this.health = 10;
            this.damage = 1;
            this.attackSpeed = 60; // frames
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
        
        // Buscar enemigo más cercano
        this.target = null;
        let minDist = this.range;
        
        for (let enemy of enemies) {
            let dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < minDist) {
                minDist = dist;
                this.target = enemy;
            }
        }
        
        // Los guerreros cuerpo a cuerpo persiguen a los enemigos
        if (this.type === 'melee' && this.target) {
            let dx = this.target.x - this.x;
            let dy = this.target.y - this.y;
            let dist = Math.hypot(dx, dy);
            
            // Moverse hacia el enemigo si está fuera de rango
            if (dist > this.range - 5) {
                let speed = 1.5;
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            }
        }
        
        // Atacar si hay objetivo
        if (this.target && this.attackCooldown === 0) {
            this.attack();
            this.attackCooldown = this.attackSpeed;
        }
    }
    
    attack() {
        if (this.type === 'melee') {
            // Ataque cuerpo a cuerpo
            let isCrit = Math.random() < 0.25;
            let damage = this.damage + damageBonus;
            if (isCrit) damage *= 2;
            
            this.target.takeDamage(damage, isCrit);
        } else if (this.type === 'shotgun') {
            // Dispara 5 perdigones
            for (let i = 0; i < 5; i++) {
                let angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                angle += (Math.random() - 0.5) * 0.4; // Dispersión
                
                projectiles.push(new Projectile(
                    this.x, this.y, angle, 'shotgun', this.damage + damageBonus
                ));
            }
        } else if (this.type === 'rifle') {
            // Dispara 3 balas precisas
            for (let i = 0; i < 3; i++) {
                let angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                angle += (Math.random() - 0.5) * 0.1; // Poca dispersión
                
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
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        let index = allies.indexOf(this);
        if (index > -1) {
            allies.splice(index, 1);
            
            // Actualizar contador
            if (this.type === 'melee') meleeCount--;
            else if (this.type === 'shotgun') shotgunCount--;
            else if (this.type === 'rifle') rifleCount--;
            
            updateUI();
        }
    }
    
    draw() {
        // Cuerpo del aliado
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Borde
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Barra de vida
        let barWidth = this.size;
        let barHeight = 4;
        let healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 8, barWidth, barHeight);
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 8, barWidth * healthPercent, barHeight);
    }
}

class Enemy {
    constructor() {
        // Spawn desde los bordes
        let side = Math.floor(Math.random() * 4);
        if (side === 0) { // Arriba
            this.x = Math.random() * canvas.width;
            this.y = -20;
        } else if (side === 1) { // Derecha
            this.x = canvas.width + 20;
            this.y = Math.random() * canvas.height;
        } else if (side === 2) { // Abajo
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 20;
        } else { // Izquierda
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
        
        // Moverse hacia la torre central
        let dx = tower.x - this.x;
        let dy = tower.y - this.y;
        let dist = Math.hypot(dx, dy);
        
        if (dist > tower.size / 2 + 5) {
            // Moverse hacia la torre
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            
            // Verificar colisión con aliados
            for (let ally of allies) {
                let allyDist = Math.hypot(ally.x - this.x, ally.y - this.y);
                if (allyDist < this.size + ally.size && this.attackCooldown === 0) {
                    ally.takeDamage(this.damage);
                    this.attackCooldown = 60;
                }
            }
        } else {
            // Atacar la torre
            if (this.attackCooldown === 0) {
                tower.health -= this.damage;
                this.attackCooldown = 60;
                
                if (tower.health <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    takeDamage(damage, isCrit = false) {
        this.health -= damage;
        
        // Mostrar texto de daño
        damageTexts.push(new DamageText(this.x, this.y, damage, isCrit));
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        let index = enemies.indexOf(this);
        if (index > -1) {
            enemies.splice(index, 1);
            
            // Recompensas
            gold += 25;
            exp += 1;
            updateUI();
        }
    }
    
    draw() {
        // Cuerpo del enemigo
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Borde
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Barra de vida
        let barWidth = this.size;
        let barHeight = 3;
        let healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 7, barWidth, barHeight);
        
        ctx.fillStyle = '#F44336';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 7, barWidth * healthPercent, barHeight);
    }
}

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
        
        // Verificar colisión con enemigos
        for (let enemy of enemies) {
            let dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < enemy.size) {
                let isCrit = Math.random() < 0.25;
                let damage = this.damage;
                if (isCrit) damage *= 2;
                
                enemy.takeDamage(damage, isCrit);
                this.life = 0;
                break;
            }
        }
        
        // Eliminar si está fuera del canvas o sin vida
        if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
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

// ========================================
// FUNCIONES DEL JUEGO
// ========================================

function spawnEnemy() {
    if (roundActive && enemiesSpawnedThisRound < enemiesPerRound) {
        enemies.push(new Enemy());
        enemiesSpawnedThisRound++;
        
        // Si ya spawneamos todos los enemigos de esta ronda
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
        
        // Posición aleatoria dentro del cuadrado central
        let x = center.x + (Math.random() - 0.5) * (center.size - 20);
        let y = center.y + (Math.random() - 0.5) * (center.size - 20);
        
        allies.push(new Ally(type, x, y));
        
        if (type === 'melee') meleeCount++;
        else if (type === 'shotgun') shotgunCount++;
        else if (type === 'rifle') rifleCount++;
        
        updateUI();
    }
}

function upgradeAllies() {
    if (exp >= upgradeCost) {
        exp -= upgradeCost;
        damageBonus++;
        upgradeCost += 50;
        
        updateUI();
    }
}

function updateUI() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('exp').textContent = exp;
    document.getElementById('melee-count').textContent = meleeCount;
    document.getElementById('shotgun-count').textContent = shotgunCount;
    document.getElementById('rifle-count').textContent = rifleCount;
    document.getElementById('upgrade-cost').textContent = upgradeCost;
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

// ========================================
// GAME LOOP
// ========================================

function gameLoop() {
    if (!gameRunning) return;
    
    // Limpiar canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar cuadrado central (base)
    ctx.fillStyle = '#000';
    ctx.fillRect(center.x - center.size/2, center.y - center.size/2, center.size, center.size);
    
    // Borde del cuadrado
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(center.x - center.size/2, center.y - center.size/2, center.size, center.size);
    
    // Dibujar torre central
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(tower.x - tower.size/2, tower.y - tower.size/2, tower.size, tower.size);
    
    // Borde de la torre
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(tower.x - tower.size/2, tower.y - tower.size/2, tower.size, tower.size);
    
    // Detalle de la torre (ventanas/puerta)
    ctx.fillStyle = '#654321';
    ctx.fillRect(tower.x - 8, tower.y + 5, 16, 10); // Puerta
    ctx.fillRect(tower.x - 10, tower.y - 10, 6, 6); // Ventana izq
    ctx.fillRect(tower.x + 4, tower.y - 10, 6, 6); // Ventana der
    
    // Barra de vida de la torre
    let towerBarWidth = center.size;
    let towerBarHeight = 8;
    let towerHealthPercent = tower.health / tower.maxHealth;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(center.x - towerBarWidth/2, center.y + center.size/2 + 10, towerBarWidth, towerBarHeight);
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(center.x - towerBarWidth/2, center.y + center.size/2 + 10, towerBarWidth * towerHealthPercent, towerBarHeight);
    
    // Texto de vida de la torre
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText(`Torre: ${tower.health}/${tower.maxHealth}`, center.x, center.y + center.size/2 + 30);
    
    // Sistema de oleadas
    if (roundActive) {
        // Spawn de enemigos durante la ronda
        enemySpawnTimer++;
        if (enemySpawnTimer >= enemySpawnInterval) {
            spawnEnemy();
            enemySpawnTimer = 0;
        }
    } else {
        // Verificar si todos los enemigos han sido eliminados
        if (enemies.length === 0) {
            roundBreakTimer++;
            
            // Mostrar contador de descanso
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
            
            // Iniciar siguiente ronda después del descanso
            if (roundBreakTimer >= roundBreakDuration) {
                currentRound++;
                if (currentRound > 1) {
                    enemiesPerRound += 3; // Incrementar 3 enemigos por ronda (después de la 1)
                }
                enemiesSpawnedThisRound = 0;
                roundActive = true;
                roundBreakTimer = 0;
            }
        }
    }
    
    // Mostrar información de la ronda actual
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
    
    // Actualizar y dibujar aliados
    for (let ally of allies) {
        ally.update();
        ally.draw();
    }
    
    // Actualizar y dibujar enemigos
    for (let enemy of enemies) {
        enemy.update();
        enemy.draw();
    }
    
    // Actualizar y dibujar proyectiles
    for (let proj of projectiles) {
        proj.update();
        proj.draw();
    }
    
    // Actualizar y dibujar textos de daño
    for (let text of damageTexts) {
        text.update();
        text.draw();
    }
    
    requestAnimationFrame(gameLoop);
}

// ========================================
// EVENTOS
// ========================================

document.getElementById('btn-melee').addEventListener('click', () => buyAlly('melee'));
document.getElementById('btn-shotgun').addEventListener('click', () => buyAlly('shotgun'));
document.getElementById('btn-rifle').addEventListener('click', () => buyAlly('rifle'));
document.getElementById('btn-upgrade').addEventListener('click', () => upgradeAllies());

// ========================================
// INICIALIZACIÓN
// ========================================

updateUI();
gameLoop();
