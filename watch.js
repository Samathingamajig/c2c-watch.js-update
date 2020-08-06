var gameState = null;

function addLog(logDiv, moveSeqno, text) {
    var para = document.createElement("P");
    var logTextNode = document.createTextNode(moveSeqno.toString() + ")\t" + text);
    para.appendChild(logTextNode);
    logDiv.appendChild(para);
}

var moveSeqno = 1;
function draw() {
    // if game state isn't present, skip
    if (!gameState) {
        // TODO REMOVE
        console.log("game state missing!");
        return;
    }

    // fill the dom elements
    document.getElementById("pb_score").innerHTML = ":" + gameState.blackScore.toString()
    document.getElementById("pr_score").innerHTML = ":" + gameState.redScore.toString()

    // do canvas 
    var c = document.getElementById("game_canvas");
    var ctx = c.getContext("2d");

    const width = c.width;
    const height = c.height;

    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "blue";
    ctx.fill();

    const cellWidth = width / 7;
    const cellHeight = height / 6;

    const radiusX = cellWidth * 2 / 5;
    const radiusY = cellHeight * 2 / 5;

    var col;
    var row;
    const board = gameState.board;
    const lastMove = gameState.last_move;

    if (lastMove) {
        var logDiv = document.getElementById("logcontent")

        if (moveNum == 1) {
            addLog(logDiv, moveSeqno, "Starting match " + (matchNum+1).toString())
        }

        // handle move log
        addLog(logDiv, moveSeqno, lastMove.color + ": \t" + lastMove.col.toString());

        if (gameState.gameWinner) {
            if ("draw" === gameState.gameWinner) {
                addLog(logDiv, moveSeqno, "match " + (matchNum+1) + " ends in a draw!");
            } else {
                addLog(logDiv, moveSeqno, gameState.gameWinner.toString() + " wins match " + (matchNum+1).toString())            
            }
            moveSeqno = 0;
        }

        if (gameState.overallWinner) {
            if (gameState.overallWinner === "draw") {
                addLog(logDiv, moveSeqno, "game ends in a draw!");
            } else {
                addLog(logDiv, moveSeqno, gameState.overallWinner.toString() + " is victorious!")
            }
        }
        moveSeqno++;
    }

    for (col = 0; col < 7; col++) {
        const columnData = board[col];
        const drawX = (col + 0.5) * cellWidth;
        for (row = 0; row < 6; row++) {
            const drawY = (6 - row - 0.5) * cellHeight;
            ctx.beginPath();
            ctx.ellipse(drawX, drawY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            if (row >= columnData.length) {
                ctx.fillStyle = "white";
            } else if ("R" == columnData[row]) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fill();
            if (lastMove && lastMove.col == col && row == columnData.length - 1) {
                ctx.lineWidth = 5
                ctx.beginPath();
                ctx.ellipse(drawX, drawY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.strokeStyle = "gold";
                ctx.stroke();
            }
        }
    }
}

var matchNum = 0;
var moveNum = 0;
function getGameState() {
    const postData = {
        "gameId": gameId,
        "matchNum": matchNum,
        "moveNum": moveNum
    };

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/getmove",
        dataType:"json",
        processData: false,
        data: JSON.stringify(postData), 
    }).done(function(data) {
        // TODO REMOVE
        console.log(data);
        gameState = data;
        step();
    }).fail(function() {
        gameState = null;
        step();
    });
}

const stepIntervalMs = 500;
var done = false;

function step() {
    if (done) {
        return;
    }
    console.log(gameId + "[" + matchNum + "][" + moveNum + "]");
    
    // TODO REMOVE
    console.log(gameState);

    var sleepTime = stepIntervalMs;
    if (!gameState) {
       console.log("bad game state, trying again later");
       setTimeout(getGameState, sleepTime);
       return;
    }
    draw();
    if (gameState.hasOwnProperty("overallWinner"))  {
        // TODO visually display this somehow or something
        clearTimeout();
        done = true;
        return;
    } else if (gameState.hasOwnProperty("gameWinner")) {
        // TODO visually display this somehow or something
        matchNum++;
        moveNum = 0;
        sleepTime *= 4;
    } else {
        moveNum++; 
    }
    
    setTimeout(getGameState, sleepTime);
}
