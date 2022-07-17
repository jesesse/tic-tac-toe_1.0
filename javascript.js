function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//FACTORY FUNCTION FOR PLAYER
const player = (mark) => {
    return {
        mark
    }
}

const aiPlayer = (mark, aiLevel) => {

    return {
        mark,
        aiLevel
    }
}

/*-----------------------------------------------------------------*/

//Controls the gameboard data
const gameboardController = (() => {
    const _gameboard = new Array(9);

    function setMark(squareId, mark) {
        _gameboard[squareId] = mark;
    }

    function getSquare(index) {
        return _gameboard[index];
    }

    function getFreeSquares() {
        let freeSquares = [];
        for (let i = 0; i < _gameboard.length; i++) {
            if (_gameboard[i] == undefined) freeSquares.push(_gameboard[i]);
        }
        return freeSquares;
    }

    function clearGameboard() {
        for (i = 0; i < 9; i++) {
            _gameboard[i] = undefined;
        }
    }

    return {
        setMark,
        getSquare,
        getFreeSquares,
        clearGameboard
    }
})();

/*-----------------------------------------------------------------*/

//Controls the game flow and logic
const gameController = (() => {

    const player1 = player('X');
    const ai = aiPlayer('O', 'easy');

    function assignPlayerMark(mark) {
        if (mark == 'X') {
            player1.mark = mark;
            ai.mark = 'O';
        } else {
            player1.mark = 'O';
            ai.mark = 'X';
        }
    }

    function setAiLevel(level) {
        ai.aiLevel = level;
    }

    function playerMakeMove() {
        let index = this.id;
        if (!(gameboardController.getSquare(index) == undefined)) return;
        gameboardController.setMark(index, player1.mark);
        displayController.renderMark(index, player1.mark);

        if (checkForWin() || checkForDraw()) {
            gameOver();
            return
        }
        aiMakeMove();
    }

    async function aiMakeMove() {

        if (ai.aiLevel == 'easy') {
            displayController.disableGameboard();
            await sleep(600);
            aiMakeRandomMove();
            displayController.enableGameboard();
        }

        if (ai.aiLevel == 'normal') {
            displayController.disableGameboard();
            if (Math.random() < 0.7) {
                await sleep(600);
                aiMakeBestMove();
            } else {
                await sleep(600);
                aiMakeRandomMove();
            }
            displayController.enableGameboard();
        }

        if (ai.aiLevel == 'hard') {
            displayController.disableGameboard();
            await sleep(600);
            aiMakeBestMove();
            displayController.enableGameboard();
        }

        if (checkForWin() || checkForDraw()) gameOver();
    }

    function aiMakeRandomMove() {
        let randomIndex = Math.floor(Math.random() * (9));
        while (gameboardController.getSquare(randomIndex)) {
            randomIndex = Math.floor(Math.random() * (9));
        }
        gameboardController.setMark(randomIndex, ai.mark);
        displayController.renderMark(randomIndex, ai.mark);
    }

    function aiMakeBestMove() {
        let bestMove;
        let score;
        let bestScore = +Infinity;

        for (let i = 0; i < 9; i++) {
            if (!(gameboardController.getSquare(i) == undefined)) continue;
            gameboardController.setMark(i, ai.mark)
            score = minimax(true);
            if (score < bestScore) {
                bestScore = score;
                bestMove = i;
            }
            gameboardController.setMark(i, undefined)
        }

        gameboardController.setMark(bestMove, ai.mark);
        displayController.renderMark(bestMove, ai.mark);
    }

    function minimax(isMaximisingPlayer) {
        let result = checkForWin();

        if (player1.mark == 'X') {
            if (result == 'X wins') return +10;
            if (result == 'O wins') return -10;
            if (checkForDraw()) return 0;
        } else {
            if (result == 'X wins') return -10;
            if (result == 'O wins') return +10;
            if (checkForDraw()) return 0;
        }

        if (isMaximisingPlayer) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!(gameboardController.getSquare(i) == undefined)) continue;
                gameboardController.setMark(i, player1.mark)
                let score = minimax(false);
                bestScore = Math.max(score, bestScore)
                gameboardController.setMark(i, undefined)
            }

            return bestScore;

        } else {
            let bestScore = +Infinity;
            for (let i = 0; i < 9; i++) {

                if (!(gameboardController.getSquare(i) == undefined)) continue;

                gameboardController.setMark(i, ai.mark)
                let score = minimax(true);
                bestScore = Math.min(score, bestScore)
                gameboardController.setMark(i, undefined)
            }

            return bestScore;
        }
    }


    function checkForWin() {
        let result;
        if (checkForRows()) result = checkForRows();
        if (checkForColumns()) result = checkForColumns();
        if (checkForDiagonals()) result = checkForDiagonals();
        return result;
    }

    function checkForRows() {
        for (let i = 0; i < 3; i++) {
            let row = [];
            for (let j = i * 3; j < i * 3 + 3; j++) {
                row.push(gameboardController.getSquare(j));
            }
            if (row.every(square => square == 'X')) return "X wins";
            if (row.every(square => square == 'O')) return "O wins";
        }
        return false;
    }

    function checkForColumns() {
        for (let i = 0; i < 3; i++) {
            let column = [];
            for (let j = 0; j < 3; j++) {
                column.push(gameboardController.getSquare(i + 3 * j));
            }
            if (column.every(square => square == 'X')) return "X wins";
            if (column.every(square => square == 'O')) return "O wins";
        }
        return false;
    }

    function checkForDiagonals() {

        let diagonal1 = [];
        diagonal1.push(gameboardController.getSquare(0));
        diagonal1.push(gameboardController.getSquare(4));
        diagonal1.push(gameboardController.getSquare(8));

        if (diagonal1.every(square => square == 'X')) return "X wins";
        if (diagonal1.every(square => square == 'O')) return "O wins";

        let diagonal2 = [];
        diagonal2.push(gameboardController.getSquare(2));
        diagonal2.push(gameboardController.getSquare(4));
        diagonal2.push(gameboardController.getSquare(6));

        if (diagonal2.every(square => square == 'X')) return "X wins";
        if (diagonal2.every(square => square == 'O')) return "O wins";

        return false;
    }


    function checkForDraw() {
        if (checkForWin()) return false;
        if (gameboardController.getFreeSquares().length == 0) return "it's a tie";
        return false;
    }

    function gameOver() {
        displayController.disableGameboard();
        if(checkForWin()) displayController.showGameOverMessage(checkForWin());
        else displayController.showGameOverMessage(checkForDraw());
    }

    function restart() {
        gameboardController.clearGameboard();
        displayController.clearGameboard();
        displayController.enableGameboard();
        displayController.clearGameOverMessage();
        if (player1.mark == 'O') aiMakeMove();
    }

    return {
        assignPlayerMark,
        setAiLevel,
        playerMakeMove,
        restart
    }
})();


