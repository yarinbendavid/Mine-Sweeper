'use strict'
const MINE = '💣'
const FLAG = '🚩'
console.log('MineSweeper.js loaded')
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3

}

function onInit() {
    gGame.isOn = true
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.lives = 3
    gBoard = buildBoard()
    renderBoard(gBoard)
    renderLives()
    document.querySelector('.board').addEventListener('contextmenu',
        function (ev) {
            ev.preventDefault()
        },
        { once: true }
    )
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                isMine: false,
                isRevealed: false,
                isMarked: false,
                minesAroundCount: 0
            }
        }
    }
    placeMines(board)
    setMinesNegsCount(board)
    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countMinesAround(board, i, j)
        }
    }

}

function countMinesAround(board, row, col) {
    var count = 0
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === row && j === col) continue
            if (board[i][j].isMine) count++
        }
    }
    return count
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var cellContent = ''

            var className = `cell cell-${i}-${j}`
            if (cell.isRevealed) {
                className += ' revealed'
                if (cell.isMine) cellContent = MINE
                else if (cell.minesAroundCount > 0) {
                    cellContent = cell.minesAroundCount
                    className += ` number num-${cell.minesAroundCount}`
                }
            } else if (cell.isMarked) {
                cellContent = FLAG
            }


            strHTML += `
   <td class="${className}"
    data-i="${i}" data-j="${j}"
    onclick="onCellClicked(this, ${i}, ${j})"
    oncontextmenu="onCellMarked(event, this, ${i}, ${j})">
   ${cellContent}
   </td>
   `


        }

        strHTML += '</tr>'
    }

    document.querySelector('.board').innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isMarked || cell.isRevealed) return
    cell.isRevealed = true
    gGame.revealedCount++

    if (cell.isMine) {
        gGame.lives--
        renderLives()
        cell.isRevealed = true
        renderBoard(gBoard)

        if (gGame.lives === 0) {
            gGame.isOn = false
            alert('Game Over')
        }
        return
    }

    if (cell.minesAroundCount === 0) expandReveal(gBoard, elCell, i, j)
    renderBoard(gBoard)
    checkGameOver()
}



function onCellMarked(event, elCell, i, j) {
    console.log('marked', i, j)
    event.preventDefault()
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isRevealed) return
    cell.isMarked = !cell.isMarked
    gGame.markedCount += cell.isMarked ? 1 : -1

    renderBoard(gBoard)
    checkGameOver()
}

function checkGameOver() {
    var totalCells = gLevel.SIZE * gLevel.SIZE
    var nonMines = totalCells - gLevel.MINES
    if (gGame.revealedCount === nonMines && gGame.markedCount === gLevel.MINES) {
        gGame.isOn = false
        alert('You Win!')
    }
}



function expandReveal(board, elCell, row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === row && j === col) continue
            var neighbor = board[i][j]
            if (neighbor.isRevealed || neighbor.isMarked || neighbor.isMine) continue
            neighbor.isRevealed = true
            gGame.revealedCount++
        }
    }
}
function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function placeMines(board) {
    var placed = 0
    while (placed < gLevel.MINES) {
        var i = getRandomInt(0, gLevel.SIZE)
        var j = getRandomInt(0, gLevel.SIZE)
        if (board[i][j].isMine) continue
        board[i][j].isMine = true
        placed++
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function renderLives() {
    var str = 'Lives left: '
    for (var i = 0; i < gGame.lives; i++) str += '❤️'
    document.querySelector('.lives').innerText = str
}


