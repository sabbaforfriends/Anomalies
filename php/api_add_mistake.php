<?php
session_start();
include("../php/api.php");

header('Content-Type: application/json');

// controllo sessione utente
if (isset($_SESSION['username']) && isset($_POST['game_id'])) {

    $game_id = $_POST['game_id'];
    $which = $_POST['which'];

    if ($which == -1) {
        // se which è -1 allora non c'è stata anomalia
        $isanomaly = 0;
        $type = null;
    } else {
        // isanomaly è 1: type vale which
        $isanomaly = 1;
        $type = $which;
    }

    $stmt = $conn->prepare("INSERT INTO mistakes (partita, isanomaly, type) VALUES (?, ?, ?)");

    $stmt->bind_param("iii", $game_id, $isanomaly, $type);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Mistake registrato",
            "debug" => ["w" => $which, "t" => $type]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Dati mancanti o sessione scaduta"]);
}

$conn->close();
?>