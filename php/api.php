<?php
$servername = "localhost";
$username = "root"; 
$password = "";   
$dbname = "salvatelli_623720";

// connessione
$conn = new mysqli($servername, $username, $password, $dbname);

// controllo errori
if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

?>
