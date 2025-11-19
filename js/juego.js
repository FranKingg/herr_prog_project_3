// ===================================
// HYTACRAFT - LOGICA DE JUEGO (SEMANA 1: Ingeniero Fundador)
// Rol: Desarrollador Lógica de Juego
// ===================================

// --- I. VARIABLES INICIALES (Ficticias para Semana 1) ---
// Usamos la terminología de HytaCraft: Stone, Wood, Gold, Citadel

let playerGold = 1000;
let playerStone = 500;
let playerWood = 200;
let citadelLevel = 1;
let citadelDefense = 100;

let quarryLevel = 1;
let sawmillLevel = 1;
let totalUnits = 0; // Se llenará en la Semana 4


// --- II. FUNCIONES DE INTERFAZ (HUD) ---

/**
 * Actualiza todos los contadores de recursos y estados en la interfaz.
 */
function updateHUD() {
    // 1. Actualizar Contadores de Recursos (Usando los IDs del index.php)
    document.getElementById('contador-gold').textContent = playerGold.toLocaleString();
    document.getElementById('contador-stone').textContent = playerStone.toLocaleString();
    document.getElementById('contador-wood').textContent = playerWood.toLocaleString();
    
    // 2. Actualizar Información de la Ciudadela
    document.getElementById('nivel-citadel').textContent = citadelLevel;
    document.getElementById('defensa-citadel').textContent = citadelDefense;
    
    // 3. Actualizar Niveles de Recolección
    document.getElementById('nivel-quarry').textContent = quarryLevel;
    document.getElementById('nivel-sawmill').textContent = sawmillLevel;

    // 4. Actualizar Total de Unidades
    document.getElementById('total-unidades').textContent = totalUnits;
}

/**
 * Muestra un mensaje en el área de estado inferior.
 */
function updateStatusMessage(message) {
    document.getElementById('mensaje-estado').textContent = message;
}


// --- III. LISTENERS DE EVENTOS (Pruebas de conexión de botones) ---

function setupEventListeners() {
    // 1. Botón Iniciar Asedio
    document.getElementById('btn-iniciar-siege').addEventListener('click', function() {
        updateStatusMessage("Alerta: El Asedio está por comenzar. (Semana 4: Lógica de Combate)");
        console.log("Evento: Iniciar Asedio presionado.");
    });

    // 2. Botón Mejorar Ciudadela
    document.getElementById('btn-mejorar-citadel').addEventListener('click', function() {
        updateStatusMessage("Ciudadela en mejora. (Semana 3: Lógica de Compra)");
        console.log("Evento: Mejorar Ciudadela presionado.");
    });
    
    // 3. Botón Reclutar Tropas
    document.getElementById('btn-comprar-unidades').addEventListener('click', function() {
        updateStatusMessage("Abriendo menú de reclutamiento. (Semana 3: Lógica de Compra)");
        console.log("Evento: Reclutar Tropas presionado.");
    });
}


// --- IV. INICIALIZACIÓN ---

// Se ejecuta una vez que todo el HTML esté cargado y seguro de que los IDs existen
document.addEventListener('DOMContentLoaded', function() {
    console.log("HytaCraft: Lógica del juego inicializada. Semana 1.");
    
    updateHUD(); // Muestra los valores iniciales en la interfaz
    setupEventListeners(); // Asigna los clics a los botones
    
    // *NOTA CLAVE PARA LA SEMANA 2:*
    // Aquí se implementará la función startResourceGeneration() 
    // para empezar a sumar recursos automáticamente.
});