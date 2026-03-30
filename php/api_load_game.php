<?php
session_start();
include("../php/api.php");

// Imposto l'header per dire al browser che rispondo in JSON
header('Content-Type: application/json');

// controllo Login
if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => 'Utente non loggato']);
    exit;
}

// controllo se arriva un ID via POST
if (!isset($_POST['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID mancante']);
    exit;
}

$gameId = $_POST['id'];
$currentUser = $_SESSION['username'];

$stmt = $conn->prepare("SELECT id, type, score, base_case FROM partite_salvate WHERE id = ? AND username = ?");
$stmt->bind_param("is", $gameId, $currentUser);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // salvo i dati in Sessione
    $_SESSION['partita_da_caricare'] = [
        'load' => true,
        'id' => $row['id'],
        'type' => $row['type'],
        'score' => $row['score'],
        'base_case' => $row['base_case']
    ];
    
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Partita non trovata o accesso negato']);
}
?>