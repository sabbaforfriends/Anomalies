<?php
session_start();
// se ci sono caricamenti li salvo dentro una variabile globale
$gameData = isset($_SESSION['partita_da_caricare']) ? $_SESSION['partita_da_caricare'] : null;
// cancello il valore nella sessione, altrimenti dato un primo caricamento, ogni nuova partita me lo riproporrà
unset($_SESSION['partita_da_caricare']);
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <link rel="stylesheet" href="../css/gioco.css">
    <title>Gioco</title>
</head>

<body id="back">
    <div id="header">
        <div id="logo">
            <img src="../images/logo.png" alt="logo">
        </div>
        <div id="livello">
        </div>
        <div id="salva">
            Salva la partita
        </div>
    </div>
    <div id="main">
        <canvas id="roomCanvas"></canvas>
    </div>
    
    <div id="countdown" class="countdown hidden-fade"></div>

    <div class="overlay hidden-fade" id="level-overlay">
        <h2 id="messaggio">.
        </h2>
    </div>

    <div class="overlay hidden-fade" id="istruction-overlay">
        <h2 id="istruzioni">.
        </h2>
        <button id="inizia">Inizia</button>
    </div>
    
    <script>
        // passo la variabile globale a JS
        const serverGameData = <?php echo json_encode($gameData ?? null); ?>;
    </script>
    <script src="../js/gioco.js"></script>
</body>

</html>