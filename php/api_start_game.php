<?php
session_start();
include("../php/api.php");

header('Content-Type: application/json');

if (isset($_SESSION['username'])) {
    
    $player_username = $_SESSION['username'];
    $type = $_POST['type'];
    
    $stmt = $conn->prepare("INSERT INTO partite (player, type, start_time, score) VALUES (?, ?, NOW(), 0)");
    
    $stmt->bind_param("si", $player_username, $type);
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success", 
            "game_id" => $conn->insert_id 
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