/*--------------------------------------------------------------*/

//Controls the graphical UI
const displayController = (() => {
    const buttonX = document.querySelector('.x');
    const buttonO = document.querySelector('.o');
    const easy = document.querySelector('.easy');
    const normal = document.querySelector('.normal');
    const hard = document.querySelector('.hard');
    const restart = document.querySelector('.restart');
    const squares = document.querySelectorAll('.square');
    const gameOverMessage = document.querySelector('.game-over-message');

    buttonX.addEventListener('click', (e) => {
        gameController.assignPlayerMark(e.target.textContent);
        e.target.style = 'border: 3px solid black;';
        buttonO.style = 'border: 1px solid black;';
        gameController.restart();
    })

    buttonO.addEventListener('click', (e) => {
        gameController.assignPlayerMark(e.target.textContent);
        e.target.style = 'border: 3px solid black;';
        buttonX.style = 'border: 1px solid black;';
        gameController.restart();
    })

    easy.addEventListener('click', (e) => {
        gameController.setAiLevel('easy');
        e.target.style = 'border: 3px solid black;';
        normal.style = 'border: 1px solid black;';
        hard.style = 'border: 1px solid black;';
        gameController.restart();
    })

    normal.addEventListener('click', (e) => {
        gameController.setAiLevel('normal');
        e.target.style = 'border: 3px solid black;';
        easy.style = 'border: 1px solid black;';
        hard.style = 'border: 1px solid black;';
        gameController.restart();
    })
    hard.addEventListener('click', (e) => {
        gameController.setAiLevel('hard');
        e.target.style = 'border: 3px solid black;';
        easy.style = 'border: 1px solid black;';
        normal.style = 'border: 1px solid black;';
        gameController.restart();
    })


    squares.forEach(square => {
        square.addEventListener('click', gameController.playerMakeMove)
    })

    function disableGameboard() {
        for (let i = 0; i < 9; i++) {
            document.getElementById(i).disabled = true;
        }
    }

    function enableGameboard() {
        for (let i = 0; i < 9; i++) {
            document.getElementById(i).disabled = false;
        }
    }

    restart.addEventListener('click', gameController.restart)

    function renderMark(id, mark) {
        let square = document.getElementById(id);
        square.textContent = mark;
    }

    function showGameOverMessage(message) {
        gameOverMessage.textContent = message;
    }

    function clearGameOverMessage() {
        gameOverMessage.textContent = '';
    }

    function clearGameboard() {
        squares.forEach(square => {
            square.textContent = '';
        })
    }



    return {
        renderMark,
        clearGameboard,
        disableGameboard,
        enableGameboard,
        showGameOverMessage,
        clearGameOverMessage
    }


})();



