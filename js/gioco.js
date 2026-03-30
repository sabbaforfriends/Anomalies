'use strict';

// vettore contenente i percorsi delle immagini
const allimagesources = [
  "../images/luce.png",
  "../images/sedia.png",
  "../images/sedie.png",
  "../images/tavolo.png",
  "../images/finestra1.png",
  "../images/finestra2.png",
  "../images/finestra3.png",
  "../images/finestra4.png",
  "../images/quadro1.png",
  "../images/quadro2.png",
  "../images/quadro3.png",
  "../images/quadro4.png",
  "../images/neo.png",
  "../images/personaggi matrix.png",
  "../images/logo.png",
  "../images/quadri.png",
];
// dimensioni degli oggetti
const ceilingWidth = 0.6;
const ceilingb_B = 0.15;
const lightW = 0.15;
const lightH = 0.12;
const tavoloW = 0.05;
const tavoloH = 0.1;
const sediaW = 0.04;
const sediaH = 0.12;
const finestraW = 0.08;
const quadroW = 0.07;

// variabili per il movimento del personaggio
let isWaitingForChoice = false;
let resolveChoicePromise = null;

//funzione di utilità che registra nel database l'inizio di una partita
function registraInizioPartita(type) {
  // informazione per api
  let formData = new FormData();
  formData.append('type', type);
  // l'utente è contenuto in $_SESSION[]

  fetch('../php/api_start_game.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        console.log("Partita iniziata! ID Partita nel DB: " + data.game_id);
        sessionStorage.setItem('id_partita_corrente', data.game_id);
      } else {
        console.error("Errore server:", data.message);
      }
    })
    .catch(error => console.error('Errore:', error));
}

// funzioe che mi aggiorna il record della partita settando il timestamp di fine e il punteggio
function salvaFinePartita(punteggioFinale) {
  // Recupero l'ID che avevo salvato all'inizio con registraInizioPartita()
  let gameId = sessionStorage.getItem('id_partita_corrente');

  if (!gameId) {
    console.error("Errore: Nessun ID partita trovato.");
    return;
  }
  // informazioni per api
  let formData = new FormData();
  formData.append('game_id', gameId);
  formData.append('score', punteggioFinale);

  fetch('../php/api_end_game.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        console.log("Partita finita, database aggiornato.");
        window.location.href = "../php/home.php";
      } else {
        console.error("Errore salvataggio:", data.message);
      }
    })
    .catch(error => console.error('Errore fetch:', error));
}

// funzione che mi salva la partita non terminata per essere ripresa in un secondo momento
function salvaPartita() {
  // se non sto giocando è inutile salvare la partita
  if (stato === 'NOTPLAYING') {
    return;
  }
  // Recupero l'ID che avevo salvato all'inizio con registraInizioPartita()
  let gameId = sessionStorage.getItem('id_partita_corrente');

  if (!gameId) {
    console.error("Errore: Nessun ID partita trovato.");
    return;
  }

  // informazioni per api
  let formData = new FormData();
  formData.append('game_id', gameId);
  formData.append('type', gameType);
  formData.append('score', gameScore);
  formData.append('base_case', JSON.stringify(realObjects));

  fetch('../php/api_save_game.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        console.log("Partita salvata con successo!");
        // renderizzo alla home
        window.location.href = "../php/home.php";
      } else {
        console.error("Errore salvataggio:", data.message);
      }
    })
    .catch(error => console.error('Errore fetch:', error));
}

// funzione che mi aggiorna la tabella degli errori,
// mi serve per le statistiche
function aggiornaMistakes(whichVal) {
  // Recupero l'ID che avevo salvato all'inizio con registraInizioPartita()
  let gameId = sessionStorage.getItem('id_partita_corrente');

  if (!gameId) {
    console.error("Errore: Nessun ID partita trovato.");
    return;
  }

  // informazioni per api
  let formData = new FormData();
  formData.append('game_id', gameId);
  formData.append('which', whichVal);

  fetch('../php/api_add_mistake.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        console.log("Mistake registrato:", data.debug);
      } else {
        console.warn("Errore registrazione mistake:", data.message);
      }
    })
    .catch(error => console.error('Errore Fetch Mistake:', error));
}

