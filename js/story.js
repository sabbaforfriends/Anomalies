'use strict';


document.addEventListener("DOMContentLoaded", function () {
    // Funzione per attivare il terminale
    function activateTerminalInput() {
        const inputLine = document.getElementById('userInputLine');
        const inputField = document.getElementById('cmdInput');

        // Il tempo totale delle tue animazioni è circa 10.5 secondi
        // Imposto un timer per far apparire l'input alla fine
        setTimeout(() => {
            inputLine.style.opacity = '1'; // Rende visibile la riga
            inputField.focus();            // Mette il cursore pronto per scrivere
        }, 10500); // 10500 millisecondi = 10.5 secondi

        // Aggiungo un ascoltatore per il tasto invio
        inputField.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const comando = inputField.value.trim().toLowerCase();
                console.log("Hai scritto: " + comando);
                if (comando === 'si' || comando === 'yes' || comando === 'y') {
                    window.location.href = "../php/saved.php";
                } else {
                    alert("Scelta errata. Riprova.");
                    inputField.value = "";
                }
            }
        });
    }
    activateTerminalInput();
});