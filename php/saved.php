<?php
session_start();
include("api.php");

// Controllo login
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

$username = $_SESSION['username'];
$games = [];

$stmt = $conn->prepare("SELECT id, type, score, base_case FROM partite_salvate WHERE username = ? ORDER BY id DESC");
if ($stmt) {
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $games[] = $row;
    }
    $stmt->close();
}

$rankSurvival = [];
$sqlSurv = "SELECT player, score FROM partite WHERE type = 1 ORDER BY score DESC LIMIT 10";
$resSurv = $conn->query($sqlSurv);
if ($resSurv) {
    while ($row = $resSurv->fetch_assoc())
        $rankSurvival[] = $row;
}

$rankClassicTime = [];
$sqlClassTime = "SELECT player, TIMESTAMPDIFF(SECOND, start_time, end_time) as durata 
                 FROM partite 
                 WHERE type = 0 AND score = 8 AND end_time IS NOT NULL 
                 ORDER BY durata ASC 
                 LIMIT 10";
$resClassTime = $conn->query($sqlClassTime);
if ($resClassTime) {
    while ($row = $resClassTime->fetch_assoc())
        $rankClassicTime[] = $row;
}

$userErrors = [];
$errorMap = [
    0 => 'Luci',
    1 => 'Quadri',
    2 => 'Finestre',
    3 => 'Sedie',
    4 => 'Sedie e tavoli',
    5 => 'Numero finestre',
    6 => 'Personaggio'
];

// query con JOIN tra mistakes e partite, filtrata per isanomaly=1 e player corrente
$sqlErrors = "SELECT m.type, m.isanomaly, COUNT(*) as conteggio 
              FROM mistakes m
              JOIN partite p ON m.partita = p.id
              WHERE p.player = ?
              GROUP BY m.type
              ORDER BY conteggio DESC";

$stmtErr = $conn->prepare($sqlErrors);
if ($stmtErr) {
    $stmtErr->bind_param("s", $username);
    $stmtErr->execute();
    $resErr = $stmtErr->get_result();
    while ($row = $resErr->fetch_assoc()) {
        // aggiungiamo la descrizione leggibile basata sull'array $errorMap
        $typeIndex = $row['type'];
        if($row['isanomaly'] == 0){
            $row['description'] = 'Nessuna anomalia';
        }
        else{
            $row['description'] = isset($errorMap[$typeIndex]) ? $errorMap[$typeIndex] : "Tipo $typeIndex";
        }
        $userErrors[] = $row;
    }
    $stmtErr->close();
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestione Partita</title>
    <link rel="stylesheet" href="../css/saved.css">
    <script src="../js/saved.js"></script>
</head>

<body>
    <div id="header">
        <div id="logo">
            <img src="../images/logo.png" alt="logo">
        </div>
        <div id="livello">
            Benvenuto
        </div>
        <div id="salva">
            Salva la partita
        </div>
    </div>

    <div class="container">
        <h1>Benvenuto, <?php echo htmlspecialchars($username); ?>!</h1>
        <p>Cosa vuoi fare?</p>

        <div class="main-actions">
            <button id="btn-new-game" class="btn primary">Nuova Partita</button>
            <button id="btn-show-load" class="btn secondary">Carica Partita</button>
            <button id="btn-show-stats" class="btn tertiary">Statistiche</button>
        </div>

        <div id="saved-games-container" class="hidden content-section">
            <h2>Partite Salvate</h2>
            <?php if (count($games) > 0): ?>
                <table class="games-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Punteggio</th>
                            <th>Azione</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($games as $game): ?>
                            <tr>
                                <td class="raw-text">#<?php echo $game['id']; ?></td>
                                <td class="raw-text"><?php echo ($game['type'] == 0) ? 'Classic' : 'Survival'; ?></td>
                                <td class="raw-text"><?php echo $game['score']; ?></td>
                                <td>
                                    <button class="btn-load-game" data-id="<?php echo $game['id']; ?>"
                                        data-type="<?php echo htmlspecialchars($game['type']); ?>"
                                        data-score="<?php echo $game['score']; ?>"
                                        data-base-case="<?php echo htmlspecialchars($game['base_case']); ?>">
                                        Carica
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p>Non hai nessuna partita salvata.</p>
            <?php endif; ?>
        </div>

        <div id="stats-container" class="hidden content-section">
            <h2>Classifiche</h2>

            <div class="stats-controls">
                <button id="btn-view-classic" class="btn-small active">Classica</button>
                <button id="btn-view-survival" class="btn-small">Survival</button>
                <button id="btn-view-errors" class="btn-small">Errori</button>
            </div>

            <div id="stats-classic-view">
                <h3>Speedrun (Global Top 10)</h3>
                <table class="games-table">
                    <thead>
                        <tr>
                            <th>Giocatore</th>
                            <th>Tempo (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($rankClassicTime)): ?>
                            <tr>
                                <td colspan="2" class="raw-text">Nessun completamento registrato.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($rankClassicTime as $r): ?>
                                <tr>
                                    <td class="raw-text"><?php echo htmlspecialchars($r['player']); ?></td>
                                    <td class="raw-text"><?php echo $r['durata']; ?>s</td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <div id="stats-survival-view" class="hidden">
                <h3>Top Score (Global Top 10)</h3>
                <?php if (empty($rankSurvival)): ?>
                    <p>Nessuna partita survival giocata.</p>
                <?php else: ?>
                    <table class="games-table">
                        <thead>
                            <tr>
                                <th>Giocatore</th>
                                <th>Punteggio</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($rankSurvival as $r): ?>
                                <tr>
                                    <td class="raw-text"><?php echo htmlspecialchars($r['player']); ?></td>
                                    <td class="raw-text"><?php echo $r['score']; ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>

            <div id="stats-errors-view" class="hidden">
                <h3>I Tuoi Errori Più Frequenti</h3>
                <?php if (empty($userErrors)): ?>
                    <p>Non hai ancora commesso errori (anomalie) registrati.</p>
                <?php else: ?>
                    <table class="games-table">
                        <thead>
                            <tr>
                                <th>Tipo Anomalia</th>
                                <th>Occorrenze</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($userErrors as $err): ?>
                                <tr>
                                    <td class="raw-text"><?php echo htmlspecialchars($err['description']); ?></td>
                                    <td class="raw-text"><?php echo $err['conteggio']; ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>

        </div>
    </div>
</body>

</html>