// creazione array oggetti
function createArray(targetArray) {

  // luci riga 1 (4)
  for (let i = 0; i < 4; i++) {
    targetArray.push({
      id: totObject++,
      src: "../images/luce.png",
      x: (0.05 + (((ceilingWidth + (ceilingb_B * 2)) / 8) * ((i * 2) + 1)) - lightW / 2),
      y: 0.15,
      w: lightW,
      h: lightH
    });
  }

  // luci riga 2 (5)
  for (let i = 0; i < 5; i++) {
    targetArray.push({
      id: totObject++,
      src: "../images/luce.png",
      x: (0.05 + (((ceilingWidth + (ceilingb_B * 2)) / 10) * ((i * 2) + 1)) - lightW / 2),
      y: 0.05,
      w: lightW,
      h: lightH
    });
  }

  // finestre
  for (let i = 0; i < 5; i++) {
    targetArray.push({
      id: totObject++,
      src: "../images/finestra" + ((i % 2) + 1) + ".png",
      x: ((0.05 + ceilingb_B) + ((ceilingWidth / 10) * ((i * 2) + 1)) - (finestraW / 2)),
      y: 0.3,
      w: finestraW,
      h: finestraW
    });
  }

  // quadri
  for (let i = 0; i < 4; i++) {
    targetArray.push({
      id: totObject++,
      src: "../images/quadro" + ((i % 4) + 1) + ".png",
      x: ((0.05 + ceilingb_B) + ((ceilingWidth / 8) * ((i * 2) + 1)) - (quadroW / 2)),
      y: 0.5,
      w: quadroW,
      h: quadroW
    });
  }

  // sedie e tavoli (10 coppie)
  for (let i = 0; i < 10; i++) {
    const isFirstRow = i < 5;
    const idx = isFirstRow ? i : (i - 5);
    const sediaSrc = (i % 3 == 0) ? "../images/sedia.png" : "../images/sedie.png";

    if (isFirstRow) {
      // prima fila
      targetArray.push({
        id: totObject++,
        src: sediaSrc,
        x: ((0.05 + ceilingb_B) + (ceilingWidth / 10) * ((i * 2) + 1) - ((tavoloW - 0.02)) - ((sediaW - 0.02) / 2)),
        y: 0.68,
        w: sediaW - 0.02,
        h: sediaH - 0.02
      });
      targetArray.push({
        id: totObject++,
        src: "../images/tavolo.png",
        x: ((0.05 + ceilingb_B) + (ceilingWidth / 10) * ((i * 2) + 1) - ((tavoloW - 0.02) / 2)),
        y: 0.7,
        w: tavoloW - 0.02,
        h: tavoloH - 0.02
      });

      if (i == 4) {
        // Disegno il personaggio
        targetArray.push({
          id: totObject++,
          src: "../images/neo.png",
          x: 0.14,
          y: 0.7,
          w: 0.04,
          h: 0.15
        });
      }

    }
    else {
      // seconda fila
      targetArray.push({
        id: totObject++,
        src: sediaSrc,
        x: ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / 10) * ((idx * 2)) + (sediaW / 2)),
        y: 0.82,
        w: sediaW,
        h: sediaH
      });
      targetArray.push({
        id: totObject++,
        src: "../images/tavolo.png",
        x: ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / 10) * ((idx * 2)) + sediaW + (tavoloW / 2)),
        y: 0.84,
        w: tavoloW,
        h: tavoloH
      });
    }
  }

  // ora, qui aggiungo io una anomalia per ogni tipo, in maniera che il caso base non sia mai uguale
  aLuci(objects);

  aQuadri(objects);

  aFinestra(objects);

  aSedia(objects);

  aSedieTavoli(objects);

  aFinestre(objects);

}

function aLuci(objects) {
  let sopra = Math.floor(Math.random() * 2);
  let luci = [];
  if (sopra) {
    luci = objects.filter(o => o.src == "../images/luce.png" && o.y == 0.05);
  }
  else {
    luci = objects.filter(o => o.src == "../images/luce.png" && o.y == 0.15);
  }
  let quante = luci.length;
  inPiu = Math.floor(Math.random() * 2);
  if (inPiu) {
    for (let i = 0; i < luci.length; i++) {
      luci[i].x = (0.05 + (((ceilingWidth + (ceilingb_B * 2)) / ((quante + 1) * 2)) * ((i * 2) + 1)) - lightW / 2);
    }
    let newX = (0.05 + (((ceilingWidth + (ceilingb_B * 2)) / ((quante + 1) * 2) * ((quante * 2) + 1)) - lightW / 2));
    const nElem = {
      id: totObject++,
      src: "../images/luce.png",
      x: newX,
      y: luci[0].y,
      w: luci[0].w,
      h: luci[0].h
    };
    luci.push(nElem);
  }
  else {
    for (let i = 0; i < luci.length - 1; i++) {
      luci[i].x = (0.05 + (((ceilingWidth + (ceilingb_B * 2)) / ((quante - 1) * 2)) * ((i * 2) + 1)) - lightW / 2);
    }
    luci.pop();
  }
  index = -1;
  if (sopra) {
    index = objects.findIndex(o => o.src == "../images/luce.png" && o.y == 0.05);
  }
  else {
    index = objects.findIndex(o => o.src == "../images/luce.png" && o.y == 0.15);
  }
  //ho bisogno dell'operatore '...' per fare in modo che non venga aggiunto il vettore, ma gli elementi dello stesso
  objects.splice(index, quante, ...luci);
}

function aQuadri(objects) {
  // l'anomalia consiste nel far shiftare i quadri,
  // cambiarli in maniera casuale renderebbe troppo
  // difficile il gioco, ma soprattutto
  // rischio che se casualmente un quadro torna
  // al suo posto vi sarebbe un anomalia invisibile
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].src.includes("quadro")) {
      objects[i].src = "../images/quadro" + ((i % 4) + 1) + ".png";
    }
  }
}

