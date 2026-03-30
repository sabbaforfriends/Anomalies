'use strict';


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logo').addEventListener('click', function(){
        window.location.href='home.php';
    });

    // Elementi Nuova/Carica
    const btnNewGame = document.getElementById('btn-new-game');
    const btnShowLoad = document.getElementById('btn-show-load');
    const savedGamesContainer = document.getElementById('saved-games-container');
    const loadButtons = document.querySelectorAll('.btn-load-game');

    // Elementi Statistiche
    const btnShowStats = document.getElementById('btn-show-stats');
    const statsContainer = document.getElementById('stats-container');

    // Bottoni Tab
    const btnViewClassic = document.getElementById('btn-view-classic');
    const btnViewSurvival = document.getElementById('btn-view-survival');
    const btnViewErrors = document.getElementById('btn-view-errors');

    // Viste Tab
    const statsClassicView = document.getElementById('stats-classic-view');
    const statsSurvivalView = document.getElementById('stats-survival-view');
    const statsErrorsView = document.getElementById('stats-errors-view');

    // Funzione helper per chiudere tutti i pannelli principali
    function closeAll() {
        savedGamesContainer.classList.add('hidden');
        statsContainer.classList.add('hidden');
    }

    btnNewGame.addEventListener('click', () => {
        window.location.href = '../php/gioco.php';
    });

    btnShowLoad.addEventListener('click', () => {
        const isHidden = savedGamesContainer.classList.contains('hidden');
        closeAll();
        if (isHidden) savedGamesContainer.classList.remove('hidden');
    });

    btnShowStats.addEventListener('click', () => {
        const isHidden = statsContainer.classList.contains('hidden');
        closeAll();
        if (isHidden) statsContainer.classList.remove('hidden');
    });


    // Funzione helper per resettare i tab attivi
    function resetStatsTabs() {
        statsClassicView.classList.add('hidden');
        statsSurvivalView.classList.add('hidden');
        statsErrorsView.classList.add('hidden');

        btnViewClassic.classList.remove('active');
        btnViewSurvival.classList.remove('active');
        btnViewErrors.classList.remove('active');
    }

    btnViewClassic.addEventListener('click', () => {
        resetStatsTabs();
        statsClassicView.classList.remove('hidden');
        btnViewClassic.classList.add('active');
    });

    btnViewSurvival.addEventListener('click', () => {
        resetStatsTabs();
        statsSurvivalView.classList.remove('hidden');
        btnViewSurvival.classList.add('active');
    });

    btnViewErrors.addEventListener('click', () => {
        resetStatsTabs();
        statsErrorsView.classList.remove('hidden');
        btnViewErrors.classList.add('active');
    });

    // Caricamento effettivo
    loadButtons.forEach(button => {
        button.addEventListener('click', function () {
            const idPartita = this.dataset.id;

            // Creo i dati da inviare via POST
            const formData = new FormData();
            formData.append('id', idPartita);

            // Chiamata asincrona al server
            fetch('../php/api_load_game.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '../php/gioco.php';
                    } else {
                        alert("Errore nel caricamento: " + data.message);
                    }
                })
                .catch(error => {
                    console.error('Errore:', error);
                    alert("Si è verificato un errore di comunicazione.");
                });
        });
    });
});