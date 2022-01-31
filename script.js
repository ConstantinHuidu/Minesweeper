let lines = 10, columns = 10;
let numberOfMines = 1;
let gameStatus = document.getElementById("gameStatus");
let gameWon = document.getElementById("gamewon");
const START = Date.now();
let discoveredTiles = 0;
let gameActive = true;

function play(btn) {
    var id = btn.id;
    if (id == "easy") {
        lines = 10;
        columns = 10;
        numberOfMines = 3;
    } else if (id =="pro") {
        lines = 20;
        columns = 20;
        numberOfMines = 45;
    }
    generateBoard(lines, columns);
    document.getElementById("easy").disabled = true;
    document.getElementById("pro").disabled = true;
}

//this will generate the gameboard
function generateBoard(lines, columns) {
    var gameboard = document.getElementById("board");
    for (let i = 0; i < lines; ++i) {
        var line = gameboard.insertRow(i);
        for (let j = 0; j < columns; ++j) {
            var cell = line.insertCell(j);
            var currentTile = gameboard.rows[i].cells[j];
            currentTile.classList.add("uncovered");
            //removes right click pop-up for the gameboard area only
            gameboard.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            })
            currentTile.addEventListener('contextmenu', function(e) {
                if (gameActive) {
                    flagTile(gameboard, i, j);
                }
            })
            currentTile.addEventListener('click', function(e) {
                if(gameActive) {
                    revealTile(gameboard, i , j)
                }
            })
        }
    }
    generateMines(gameboard); 
}

//plant a flag on right click
function flagTile(gameboard, i , j) {
    var currentTile = gameboard.rows[i].cells[j];
    //removes flag of an already flagged tile
    if (currentTile.classList.contains('markedMine')) {
        currentTile.classList.remove('markedMine');
        currentTile.classList.add("uncovered");
        currentTile.innerHTML = "";
    } else if (!currentTile.classList.contains('markedMine') && !currentTile.classList.contains('gamecells')) {  //adds flag
        currentTile.classList.remove("uncovered");
        currentTile.classList.add('markedMine');
        currentTile.innerHTML = "<img src=\"flag.png\">";
    }
}

//reveals cell on click
function revealTile(gameboard, i , j) {
    var currentTile = gameboard.rows[i].cells[j];
    if (!currentTile.classList.contains("markedMine") && !currentTile.classList.contains('gamecells')) {
        currentTile.classList.remove("uncovered");
        currentTile.classList.add('gamecells');
        if (currentTile.count != 0) {
            currentTile.innerHTML = currentTile.count;
        } else if (currentTile.count == 0) {
            currentTile.innerHTML = "";
            showAllEmpty(gameboard, i, j);
        }
        isGameWon(gameboard);
        isGameLost(gameboard, i, j);
    }
}

//this will generate the bombs
function generateMines(gameboard, i , j) {
    var mines = numberOfMines;
    while (mines > 0) {
        var mineRandomPositionX = Math.floor(Math.random() * lines);
        var mineRandomPositionY = Math.floor(Math.random() * columns);
        if (!gameboard.rows[mineRandomPositionX].cells[mineRandomPositionY].classList.contains("mine")) {
            gameboard.rows[mineRandomPositionX].cells[mineRandomPositionY].classList.add("mine");
            gameboard.rows[mineRandomPositionX].cells[mineRandomPositionY].classList.remove("gamecells");
            --mines;
        }
    }
    nearbyMines(gameboard, i, j)
}

//check if game is won
function isGameWon(gameboard) {
    var flippedTiles = 0;
    for (let line = 0; line < lines; ++line) {
        for (let column = 0; column < columns; ++column) {
            if (gameboard.rows[line].cells[column].classList.contains("gamecells") && !gameboard.rows[line].cells[column].classList.contains("mine")) {
                ++flippedTiles;
            }
        }
    }
    if (lines * columns - flippedTiles === numberOfMines) {
        gameWon.innerHTML = "Game Won";
        showMines(gameboard);
        clearInterval(interval); // timer stops
        gameActive = false;
        return true;
    }
}

//checks for mine and if mine found --> uncover all mines
function isGameLost(gameboard, i, j) {
    if (gameboard.rows[i].cells[j].classList.contains("mine")) {
        gameStatus.innerHTML = "Game Over";
        clearInterval(interval); // timer stops
        //search for all mines and uncover them
        showMines(gameboard);
        gameActive = false;
        return true;
    }
}

//at the end of the game, goes through all the grid and displays the mines;
function showMines(gameboard) {
    for (let line = 0; line < lines; ++line) {
        for (let column = 0; column < columns; ++column) {
            if (gameboard.rows[line].cells[column].classList.contains("mine")) {
                gameboard.rows[line].cells[column].classList.remove("uncovered");
                gameboard.rows[line].cells[column].classList.remove("markedMine");
                gameboard.rows[line].cells[column].innerHTML = "<img src=\"bomb.png\">";
            }
        }
    }
}

//counts for neighboring mines
function nearbyMines(gameboard, i, j) {
    for (let i = 0; i < lines; ++i) {
        for (let j = 0; j < columns; ++j) {
            if (!gameboard.rows[i].cells[j].classList.contains("mine")) {
                var bombCount = 0;
                for (let x = i - 1; x <= i + 1; ++ x) {
                    for (let y = j - 1; y <= j + 1; ++y) {
                        if (x >= 0 && x < lines && y >= 0 && y < columns && 
                            gameboard.rows[x].cells[y].classList.contains("mine")) {
                            ++bombCount;
                        }
                    }
                }
                gameboard.rows[i].cells[j].count = bombCount;
            }
        }
    }

}

//click on empty cell --> reveal all neighboring empty cells
function showAllEmpty(gameboard, i, j) {
    for (let x = i - 1; x <= i + 1; ++ x) {
        for (let y = j - 1; y <= j + 1; ++y) {
            if (x >= 0 && x < lines && y >= 0 && y < columns) {
                if (gameboard.rows[x].cells[y].count > 0) {
                    gameboard.rows[x].cells[y].classList.remove('uncovered');
                    gameboard.rows[x].cells[y].classList.remove('markedMine');
                    gameboard.rows[x].cells[y].classList.add('gamecells');
                    gameboard.rows[x].cells[y].innerHTML = gameboard.rows[x].cells[y].count;
                } else if (gameboard.rows[x].cells[y].count == 0 && !gameboard.rows[x].cells[y].classList.contains("gamecells") && !gameboard.rows[x].cells[y].classList.contains("mine")) {
                    gameboard.rows[x].cells[y].classList.remove('uncovered');
                    gameboard.rows[x].cells[y].classList.remove('markedMine');
                    gameboard.rows[x].cells[y].classList.add('gamecells');
                    gameboard.rows[x].cells[y].innerHTML = "";
                    showAllEmpty(gameboard, x, y);
                }
            }
        }
    }
}

var interval = setInterval(function() {
    var seconds = (Math.floor((Date.now() - START)/1000));
    var minutes = 0;
    while (seconds > 59) {
        ++minutes;
        seconds -= 60;
    }
    document.getElementById("timer").innerHTML = "Time: " + minutes + " min : " + seconds + " sec";
}, 1000)