function aFinestra(objects) {
  let r = Math.floor(Math.random() * 3) + 1;
  // non può capitare che ritorni la stessa sequenza, al minimo aggiungo 1
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].src.includes("finestra")) {
      objects[i].src = "../images/finestra" + ((i % 2) + r) + ".png";
    }
  }
}

function aSedia(objects) {
  index = Math.floor(Math.random() * 9);
  let j = 0;
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].src == "../images/sedia.png" || objects[i].src == "../images/sedie.png") {
      if (j == index) {
        objects[i].src = (objects[i].src == "../images/sedia.png") ? "../images/sedie.png" : "../images/sedia.png";
        break;
      }
      j++;
    }
  }
}

function aSedieTavoli(objects) {
  //per ogni postazione deve esserci un tavolo e una sedia,
  // lavorerò su due vettori, uno per le sedie e uno per i tavoli
  let sopras = Math.floor(Math.random() * 2);
  inPiu = Math.floor(Math.random() * 2);
  if (sopras) {
    // sedie e tavoli hanno dimensioni diverse in base alla fila in cui sono
    let sedie = objects.filter(o => (o.src == "../images/sedia.png" || o.src == "../images/sedie.png") && o.y == 0.68);
    let tavoli = objects.filter(o => o.src == "../images/tavolo.png" && o.y == 0.7);
    let quante = sedie.length;
    if (inPiu) {
      for (let i = 0; i < sedie.length; i++) {
        sedie[i].x = ((0.05 + ceilingb_B) + (ceilingWidth / ((quante + 1) * 2)) * ((i * 2) + 1) - ((tavoloW - 0.02)) - ((sediaW - 0.02) / 2));
      }
      let newX = ((0.05 + ceilingb_B) + (ceilingWidth / ((quante + 1) * 2)) * ((sedie.length * 2) + 1) - ((tavoloW - 0.02)) - ((sediaW - 0.02) / 2));
      let nElem = {
        id: totObject++,
        src: (sedie.length % 3 == 0) ? "../images/sedia.png" : "../images/sedie.png",
        x: newX,
        y: sedie[0].y,
        w: sedie[0].w,
        h: sedie[0].h
      };
      sedie.push(nElem);

      for (let i = 0; i < tavoli.length; i++) {
        tavoli[i].x = ((0.05 + ceilingb_B) + (ceilingWidth / ((quante + 1) * 2)) * ((i * 2) + 1) - ((tavoloW - 0.02) / 2));
      }
      newX = ((0.05 + ceilingb_B) + (ceilingWidth / ((quante + 1) * 2)) * ((tavoli.length * 2) + 1) - ((tavoloW - 0.02) / 2));
      nElem = {
        id: totObject++,
        src: "../images/tavolo.png",
        x: newX,
        y: tavoli[0].y,
        w: tavoli[0].w,
        h: tavoli[0].h
      };
      tavoli.push(nElem);
      index = -1;
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].src == "../images/sedia.png" || objects[i].src == "../images/sedie.png") {
          index = i;
          break;
        }
      }
      objects.splice(index, sedie.length - 1 + tavoli.length - 1, ...sedie.concat(tavoli));

    }
    else {
      for (let i = 0; i < sedie.length - 1; i++) {
        sedie[i].x = ((0.05 + ceilingb_B) + (ceilingWidth / ((quante - 1) * 2)) * ((i * 2) + 1) - ((tavoloW - 0.02)) - ((sediaW - 0.02) / 2));
      }
      sedie.pop();

      for (let i = 0; i < tavoli.length; i++) {
        tavoli[i].x = ((0.05 + ceilingb_B) + (ceilingWidth / ((quante - 1) * 2)) * ((i * 2) + 1) - ((tavoloW - 0.02) / 2));
      }
      tavoli.pop();
      index = -1;
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].src == "../images/sedia.png" || objects[i].src == "../images/sedie.png") {
          index = i;
          break;
        }
      }
      objects.splice(index, sedie.length + 1 + tavoli.length + 1, ...sedie.concat(tavoli));
    }

  }
  else {
    let sedie = objects.filter(o => (o.src == "../images/sedia.png" || o.src == "../images/sedie.png") && o.y == 0.82);
    let tavoli = objects.filter(o => o.src == "../images/tavolo.png" && o.y == 0.84);
    let quante = sedie.length;
    if (inPiu) {
      for (let i = 0; i < sedie.length; i++) {
        sedie[i].x = ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / ((quante + 1) * 2)) * ((i * 2)) + (sediaW / 2));
      }
      let newX = ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / ((quante + 1) * 2)) * ((sedie.length * 2)) + (sediaW / 2));
      let nElem = {
        id: totObject++,
        src: (sedie.length % 3 == 0) ? "../images/sedia.png" : "../images/sedie.png",
        x: newX,
        y: sedie[0].y,
        w: sedie[0].w,
        h: sedie[0].h
      };
      sedie.push(nElem);

      for (let i = 0; i < tavoli.length; i++) {
        tavoli[i].x = ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / ((quante + 1) * 2)) * ((i * 2)) + sediaW + (tavoloW / 2));
      }
      newX = ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / ((quante + 1) * 2)) * ((tavoli.length * 2)) + sediaW + (tavoloW / 2));
      nElem = {
        id: totObject++,
        src: "../images/tavolo.png",
        x: newX,
        y: tavoli[0].y,
        w: tavoli[0].w,
        h: tavoli[0].h
      };
      tavoli.push(nElem);
      index = -1;
      for (let i = 0; i < objects.length; i++) {
        if ((objects[i].src == "../images/sedia.png" || objects[i].src == "../images/sedie.png") && objects[i].y == 0.82) {
          index = i;
          break;
        }
      }
      objects.splice(index, sedie.length - 1 + tavoli.length - 1, ...sedie.concat(tavoli));

    }
    else {
      for (let i = 0; i < sedie.length - 1; i++) {
        sedie[i].x = ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / ((quante - 1) * 2)) * ((i * 2)) + (sediaW / 2));
      }
      sedie.pop();

      for (let i = 0; i < tavoli.length; i++) {
        tavoli[i].x = ((0.05) + ((ceilingWidth + (ceilingb_B * 2)) / ((quante - 1) * 2)) * ((i * 2)) + sediaW + (tavoloW / 2));
      }
      tavoli.pop();
      index = -1;
      for (let i = 0; i < objects.length; i++) {
        if ((objects[i].src == "../images/sedia.png" || objects[i].src == "../images/sedie.png") && objects[i].y == 0.82) {
          index = i;
          break;
        }
      }
      objects.splice(index, sedie.length + 1 + tavoli.length + 1, ...sedie.concat(tavoli));
    }
  }
}

