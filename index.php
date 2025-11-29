<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>HytaCraft - La Defensa</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="icon" type="image/png" href="assets/images/logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark">
    <div id="lava-particles"></div>

    <div class="container py-3">

        <!-- Logo y barra de recursos -->
        <div class="row mb-4">
            <div class="col-12">
                <img src="assets/images/logo.png" class="logo logo-fixed">
            </div>

            <div class="col-12 d-flex justify-content-center gap-3 flex-wrap resources-container mt-resources">

                <div class="resource-box d-flex align-items-center">
                    <img src="assets/images/gold.png" class="res-icon">
                    <span id="gold">100</span>
                </div>

                <div class="resource-box d-flex align-items-center">
                    <span style="margin-right: 5px;">⭐ EXP:</span>
                    <span id="exp">0</span>
                </div>

            </div>
        </div>

    </div>

    <!-- Canvas del juego -->
    <div style="display: flex; justify-content: center; margin-top: 20px;">
        <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>

    <!-- MENÚ LATERAL -->
    <div class="side-menu">
        <h4 class="menu-title">Tower Defense</h4>

        <div style="margin-top: 20px; font-size: 14px;">
            <p><strong>Guerrero Cuerpo a Cuerpo</strong></p>
            <p>Costo: 50 oro | Daño: 1 | Vida: 10</p>
            <p>Cantidad: <span id="melee-count">0</span>/10</p>
            <button id="btn-melee" class="btn-green w-100">Comprar Guerrero (50 oro)</button>
        </div>

        <div style="margin-top: 20px; font-size: 14px;">
            <p><strong>Escopetero</strong></p>
            <p>Costo: 100 oro | Daño: 1/perdigón (x5) | Vida: 8</p>
            <p>Cantidad: <span id="shotgun-count">0</span>/5</p>
            <button id="btn-shotgun" class="btn-green w-100">Comprar Escopetero (100 oro)</button>
        </div>

        <div style="margin-top: 20px; font-size: 14px;">
            <p><strong>Tirador de Rifle</strong></p>
            <p>Costo: 150 oro | Daño: 2/bala (x3) | Vida: 6</p>
            <p>Cantidad: <span id="rifle-count">0</span>/3</p>
            <button id="btn-rifle" class="btn-green w-100">Comprar Rifle (150 oro)</button>
        </div>

        <div style="margin-top: 30px; border-top: 2px solid #f8e4b0; padding-top: 15px;">
            <p><strong>Mejorar Aliados</strong></p>
            <p>Costo: <span id="upgrade-cost">50</span> EXP</p>
            <p>+1 Daño a todos</p>
            <button id="btn-upgrade" class="btn-wood w-100">Mejorar (50 EXP)</button>
        </div>
    </div>
    <div id="particles"></div>
</body>
    <script src="js/game.js"></script>
    <script src="js/particles.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</html>
