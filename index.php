<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HytaCraft: El Asedio</title>
    <link rel="icon" type="image/png" href="assets/images/logo.png">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <link rel="stylesheet" href="css/estilos.css">
</head>
<body class="bg-dark text-light">

    <header id="hud-recursos" class="container-fluid py-3 border-bottom border-warning mb-4 sticky-top bg-dark">
        <div class="row text-center align-items-center">
            
            <div class="col-md-4 col-12 order-md-2 mb-3 mb-md-0">
                <img src="/assets/images/logo.png" alt="Logo de HytaCraft" id="logo-juego" style="max-height: 60px; width: auto;" class="img-fluid">
            </div>

            <div class="col-md-4 col-sm-6 order-md-1">
                <h3 class="text-secondary mb-0">Piedra:</h3>
                <span id="contador-stone" class="fs-4 fw-bold">0</span>
            </div>
            
            <div class="col-md-4 col-sm-6 order-md-3">
                <h3 class="text-warning mb-0">Oro:</h3>
                <span id="contador-gold" class="fs-4 fw-bold">0</span>
            </div>
            
            <div class="col-12 mt-2 d-md-none"> 
                <h3 class="text-brown mb-0" style="color:#A0522D;">Madera:</h3>
                <span id="contador-wood" class="fs-4 fw-bold">0</span>
            </div>

        </div>
    </header>

    <script src="js/juego.js"></script>

    <main id="tablero-juego" class="container">