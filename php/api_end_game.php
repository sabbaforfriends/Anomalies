<?php
session_start();
include("../php/api.php");

header('Content-Type: application/json');

// verifico che ci siano i dati necessari
if (isset($_SESSION['username']) && isset($_POST['game_id']) && isset($_POST['score'])) {
    
    $game_id = $_POST['game_id'];
    $score = $_POST['score'];
    $player = $_SESSION['username'];
    
    // aggiorniamo la riga della partita nella tabella 'partite'
    $stmt = $conn->prepare("UPDATE partite SET score = ?, end_time = NOW() WHERE id = ? AND player = ?");
    $stmt->bind_param("iis", $score, $game_id, $player);
    
    if ($stmt->execute()) {
        
        // se l'aggiornamento è andato a buon fine, elimino la partita salvata
        // non serve controllare se esiste prima: la DELETE lo gestisce da sola.
        $stmt_delete = $conn->prepare("DELETE FROM partite_salvate WHERE id = ? AND username = ?");
        $stmt_delete->bind_param("is", $game_id, $player);
        $stmt_delete->execute();
        $stmt_delete->close();

        echo json_encode([
            "status" => "success", 
            "message" => "Partita conclusa e salvataggio temporaneo rimosso"
        ]);

    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Dati mancanti"]);
}
$conn->close();
?>