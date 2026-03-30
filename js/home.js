'use strict';


document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('gioco').addEventListener('click', function(){
        window.location.href="../php/story.php";
    });
    document.getElementById('guide').addEventListener('click', function(){
        window.location.href="../php/guide.php";
    });
    document.getElementById('exit').addEventListener('click', function(){
        window.location.href="../php/login.php";
    });
});