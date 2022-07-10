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


const gameboardController = (() => {
    const _gameboard = new Array(9);

    function setMark(squareId, mark) {
        _gameboard[squareId] = mark;
    }

    function getSquare(index) {
        return _gameboard[index];
    }

    function clearGameboard() {
        for (i = 0; i < 9; i++){
            _gameboard[i] = '';
        }
    }

    return {
        setMark,
        getSquare,
        clearGameboard
    }
})();


const gameController = (() => {

    const player1 = player('X')
    const ai = aiPlayer('O', 'easy')

    function assignPlayerMark(mark) {
        if (mark == 'X') {
            player1.mark = mark;
            ai.mark = 'O';
        } else {
            player1.mark = 'O';
            ai.mark = 'X';
        }
    }

    function playerMakeMove() {
        let square = this;
        if (square.textContent) return;
        gameboardController.setMark(square.id, player1.mark);
        displayController.renderMark(square.id, player1.mark);

        checkforGameOver(); // // TÄHÄN JÄÄ TÄMÄ JHESSSS! 

        aiMakeMove();
    }

    async function aiMakeMove() {

        if (ai.aiLevel == 'easy') {
            let randomIndex = Math.floor(Math.random() * (9));
            while (gameboardController.getSquare(randomIndex)) {
                randomIndex = Math.floor(Math.random() * (9));
            }

            await sleep(400);
            gameboardController.setMark(randomIndex, ai.mark);
            displayController.renderMark(randomIndex, ai.mark);
        }

        if (ai.aiLevel == 'unbeatable') findBestMove(); // JA TÄHÄN MYÖS!!

        checkforGameOver(); // TÄHÄN JÄÄ TÄMÄ JHESSSS!
    }

    function restart() {
        gameboardController.clearGameboard();
        displayController.clearGameboard();
        if (player1.mark == 'O') aiMakeMove();
    }

    return {
        assignPlayerMark,
        playerMakeMove,
        restart
    }


})();


const displayController = (() => {
    const buttonX = document.querySelector('.x');
    const buttonO = document.querySelector('.o');
    const squares = document.querySelectorAll('.square');
    const restart = document.querySelector('.restart');

    buttonX.addEventListener('click', (e) => {
        gameController.assignPlayerMark(e.target.textContent);
        e.target.style = 'background-color: rgb(145, 199, 145);';
        buttonO.style = 'background-color: rgb(219, 219, 219);';
        gameController.restart();
    })

    buttonO.addEventListener('click', (e) => {
        gameController.assignPlayerMark(e.target.textContent);
        e.target.style = 'background-color: rgb(145, 199, 145)';
        buttonX.style = 'background-color: rgb(219, 219, 219);';
        gameController.restart();
    })

    squares.forEach(square => {
        square.addEventListener('click', gameController.playerMakeMove)
    })

    

    restart.addEventListener('click', gameController.restart)

    function renderMark(id, mark) {
        let square = document.getElementById(id);
        square.textContent = mark;
    }

    function clearGameboard() {
        squares.forEach(square => {
            square.textContent = '';
        })
    }

    return {
        renderMark,
        clearGameboard
    }


})();



