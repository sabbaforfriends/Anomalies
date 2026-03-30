<?php
session_start();

// controllo se l'utente è già loggato
if (isset($_SESSION['user_id'])) {
    // se è loggato, lo mando direttamente alla home
    header("Location: home.php");
    exit;
} else {
    // se non è loggato, lo mando al login
    header("Location: login.php");
    exit;
}
?>