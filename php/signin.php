<?php
session_start();
include("api.php");

$messaggio = "";
$alert_color = "rgba(255,0,0,0.5)";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST["username"]) && isset($_POST["password"])) {

        $username = $_POST["username"];
        $password = $_POST["password"];

        // controllo se l'utente esiste già
        $check_stmt = $conn->prepare("SELECT username FROM `giocatori` WHERE `username` = ?");
        $check_stmt->bind_param("s", $username);
        $check_stmt->execute();
        $check_stmt->store_result();

        if ($check_stmt->num_rows > 0) {
            $messaggio = "Errore: Questo username è già in uso.";
        } else {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // inserimento nel database
            $insert_stmt = $conn->prepare("INSERT INTO `giocatori` (`username`, `password`) VALUES (?, ?)");
            $insert_stmt->bind_param("ss", $username, $hashed_password);

            if ($insert_stmt->execute()) {
                $messaggio = "Registrazione completata con successo!";
                $alert_color = "rgba(46, 204, 113, 0.6)";
                header("refresh:2;url=login.php");
            } else {
                $messaggio = "Errore tecnico: " . $conn->error;
            }
            $insert_stmt->close();
        }
        $check_stmt->close();
    }
}
$conn->close();
?>
<!DOCTYPE html>
<html lang="it">

<head>
    <link rel="stylesheet" href="../css/signin.css">
    <title>Sign in</title>

</head>

<body>

    <div class="login-bg">
        <div class="login-bg-image"></div>
        <div class="login-overlay"></div>

        <div class="login-card">
            <div class="login-user-block">
                <div class="login-user-title">Iscriviti</div>
                <div class="login-avatar"></div>
            </div>
            <form action="signin.php" method="post">
                <label class="login-label" for="username">Username</label>
                <input id="username" type="text" name="username" class="login-input" placeholder="Username" required>

                <label class="login-label" for="password">Password</label>
                <div class="login-password-row">
                    <input id="password" type="password" name="password" class="login-input" placeholder="Password" required>
                    <button class="login-arrow" aria-label="Sign in">
                        <span class="arrow">➜</span>
                    </button>
                </div>
            </form>
            <?php if (!empty($messaggio)): ?>
                <div
                    style="color: white; z-index: 9999; background: <?php echo $alert_color; ?>; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 10px;">
                    <?php echo $messaggio; ?>
                </div>
            <?php endif; ?>
            <p id="q">Hai gi&aacute; un account?</p>
            <a href="login.php" class="login-domain">Log in</a>
        </div>

    </div>

</body>

</html>