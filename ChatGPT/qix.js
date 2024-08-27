const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

const player = {
    x: 0,
    y: 0,
    size: 5,
    color: 'white',
    speed: 2,
    dx: 0,
    dy: 0,
    path: []  // Traccia il percorso del giocatore
};

let isDrawing = false;
let capturedArea = 0;
let filledAreas = [];

// Movimento del giocatore
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x <= 0) player.x = 0;
    if (player.y <= 0) player.y = 0;
    if (player.x >= canvas.width ) player.x = canvas.width ;
    if (player.y >= canvas.height ) player.y = canvas.height;

    if (isDrawing) {
        // Aggiungi la posizione corrente al percorso tracciato
        player.path.push({ x: player.x, y: player.y });
    }
}

// Disegna il giocatore
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Disegna il percorso del giocatore
function drawPath() {
    if (player.path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(player.path[0].x + player.size / 2, player.path[0].y + player.size / 2);
        for (let i = 1; i < player.path.length; i++) {
            ctx.lineTo(player.path[i].x + player.size / 2, player.path[i].y + player.size / 2);
        }
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
    }
}

// Riempi l'area conquistata
function fillArea() {
    if (player.path.length > 2) {
        ctx.beginPath();
        ctx.moveTo(player.path[0].x + player.size / 2, player.path[0].y + player.size / 2);
        for (let i = 1; i < player.path.length; i++) {
            ctx.lineTo(player.path[i].x + player.size / 2, player.path[i].y + player.size / 2);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';  // Colore dell'area conquistata
        ctx.fill();

        // Aggiungi l'area riempita all'array filledAreas
        filledAreas.push([...player.path]);
    }
    player.path = [];  // Resetta il percorso
}

// Controlla se la linea viene chiusa
function endDrawing() {
    if (isDrawing) {
        // Controlla se il giocatore ha chiuso il percorso tornando al punto iniziale
        /*const returnedToStart = player.path.length > 2 &&
                                player.path[0].x === player.x &&
                                player.path[0].y === player.y;*/

        // Controlla se il giocatore ha chiuso il percorso toccando uno dei bordi del canvas
        const reachedBorder = player.x <= 0 || player.x >= canvas.width - player.size ||
                              player.y <= 0 || player.y >= canvas.height - player.size;

        // Se il percorso è chiuso o il giocatore ha raggiunto un bordo, riempi l'area
        if (/*returnedToStart ||*/ reachedBorder) {
            fillArea();
        }
        isDrawing = false;
    }
}


// Gestione input
function keyDown(e) {
    if (isDrawing) {
	    if (e.key === 'ArrowRight') {
	        player.dx = player.speed;
	        player.dy = 0;
	    } else if (e.key === 'ArrowLeft') {
	        player.dx = -player.speed;
	        player.dy = 0;
	    } else if (e.key === 'ArrowUp') {
	        player.dy = -player.speed;
	        player.dx = 0;
	    } else if (e.key === 'ArrowDown') {
	        player.dy = player.speed;
	        player.dx = 0;
	    }
	}

    if (!isDrawing) {
		if (e.key === 'Control') {
		        isDrawing = true;
		        player.path = [{ x: player.x, y: player.y }];

		    }
	}
}

function keyUp(e) {
    if (e.key === 'Control')
    {
        endDrawing();
    }

    if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
    ) {
        player.dx = 0;
        player.dy = 0;
    }

}

// Gestione del gioco
function update() {
    movePlayer();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna le aree conquistate
    filledAreas.forEach(area => {
        ctx.beginPath();
        ctx.moveTo(area[0].x + player.size / 2, area[0].y + player.size / 2);
        for (let i = 1; i < area.length; i++) {
            ctx.lineTo(area[i].x + player.size / 2, area[i].y + player.size / 2);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
        ctx.fill();
    });

    drawPath();
    drawPlayer();

    requestAnimationFrame(update);
}

update();

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