function aFinestre(objects) {
  let finestre = objects.filter(o => o.src.includes("finestra"));
  let quante = finestre.length;
  inPiu = Math.floor(Math.random() * 2);
  if (inPiu) {
    for (let i = 0; i < finestre.length; i++) {
      finestre[i].x = ((0.05 + ceilingb_B) + ((ceilingWidth / ((quante + 1) * 2)) * ((i * 2) + 1)) - (finestraW / 2));
    }
    let nElem = {
      id: totObject++,
      src: "../images/finestra" + ((finestre.length % 2) + 1) + ".png",
      x: ((0.05 + ceilingb_B) + ((ceilingWidth / ((quante + 1) * 2)) * ((finestre.length * 2) + 1)) - (finestraW / 2)),
      y: finestre[0].y,
      w: finestre[0].w,
      h: finestre[0].h
    };
    finestre.push(nElem);
  }
  else {
    for (let i = 0; i < finestre.length; i++) {
      finestre[i].x = ((0.05 + ceilingb_B) + ((ceilingWidth / ((quante - 1) * 2)) * ((i * 2) + 1)) - (finestraW / 2));
    }
    finestre.pop();
  }
  index = -1;
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].src.includes("finestra")) {
      index = i;
      break;
    }
  }
  objects.splice(index, (inPiu) ? finestre.length - 1 : finestre.length + 1, ...finestre);
}

// preload immagini: SCRIITA CON AUSILIO DI AI:
// ho bisogno che il disegno delle immagini imponga tempi diversi, altrimenti si rovina l'esperienza di gioco
function preloadimages(items) {
  const sources = Array.from(new Set(items.map(it => typeof it === 'string' ? it : it.src)));
  const toLoad = sources.filter(s => s && !imageCache[s]);
  if (toLoad.length === 0) return Promise.resolve(imageCache);

  const promises = toLoad.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { imageCache[src] = img; resolve(img); };
    img.onerror = () => { console.warn("Errore caricamento", src); resolve(null); };
    img.src = src;
  }));
  return Promise.all(promises).then(() => imageCache);
}



// dati oggetti e cache immagini
let totObject = 0;
let objects = [];
let realObjects = [];
const imageCache = {};
let index = -1;
let inPiu = -1;

// anomalia
let anomalia = false;
// mi serve per il salvataggio delle partite
let stato = 'NOTPLAYING';
let gameType = -1;
let gameScore = -1;
let savedBaseCase = null;

