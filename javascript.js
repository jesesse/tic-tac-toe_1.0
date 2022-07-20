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

/*--------------------------------------------------------------------------------*/


//Controls the gameboard data
const gameboardController = (() => {

    let gameboardSize = 9;
    const _gameboard = [];

    function setMark(squareId, mark) {
        _gameboard[squareId] = mark;
    }

    function getSquare(index) {
        return _gameboard[index];
    }

    function setGameboardSize(size) {
        gameboardSize = size;
    }

    function getGameboardSize() {
        return gameboardSize;
    }

    function getFreeSquares() {
        let freeSquares = [];
        for (let i = 0; i < gameboardSize; i++) {
            if (_gameboard[i] == undefined) freeSquares.push(_gameboard[i]);
        }
        return freeSquares;
    }

    function clearGameboard() {
        for (i = 0; i < gameboardSize; i++) {
            _gameboard[i] = undefined;
        }
    }

    return {
        setMark,
        getSquare,
        getFreeSquares,
        clearGameboard,
        setGameboardSize,
        getGameboardSize
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
        displayController.showGameOverMessage("AI TURN");

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

        displayController.showGameOverMessage("PLAYER TURN");

        if (checkForWin() || checkForDraw()) gameOver();
    }

    function aiMakeRandomMove() {
        let randomIndex = Math.floor(Math.random() * (gameboardController.getGameboardSize()));
        while (gameboardController.getSquare(randomIndex)) {
            randomIndex = Math.floor(Math.random() * (gameboardController.getGameboardSize()));
        }
        gameboardController.setMark(randomIndex, ai.mark);
        displayController.renderMark(randomIndex, ai.mark);
    }

    function aiMakeBestMove() {
        let bestMove;
        let score;
        let bestScore = +Infinity;

        for (let i = 0; i < gameboardController.getGameboardSize(); i++) {
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
            for (let i = 0; i < gameboardController.getGameboardSize(); i++) {
                if (!(gameboardController.getSquare(i) == undefined)) continue;
                gameboardController.setMark(i, player1.mark)
                let score = minimax(false);
                bestScore = Math.max(score, bestScore)
                gameboardController.setMark(i, undefined)
            }

            return bestScore;

        } 

        if (!isMaximisingPlayer){
            let bestScore = +Infinity;
            for (let i = 0; i < gameboardController.getGameboardSize(); i++) {

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
        for (let i = 0; i < Math.sqrt(gameboardController.getGameboardSize()); i++) {
            let row = [];
            for (let j = i * Math.sqrt(gameboardController.getGameboardSize()); j < i * Math.sqrt(gameboardController.getGameboardSize()) + Math.sqrt(gameboardController.getGameboardSize()); j++) {
                row.push(gameboardController.getSquare(j));
            }
            if (row.every(square => square == 'X')) return "X wins";
            if (row.every(square => square == 'O')) return "O wins";
        }
        return false;
    }

    function checkForColumns() {
        for (let i = 0; i < Math.sqrt(gameboardController.getGameboardSize()); i++) {
            let column = [];
            for (let j = 0; j < Math.sqrt(gameboardController.getGameboardSize()); j++) {
                column.push(gameboardController.getSquare(i + Math.sqrt(gameboardController.getGameboardSize()) * j));
            }
            if (column.every(square => square == 'X')) return "X wins";
            if (column.every(square => square == 'O')) return "O wins";
        }
        return false;
    }

    function checkForDiagonals() {

        if (gameboardController.getGameboardSize() == 25) {
            
            let diagonal1 = [];
            diagonal1.push(gameboardController.getSquare(0));
            diagonal1.push(gameboardController.getSquare(6));
            diagonal1.push(gameboardController.getSquare(12));
            diagonal1.push(gameboardController.getSquare(18));
            diagonal1.push(gameboardController.getSquare(24));

            if (diagonal1.every(square => square == 'X')) return "X wins";
            if (diagonal1.every(square => square == 'O')) return "O wins";

            let diagonal2 = [];
            diagonal2.push(gameboardController.getSquare(4));
            diagonal2.push(gameboardController.getSquare(8));
            diagonal2.push(gameboardController.getSquare(12));
            diagonal2.push(gameboardController.getSquare(16));
            diagonal2.push(gameboardController.getSquare(20));

            if (diagonal2.every(square => square == 'X')) return "X wins";
            if (diagonal2.every(square => square == 'O')) return "O wins";

            return false;
        }

        if (gameboardController.getGameboardSize() == 16) {

            let diagonal1 = [];
            diagonal1.push(gameboardController.getSquare(0));
            diagonal1.push(gameboardController.getSquare(5));
            diagonal1.push(gameboardController.getSquare(10));
            diagonal1.push(gameboardController.getSquare(15));

            if (diagonal1.every(square => square == 'X')) return "X wins";
            if (diagonal1.every(square => square == 'O')) return "O wins";

            let diagonal2 = [];
            diagonal2.push(gameboardController.getSquare(3));
            diagonal2.push(gameboardController.getSquare(6));
            diagonal2.push(gameboardController.getSquare(9));
            diagonal2.push(gameboardController.getSquare(12));

            if (diagonal2.every(square => square == 'X')) return "X wins";
            if (diagonal2.every(square => square == 'O')) return "O wins";

            return false;
        }
        if (gameboardController.getGameboardSize() == 9) {
            
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

        
    }

    function checkForDraw() {
        if (checkForWin()) return false;
        if (gameboardController.getFreeSquares().length == 0) return "It's a tie";
        return false;
    }

    function gameOver() {
        displayController.disableGameboard();
        if (checkForWin()) displayController.showGameOverMessage(checkForWin());
        else displayController.showGameOverMessage(checkForDraw());
    }

    function restart() {
        gameboardController.clearGameboard();
        displayController.clearGameboard();
        displayController.createGameboard();
        displayController.enableGameboard();
        displayController.clearGameOverMessage();
        displayController.showGameOverMessage("PLAYER TURN");
        if (player1.mark == 'O') aiMakeMove();
    }

    return {
        assignPlayerMark,
        setAiLevel,
        playerMakeMove,
        restart
    }
})();





/*--------------------------------------------------------------------------------*/

//Controls the graphical UI
const displayController = (() => {
    const small = document.querySelector('.s');
    const big = document.querySelector('.l');
    const xlarge = document.querySelector('.xl');
    const buttonX = document.querySelector('.x');
    const buttonO = document.querySelector('.o');
    const easy = document.querySelector('.easy');
    const normal = document.querySelector('.normal');
    const hard = document.querySelector('.hard');
    const restart = document.querySelector('.restart');
    const gameOverMessage = document.querySelector('.game-over-message');
    const gameboard = document.querySelector('.gameboard');

    small.addEventListener('click', (e) => {
        gameboard.style = 'grid-template-columns: repeat(3, 100px); grid-template-rows: repeat(3, 100px);'
        e.target.style = 'border: 3px solid black;';
        big.style = 'border: 1px solid black;';
        xlarge.style = 'border: 1px solid black;';
        gameboardController.setGameboardSize(9);
        gameController.restart();
    });

    big.addEventListener('click', (e) => {
        gameboard.style = 'grid-template-columns: repeat(4, 90px); grid-template-rows: repeat(4, 90px);'
        e.target.style = 'border: 3px solid black;';
        small.style = 'border: 1px solid black;';
        xlarge.style = 'border: 1px solid black;';
        gameboardController.setGameboardSize(16);
        gameController.restart();
    });

    xlarge.addEventListener('click', (e) => {
        gameboard.style = 'grid-template-columns: repeat(5, 80px); grid-template-rows: repeat(5, 80px);'
        e.target.style = 'border: 3px solid black;';
        small.style = 'border: 1px solid black;';
        big.style = 'border: 1px solid black;';
        gameboardController.setGameboardSize(25);
        gameController.restart();
    });

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

    const squares = document.querySelectorAll('.square');
    squares.forEach((square) => square.addEventListener("click", gameController.playerMakeMove))


    function createGameboard() {
        for (let i = 0; i < gameboardController.getGameboardSize(); i++) {
            const square = document.createElement('button');
            square.classList.add('square');
            square.setAttribute('id', i);
            square.addEventListener('click', gameController.playerMakeMove)
            gameboard.appendChild(square);
        }
    }

    function disableGameboard() {
        for (let i = 0; i < gameboardController.getGameboardSize(); i++) {
            document.getElementById(i).disabled = true;
            document.getElementById(i).classList.toggle('square_hover')
        }
    }

    function enableGameboard() {
        for (let i = 0; i < gameboardController.getGameboardSize(); i++) {
            document.getElementById(i).disabled = false;
            document.getElementById(i).classList.toggle('square_hover')
        }
    }

    restart.addEventListener('click', () => gameController.restart())

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
        while (gameboard.lastChild) gameboard.removeChild(gameboard.lastChild);
    }

    return {
        renderMark,
        clearGameboard,
        disableGameboard,
        enableGameboard,
        showGameOverMessage,
        clearGameOverMessage,
        createGameboard
    }

})();