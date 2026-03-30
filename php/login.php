<?php
session_start();
include("api.php");

// variabile per stampare errori o conferme nell'HTML
$messaggio = "";
$alert_color = "rgba(255,0,0,0.5)";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST["username"]) && isset($_POST["password"])) {

        $username = $_POST["username"];
        $password = $_POST["password"];

        // controllo se l'utente esiste già
        $check_stmt = $conn->prepare("SELECT username, password FROM `giocatori` WHERE `username` = ?");
        $check_stmt->bind_param("s", $username);
        $check_stmt->execute();
        $result = $check_stmt->get_result();

        if ($result->num_rows === 0) {
            $messaggio = "Errore: lo username non esiste, forse vuoi registrarti?";
        } else {
            $row = $result->fetch_assoc();
            $hash_nel_db = $row['password'];

            // verifico se la password inserita coincide con l'hash
            if (password_verify($password, $hash_nel_db)) {
                $_SESSION['username'] = $username;
                $login_successo = true;

                // reindirizza alla home
                $messaggio = "Login effettuato! Benvenuto $username.";
                $alert_color = "rgba(46, 204, 113, 0.6)";
                header("refresh: 2; url: home.php");
            } else {
                $messaggio = "Errore: Password non corretta.";
            }
        }
        $check_stmt->close();
    }
}
$conn->close();
?>
<!DOCTYPE html>
<html lang="it">

<head>
    <title>Log in</title>
    <link rel="stylesheet" href="../css/signin.css">


</head>

<body>

    <div class="login-bg">
        <div class="login-bg-image"></div>
        <div class="login-overlay"></div>

        <div class="login-card">
            <div class="login-user-block">
                <div class="login-user-title">Accedi</div>
                <div class="login-avatar"></div>
            </div>
            <form action="login.php" method="post">
                <label class="login-label" for="username">Username</label>
                <input id="username" type="text" name="username" class="login-input" placeholder="Username" required>

                <label class="login-label" for="password">Password</label>
                <div class="login-password-row">
                    <input id="password" type="password" name="password" class="login-input" placeholder="Password"
                        required>
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
            <p id="q">Non hai un account?</p>
            <a href="signin.php" class="login-domain">Sign in</a>
        </div>

    </div>

    <?php if (isset($login_successo) && $login_successo === true): ?>
        <script>
            setTimeout(function () {
                window.location.href = 'home.php';
            }, 2000); // 2 secondi
        </script>
    <?php endif; ?>

</body>

</html>