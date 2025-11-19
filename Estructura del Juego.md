# 🚀 Proyecto FINAL: Defensa de Base - Juego Web de Estrategia Incremental

## 💡 Visión General del Juego

* **Concepto:** Eres el administrador de una Base Central, inspirada en la gestión de recursos de juegos como Albion Online, pero con el formato incremental de Defensa de Base  .
* **Objetivo del Jugador:** Sobrevivir a oleadas de enemigos cada vez más difíciles, mejorando la base, generando recursos pasivamente y reclutando unidades para la defensa  .
* **Tecnologías Clave:** PHP (Lógica del servidor)   , MySQL (Base de datos persistente)  , JavaScript (Dinámica del juego)  , y AJAX/Fetch (Sincronización Cliente-Servidor)  .

---

## 👥 Equipo y Roles (3 Personas)

Esta estructura garantiza que el trabajo se divide de manera equitativa y técnica:

| Rol | Foco Principal | Tecnologías | Responsabilidades Clave |
| :--- | :--- | :--- | :--- |
| **1. Frontend/UI** | Interfaz Visual y Diseño | HTML5, CSS3, (Estilos) | Diseñar el HUD, paneles de base y menú de mejoras  . |
| **2. Lógica de Juego** | Dinámica y Gameplay | JavaScript (JS) | Manejar la generación de recursos, la lógica de oleadas, combate y compras  . |
| **3. Backend + DB** | Persistencia y Servidor | PHP, MySQL, AJAX (fetch) | Crear la base de datos, gestionar la conexión, y desarrollar todos los *endpoints* PHP  . |

---

## 🏗️ Componentes del Juego a Construir

### A. Economía y Administración (La Base)

* **Recursos:** Se gestionan tres recursos principales: **Mineral**, **Gas** y **Dinero**  . El dinero se genera pasivamente  .
* **Minas:** Se construirá una Mina de Mineral y un Extractor de Gas. Ambos se pueden mejorar para aumentar su tasa de producción  .
* **Mejoras de la Base:** La Base Central tiene niveles de mejora que incrementan la defensa o la generación de recursos  .
* **Menú Principal:** Contiene las acciones clave: Comprar unidades, Mejorar base o minas, Ver estadísticas e Iniciar la próxima oleada  .

### B. Defensa y Combate (Las Unidades y Enemigos)

| Categoría | Elementos | Mecánica Clave |
| :--- | :--- | :--- |
| **Unidades** | Artillero, Escopetero, Mecha, Trabajador  . | Se compran con recursos y su número se almacena en la base de datos  . |
| **Enemigos** | Débil (Tierra), Medio (Tierra), Aéreo (Aire). | Aparecen en oleadas de dificultad creciente  . Cada oleada completada otorga bonificaciones  . |

### C. Persistencia y Servidor (La Memoria)

* **`db/conexion.php`:** Conexión a MySQL  .
* **`api/guardar.php` / `api/cargar.php`:** Para guardar y cargar el progreso (recursos, unidades, mejoras).
* **`api/comprar.php`:** Procesa las transacciones validando costos  .
* **`api/oleada.php`:** Calcula la composición de la oleada y las recompensas  .

---

## 🎯 Roadmap de 5 Semanas (Misiones)

| Misión | Semana | Foco Principal | Logro (Meta) |
| :--- | :--- | :--- | :--- |
| **1: Fundar la Base** | 1 | Estructura y UI | Demo navegable con interfaz y contadores ficticios. |
| **2: Activar la Producción** | 2 | Lógica JS (Frontend) | Recursos que aumentan con el tiempo y mejoras que alteran la producción. |
| **3: Conectar al Servidor** | 3 | Persistencia (Backend) | Recursos y mejoras se guardan y cargan desde MySQL. |
| **4: Preparar la Defensa** | 4 | Combate y Oleadas | El jugador puede iniciar una oleada y recibir recompensas persistentes. |
| **5: Expansión y Presentación** | 5 | Pulido y Documentación | Versión final del juego funcional, estadísticas y presentación grupal. |

### Dificultad Adicional (Para el Equipo de 3)

Se recomienda implementar estas extensiones después de completar la Misión 4:

1.  Implementar un **sistema de enemigos dinámico** (oleadas que escalan con el nivel)  .
2.  Añadir una **pantalla de estadísticas globales** (ej: Mineral recolectado, Enemigos derrotados)  .
3.  Crear un **ranking de jugadores** en MySQL  .