document.addEventListener("DOMContentLoaded", function () {
  let info = document.getElementById('livello');
  let cd = document.getElementById('countdown');

  document.getElementById('salva').addEventListener('click', function () {
    salvaPartita();
  });

  document.getElementById('logo').addEventListener('click', function () {
    salvaFinePartita(gameScore);
    window.location.href = '../php/home.php';
  });

  const canvas = document.getElementById("roomCanvas");
  const ctx = canvas.getContext("2d");

  // dimensioni in CSS-pixel (aggiornate da resizeCanvas)
  let w = 0;
  let h = 0;


  // resize / devicePixelRatio
  function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;

    // dimensioni visive (CSS)
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    // dimensioni interne (pixel reali)
    canvas.width = Math.max(1, Math.floor(cssW * scale));
    canvas.height = Math.max(1, Math.floor(cssH * scale));

    // reset trasformazioni e applica scala
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale);

    // coordinate in CSS-pixel per il disegno
    w = cssW;
    h = cssH;
  }

  // disegno stanza (sfondo)
  function drawRoom() {
    // Pulisco (in coordinate CSS, grazie alla trasformazione già applicata)
    ctx.clearRect(0, 0, w, h);

    function drawPolygon(points, color) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
    }

    // coefficiente angolare (usato per porte)
    const m = 0.2 / 0.15;

    // Pavimento
    const floorHeight = 0.2;
    const floorWidth = 0.6;
    const floorb_B = 0.15;
    const floor = [
      { x: 0.2 * w, y: 0.75 * h },
      { x: 0.8 * w, y: 0.75 * h },
      { x: 0.95 * w, y: 0.95 * h },
      { x: 0.05 * w, y: 0.95 * h }
    ];
    drawPolygon(floor, "#8B4513");

    // Stanza
    const room = [
      { x: 0.2 * w, y: 0.25 * h },
      { x: 0.8 * w, y: 0.25 * h },
      { x: 0.8 * w, y: 0.75 * h },
      { x: 0.2 * w, y: 0.75 * h }
    ];
    drawPolygon(room, "#D3D3D3");

    // Soffitto
    const ceiling = [
      { x: 0.05 * w, y: 0.05 * h },
      { x: 0.95 * w, y: 0.05 * h },
      { x: 0.8 * w, y: 0.25 * h },
      { x: 0.2 * w, y: 0.25 * h }
    ];
    drawPolygon(ceiling, "#A9A9A9");

    // Parete sinistra
    const wallLeft = [
      { x: 0.05 * w, y: 0.05 * h },
      { x: 0.2 * w, y: 0.25 * h },
      { x: 0.2 * w, y: 0.75 * h },
      { x: 0.05 * w, y: 0.95 * h }
    ];
    drawPolygon(wallLeft, "#D3D3D3");

    // Parete destra
    const wallRight = [
      { x: 0.8 * w, y: 0.25 * h },
      { x: 0.95 * w, y: 0.05 * h },
      { x: 0.95 * w, y: 0.95 * h },
      { x: 0.8 * w, y: 0.75 * h }
    ];
    drawPolygon(wallRight, "#D3D3D3");

    // Porte
    const doorWidth = 0.03;
    const doorHeight = 0.17;
    const doorLeft = [
      { x: (0.05 + (floorb_B / 2) - (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2 - doorHeight) + (m * doorWidth / 2)) * h },
      { x: (0.05 + (floorb_B / 2) + (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2 - doorHeight) - (m * doorWidth / 2)) * h },
      { x: (0.05 + (floorb_B / 2) + (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2) - (m * doorWidth / 2)) * h },
      { x: (0.05 + (floorb_B / 2) - (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2) + (m * doorWidth / 2)) * h }
    ];
    drawPolygon(doorLeft, "#654321");

    const doorRight = [
      { x: (0.8 + (floorb_B / 2) - (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2 - doorHeight) - (m * doorWidth / 2)) * h },
      { x: (0.8 + (floorb_B / 2) + (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2 - doorHeight) + (m * doorWidth / 2)) * h },
      { x: (0.8 + (floorb_B / 2) + (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2) + (m * doorWidth / 2)) * h },
      { x: (0.8 + (floorb_B / 2) - (doorWidth / 2)) * w, y: ((0.95 - floorHeight / 2) - (m * doorWidth / 2)) * h }
    ];
    drawPolygon(doorRight, "#654321");

    // Pomelli
    ctx.beginPath();
    ctx.arc(0.88 * w, 0.79 * h, 0.003 * w, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0.12 * w, 0.79 * h, 0.003 * w, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  // intercetta e muove il personaggio
  document.addEventListener("keydown", function (event) {
    const step = 0.01;
    let player;
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].src == "../images/neo.png") {
        player = objects[i];
        break;
      }
    }
    if (!player) return;

    // Limiti dello schermo (o dei muri) in coordinate relative
    const limitLeft = 0.12;
    const limitRight = 0.85;

    let moved = false;
    switch (event.key) {
      case "ArrowLeft":
        moved = true;
        if (player.x < limitLeft) {
          break;
        }
        player.x -= step;
        break;
      case "ArrowRight":
        moved = true;
        if (player.x > limitRight) {
          break;
        }
        player.x += step;
        break;
    }

    if (moved) {
      // Controllo e gestisco la scelta se siamo in attesa
      if (isWaitingForChoice && resolveChoicePromise) {

        if (player.x < limitLeft) {
          // Scelta SX (Anomalia Trovata)
          isWaitingForChoice = false;
          // Faccio comparire il personaggio a destra nella prossma stanza
          let player;
          for (let i = 0; i < realObjects.length; i++) {
            if (realObjects[i].src == "../images/neo.png") {
              player = realObjects[i];
              player.x = 0.82;
              break;
            }
          }

          resolveChoicePromise('sx');
        } else if (player.x > limitRight) {
          // Scelta DX (Nessuna Anomalia)
          isWaitingForChoice = false;
          // Faccio comparire il personaggio a sinistra nella prossma stanza
          let player;
          for (let i = 0; i < realObjects.length; i++) {
            if (realObjects[i].src == "../images/neo.png") {
              player = realObjects[i];
              player.x = 0.14;
              break;
            }
          }

          resolveChoicePromise('dx');
        }
      }
      drawRoom();
      drawObjects(ctx, w, h, objects);
    }
  });

  // disegna oggetti dall'array
  function drawObjects(ctx, w, h, objectsArray) {
    for (const o of objectsArray) {
      const img = imageCache[o.src];
      if (!img) continue; // skip se non caricata
      const dx = o.x * w;
      const dy = o.y * h;
      const dw = (o.w || 0.08) * w;
      const dh = (o.h || 0.08) * h;
      ctx.drawImage(img, dx, dy, dw, dh);
    }
  }


  // Funzioni asincrone di attesa

  // Attendo che il personaggio superi il limite SX o DX.
  // La Promise viene risolta dal gestore 'keydown' quando il personaggio esce.
  function waitForChoice() {
    return new Promise(resolve => {
      // Imposto le variabili globali in modo che il gestore keydown possa risolvere
      resolveChoicePromise = resolve;
      isWaitingForChoice = true;
    });
  }

  // Attendo che il bottone di inizio venga premuto
  function waitForStart(idbutton) {
    return new Promise((resolve) => {
      const button = document.getElementById(idbutton);

      if (!button) {
        alert("Elemento non trovato: " + idbutton);
        resolve();
        return;
      }

      const handler = () => {
        button.removeEventListener('click', handler);
        resolve();
      };

      button.addEventListener('click', handler);
    });
  }

  // faccio scegliere all'utente a quale modalità vuole giocare
  async function sceltaGioco() {

    // disegno stanza + personaggio
    drawRoom();

    info.innerHTML = "Scegli la modalità di gioco";

    // introduco nell'array solo il personaggio per 
    // permettere la scelta con le frecce, 
    // in maniera da far prendere la mano all'utente 
    // con i comandi
    objects.push({
      id: totObject++,
      src: "../images/neo.png",
      x: 0.48,
      y: 0.7,
      w: 0.04,
      h: 0.15
    });
    realObjects = JSON.parse(JSON.stringify(objects));

    let player;
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].src == "../images/neo.png") {
        player = objects[i];
        break;
      }
    }

    // lo disegno
    const img = imageCache[player.src];
    if (img) {
      ctx.drawImage(img, player.x * w, player.y * h, player.w * w, player.h * h);
    }

    let istr = document.getElementById('istruzioni');
    istr.innerHTML = "Scegli la modalità alla quale vuoi giocare:" + "<br>" + "Porta a sinistra: modalità classica."
      + "<br>" + "Porta a destra: modalità survival."
      + "<br>" + "Muoviti con le frecce per oltrepassare le porte.";
    let ov = document.getElementById('istruction-overlay');
    ov.classList.remove('hidden-fade');
    await waitForStart('inizia');
    ov.classList.add('hidden-fade');


    // Attendo il movimento del persoaggio attraverso una porta
    const scelta = await waitForChoice();

    // da ora l'utente inizia a giocare e potrà salvare la partita
    stato = 'PLAYING';

    // in base alla porta attraversata faccio partire una modalità o l'altra
    if (scelta === 'sx') {
      // Sinistra = survival
      classicGameLoop(false);
      console.log('classic');
    } else {
      // Destra = classic
      survivalGameLoop(false);
      console.log('survival');
    }
  }

  // Ciclo di Gioco Classic
  async function classicGameLoop(saved) {
    const msg = document.getElementById('messaggio');
    const ov = document.getElementById('level-overlay');
    let livello = 0;
    gameType = 0;
    if (!saved) {
      gameScore = 0;

      let istr = document.getElementById('istruzioni');
      istr.innerHTML = "Al livello 0 ti verrà presentata una stanza, avrai 8 secondi per memorizzarla."
        + "<br>" + "Nelle stanze successive dovrai scoprire SE ci sono delle anomalie."
        + "<br>" + "Se ne trovi, scappa dalla porta a sinistra: il MATRIX sta cambiando e stanno venendo a prenderti."
        + "<br>" + "Se non ne trovi continua passando dalla porta a destra."
        + "<br>" + "Ogni errore ti riporterà al livello zero, nel quale troverai una nuova stanza."
        + "<br>" + "Muoviti con le frecce sulla tastiera."
        + "<br>" + "Buona fortuna.";
      let ov = document.getElementById('istruction-overlay');
      ov.classList.remove('hidden-fade');
      await waitForStart('inizia');
      ov.classList.add('hidden-fade');

      info.innerHTML = "Livello " + livello;
      // crea array oggetti
      objects = [];
      createArray(objects);
      realObjects = JSON.parse(JSON.stringify(objects));
      registraInizioPartita(gameType);
    }
    else {
      livello = gameScore;
      realObjects = JSON.parse(JSON.stringify(savedBaseCase));
      objects = JSON.parse(JSON.stringify(savedBaseCase));

      // Mostro nuovamente il caso base: se un giocatore carica di nuovo la partia se lo srà scordato
      info.innerHTML = "Caso base";
      msg.innerHTML = "Caso base";
      ov.classList.remove('hidden-fade');
      await new Promise(resolve => setTimeout(resolve, 5000));
      draw(false);
      ov.classList.add('hidden-fade');
      cd.classList.remove('hidden-fade');
      for (let i = 8; i > 0; i--) {
        cd.innerHTML = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      cd.classList.add('hidden-fade');

      info.innerHTML = "Livello " + livello;
    }



    while (livello <= 8) {
      info.innerHTML = "Livello " + livello;
      msg.innerHTML = (livello) ? ("Livello " + (livello)) : ("Livello " + livello + ": caso base");
      ov.classList.remove('hidden-fade');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // genero anomalia (true/false)
      let anomaliaPresente = Math.floor(Math.random() * 2);


      // disegno con o senza anomalia (il primo livello è sempre senza)
      if (!livello) {
        anomaliaPresente = false;
      }

      let which = draw(anomaliaPresente);

      // stampo l'anomalia, in caso non si riuscisse
      // o non si abbia voglia di avanzare in maniera "legale"
      console.log(anomaliaPresente);
      
      // rendo di nuovo visibile la stanza
      ov.classList.add('hidden-fade');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // se è il primo livello mi limito a mostrare la stanza senza anomalie
      // per 8 secondi
      if (!livello) {
        cd.classList.remove('hidden-fade');
        for (let i = 8; i > 0; i--) {
          cd.innerHTML = i;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        cd.classList.add('hidden-fade');
        gameScore++;
        livello++;
        continue;
      }

      // attendo il movimento del persoaggio attraverso una porta
      const scelta = await waitForChoice();
      
      let corretto;
      if (scelta === 'sx') {
        // Sinistra = Anomalia Trovata
        corretto = anomaliaPresente;
      } else {
        // Destra = Nessuna Anomalia Trovata
        corretto = !anomaliaPresente;
      }
      
      if (corretto) {
        livello++;
        gameScore++;
        console.log("Corretto. Livello avanzato a: " + livello);
      } else {
        aggiornaMistakes(which);
        livello = 0;
        gameScore = 0;
        console.log("Sbagliato. Livello resettato a 0.");
      }
    }

    // gioco completato
    ov.classList.remove('hidden-fade');
    msg.style.display = 'block'; // Assicurati che il testo si veda
    msg.innerHTML = "Complimenti, hai terminato i livelli!";
    await new Promise(resolve => setTimeout(resolve, 5000));
    salvaFinePartita((livello - 1));
  }

  // Ciclo di Gioco Survival Asincrono
  async function survivalGameLoop(saved) {
    const msg = document.getElementById('messaggio');
    const ov = document.getElementById('level-overlay');
    let livello = 0;
    gameType = 1;
    if (!saved) {
      gameScore = 0;

      let istr = document.getElementById('istruzioni');
      istr.innerHTML = "Al livello 0 ti verrà presentata una stanza, avrai 8 secondi per memorizzarla."
      + "<br>" + "Nelle stanze successive dovrai scoprire SE ci sono delle anomalie."
      + "<br>" + "Se ne trovi, scappa dalla porta a sinistra: il MARIX sta cambiando e stanno venendo a prenderti."
      + "<br>" + "Se non ne trovi continua passando dalla porta a destra."
      + "<br>" + "Al primo errore la partita terminerà."
      + "<br>" + "Muoviti con le frecce sulla tastiera."
      + "<br>" + "Buona fortuna.";
      let ov = document.getElementById('istruction-overlay');
      ov.classList.remove('hidden-fade');
      await waitForStart('inizia');
      ov.classList.add('hidden-fade');
      
      info.innerHTML = "Livello " + livello;
      registraInizioPartita(gameType);
    }
    else {
      livello = gameScore;
      realObjects = JSON.parse(JSON.stringify(savedBaseCase));
      objects = JSON.parse(JSON.stringify(savedBaseCase));
      
      // Mostro nuovamente il caso base: se un giocatore carica di nuovo la partia se lo sarà scordato
      info.innerHTML = "Caso base";
      msg.innerHTML = "Caso base";
      ov.classList.remove('hidden-fade');
      await new Promise(resolve => setTimeout(resolve, 5000));
      draw(false);
      ov.classList.add('hidden-fade');
      cd.classList.remove('hidden-fade');
      for (let i = 8; i > 0; i--) {
        cd.innerHTML = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      cd.classList.add('hidden-fade');
      
      info.innerHTML = "Livello " + livello;
    }
    
    
    while (1) {
      info.innerHTML = "Livello " + livello;
      ov.classList.remove('hidden-fade');
      msg.style.display = 'block';
      msg.innerHTML = (livello) ? ("Livello " + (livello)) : ("Livello " + livello + ": caso base"); // Mostra livello 0-8
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      
      // genero anomalia
      let anomaliaPresente = Math.floor(Math.random() * 2);
      
      
      // disegno con o senza anomalia (il primo livello è sempre senza)
      if (!livello) {
        objects = [];
        createArray(objects);
        realObjects = JSON.parse(JSON.stringify(objects));
        anomaliaPresente = false;
      }
      
      let which = draw(anomaliaPresente);
      
      // stampo l'anomalia, in caso non si riuscisse
      // o non si abbia voglia di avanzare in maniera "legale"
      console.log(anomaliaPresente);
      
      ov.classList.add('hidden-fade');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // se è il primo livello mostro la stanza senza anomalie
      // per 8 secondi 
      if (!livello) {
        cd.classList.remove('hidden-fade');
        for (let i = 8; i > 0; i--) {
          cd.innerHTML = i;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        cd.classList.add('hidden-fade');
        gameScore++;
        livello++;
        continue;
      }


      // attendo il movimento del persoaggio attraverso una porta. Non blocca il browser.
      const scelta = await waitForChoice();

      let corretto;
      if (scelta === 'sx') {
        // Sinistra = Anomalia Trovata
        corretto = anomaliaPresente;
      } else {
        // Destra = Nessuna Anomalia Trovata
        corretto = !anomaliaPresente;
      }

      if (corretto) {
        livello++;
        gameScore++;
        console.log("Corretto. Livello avanzato a: " + livello);
      } else {
        // gioco finito
        msg.style.display = 'block';
        msg.innerHTML = "Hai sbagliato";
        ov.classList.remove('hidden-fade');
        await new Promise(resolve => setTimeout(resolve, 5000));
        aggiornaMistakes(which);
        salvaFinePartita(livello);

      }
    }
  }

  // funzione principale di disegno, ritorna il tipo di anomalia, mi servirà per le staistiche sugli errori
  function draw(a) {
    objects = JSON.parse(JSON.stringify(realObjects));
    if (!a) {
      // disegna sfondo stanza
      drawRoom();
      // disegna oggetti
      drawObjects(ctx, w, h, objects);
      return -1;
    }
    else {
      // -------------------------
      // lista anomalie:
      // 0: luci
      // 1: quadri
      // 2: finestre
      // 3: sedie
      // 4: sedie e tavoli
      // 5: numero finestre
      // 6: personaggio
      // -------------------------
      let type = Math.floor(Math.random() * 6);
      switch (type) {
        case 0:
          aLuci(objects);
          break;

        case 1:
          aQuadri(objects);
          break;

        case 2:
          aFinestra(objects);
          break;

        case 3:
          aSedia(objects);
          break;

        case 4:
          aSedieTavoli(objects);
          break;

        case 5:
          aFinestre(objects);
          break;
      }
      drawRoom();
      drawObjects(ctx, w, h, objects);
      return type;
    }
  }

  // ridisegno al resize, ed evito l'effetto di sfocatura dato dallo stretch di canvas 
  // Funzione per ridisegnare la scena corrente senza resettare la logica
  function redrawCurrentScene() {
    if (w > 0 && h > 0) {
      drawRoom();
      // Disegna gli oggetti nello stato in cui si trovano ora
      if (objects && objects.length > 0) {
        drawObjects(ctx, w, h, objects);
      }
    }
  }

  // ResizeObserver: osserva il canvas e aggiorna la risoluzione automaticamente
  // Questo scatta sia all'avvio che al ridimensionamento della finestra
  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    redrawCurrentScene();
  });

  // Inizia a osservare il canvas
  resizeObserver.observe(canvas);

  // Preload../images ora aspetta che le immagini siano caricate e poi inizia il gioco.
  preloadimages(allimagesources).then(() => {
    resizeCanvas();

    // Controllo se PHP ha passato dei dati di salvataggio
    if (typeof serverGameData !== 'undefined' && serverGameData !== null && serverGameData.load === true) {
      console.log("Caricamento partita...");

      // Recupero i dati
      let gameId = serverGameData.id;
      let type = serverGameData.type;
      let score = serverGameData.score;
      let rawBaseCase = serverGameData.base_case;

      sessionStorage.setItem('id_partita_corrente', gameId);
      gameType = type;
      gameScore = score;
      stato = 'PLAYING';

      // Gestisco il Base Case
      try {
        savedBaseCase = (typeof rawBaseCase === 'string') ? JSON.parse(rawBaseCase) : rawBaseCase;
      } catch (e) {
        console.error("Errore nel parsing del base_case:", e);
        savedBaseCase = [];
      }

      if (type == 1) {
        survivalGameLoop(true);
        console.log("Partita Survival caricata.");
      } else {
        classicGameLoop(true);
        console.log("Partita Classica caricata.");
      }

    } else {
      console.log("Avvio Nuova Partita");
      sceltaGioco();
    }
  });

});