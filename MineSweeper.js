'use strick'
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
    secsPassed: 0

}

function onInit() {
    gGame.isOn = true
    gBoard = buildBoard()
    renderBoard(gBoard)

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
    setMinesNegsCount(board)
    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var count = 0
            for (var x = i - 1; x <= i + 1; x++) {
                if (x < 0 || x >= board.length) continue
                for (var y = j - 1; y <= j + 1; y++) {
                    if (y < 0 || y >= board[0].length) continue
                    if (x === i && y === j) continue
                    if (board[x][y].isMine) count++
                }
            }
            board[i][j].minesAroundCount = count
        }
    }
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
                if (cell.isMine) cellContent = '&#128163;'
                else if (cell.minesAroundCount > 0) cellContent = cell.minesAroundCount
            } else if (cell.isMarked) {
                cellContent = '&#128681;'
            }

            strHTML += `<td class="${className}"
       onclick="onCellClicked(${i},${j})"
       oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;">
       ${cellContent}
     </td>`
        }

        strHTML += '</tr>'
    }

    document.querySelector('.board').innerHTML = strHTML
}

function onCellClicked(i, j) {
    console.log('clicked', i, j)
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isMine) {

    }
    cell.isRevealed = true
    renderBoard(gBoard)
    console.log('td class:', document.querySelector(`.cell-${i}-${j}`).className)
}


function onCellMarked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (cell.isRevealed) return
    cell.isMarked = !cell.isMarked
    if (cell.isMarked) gGame.markedCount++
    else gGame.markedCount--

    renderBoard(gBoard)
}