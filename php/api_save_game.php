<?php
session_start();
include("../php/api.php");

header('Content-Type: application/json');

if (isset($_SESSION['username'])) {
    
    $player_username = $_SESSION['username'];
    $type = $_POST['type'];
    $game_id = $_POST['game_id'];
    $score = $_POST['score'];
    $base_case = $_POST['base_case'];
    
    // aggiorno il record della partita da salvare
    $stmt = $conn->prepare("INSERT INTO `partite_salvate` (id, username, type, score, base_case) VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    username = VALUES(username),
    type = VALUES(type),
    score = VALUES(score),
    base_case = VALUES(base_case);");
    
    $stmt->bind_param("isiis", $game_id,$player_username, $type, $score, $base_case);
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success", 
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Utente non loggato"]);
}
$conn->close();
?>