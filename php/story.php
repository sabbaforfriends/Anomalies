<?php
include("api.php");
session_start();

$usernameInput = $_SESSION['username']; 

$sql = "SELECT COUNT(*) FROM `partite` WHERE `player` = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $usernameInput);


$stmt->execute();

$stmt->bind_result($numeroOccorrenze);
$stmt->fetch();
$stmt->close();

// se l'utente ha già giocato gli faccio saltare l'introduzione
if ($numeroOccorrenze > 0) {
    header("Location: saved.php"); 
    exit();
}
?>
<!DOCTYPE html>
<html lang="it">

<head>
    <title>Story</title>
    <script src="../js/story.js"></script>
    <link rel="stylesheet" href="../css/story.css">
</head>

<body id="back">
    <div class="overlay">
        <div id="overlayT">
            <img src="../images/terminal.png" alt="Terminale">
            <div id="text">
                <span class="line l1">> Ciao <?php echo ($_SESSION['username']) ?>, tu non sai chi sono, ma io so chi sei tu.</span><br>
                <span class="line l2">Sono qui per darti l'opportunità di vedere quant'è</span><br>
                <span class="line l3">profonda la tana del Bianconiglio.</span>
                <span class="line l4">> Vuoi procedere?</span>

                <div id="userInputLine" style="opacity: 0;">
                    <span>> </span>
                    <input type="text" id="cmdInput" autocomplete="off">
                </div>
            </div>
        </div>
    </div>

</body>

</html>