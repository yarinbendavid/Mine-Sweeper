'use strict'
const MINE = '💣'
const FLAG = '🚩'
var gIsFirstClick = true
var gBoard
var gIsHintMode = false
var gHintsLeft = 3
var gHintIdCounter = 0
var gTimerInterval = null
var gStartTime = 0

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
    gIsHintMode = false
    gHintsLeft = 3
    gHintIdCounter = 0

    resetTimer()
    gBoard = buildBoard()
    gIsFirstClick = true
    setSmiley('normal')
    renderBoard(gBoard)
    renderLives()
    renderHints()
    renderBestScore()
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

function placeMines(board, forbiddenI, forbiddenJ) {
    var placed = 0
    while (placed < gLevel.MINES) {
        var i = getRandomInt(0, gLevel.SIZE)
        var j = getRandomInt(0, gLevel.SIZE)

        if (i === forbiddenI && j === forbiddenJ) continue

        if (board[i][j].isMine) continue
        board[i][j].isMine = true
        placed++
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
            onclick="onCellClicked(this, ${i}, ${j})"
            oncontextmenu="return onCellRightClick(event, ${i}, ${j})">
          ${cellContent}
        </td>
      `
        }

        strHTML += '</tr>'
    }

    document.querySelector('.board').innerHTML = strHTML
}

function renderHints() {
    var strHTML = ''
    for (var i = 0; i < 3; i++) {
        var isUsed = i >= gHintsLeft
        var cls = isUsed ? 'used' : ''
        strHTML += `<button class="hint ${cls}" onclick="onHintClick(${i})">💡</button>`
    }
    document.querySelector('.hints').innerHTML = strHTML
}

function onHintClick(idx) {

    if (!gGame.isOn) return
    if (gHintsLeft <= 0) return

    gIsHintMode = true

    var elHints = document.querySelectorAll('.hint')
    elHints.forEach(btn => btn.classList.remove('active'))

    elHints[gHintsLeft - 1].classList.add('active')
}


function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isMarked || cell.isRevealed) return
    if (gIsFirstClick) {
        placeMines(gBoard, i, j)
        setMinesNegsCount(gBoard)
        gIsFirstClick = false
    }

    startTimerIfNeeded()

    if (gIsHintMode) {
        useHint(i, j)
        return
    }


    cell = gBoard[i][j]


    if (cell.isMine) {
        cell.isRevealed = true
        renderBoard(gBoard)

        gGame.lives--
        renderLives()

        if (gGame.lives === 0) {
            gGame.isOn = false
            stopTimer()
            setSmiley('lose')
            alert('Game Over')
        }
        return
    }

    cell.isRevealed = true
    gGame.revealedCount++
    if (cell.minesAroundCount === 0) expandReveal(gBoard, i, j)

    renderBoard(gBoard)
    checkGameOver()
}


//function onCellMarked(event, elCell, i, j) {
// if (!gGame.isOn) return
//var cell = gBoard[i][j]
//if (cell.isRevealed) return
//cell.isMarked = !cell.isMarked
//gGame.markedCount += cell.isMarked ? 1 : -1

//renderBoard(gBoard)
//checkGameOver()
//}

function checkGameOver() {
    var totalCells = gLevel.SIZE * gLevel.SIZE
    var nonMines = totalCells - gLevel.MINES
    if (gGame.revealedCount === nonMines && gGame.markedCount === gLevel.MINES) {
        gGame.isOn = false
        stopTimer()
        updateBestScoreIfNeeded()
        setSmiley('win')
        alert('You Win!')
    }
}

function expandReveal(board, row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === row && j === col) continue

            var neighbor = board[i][j]
            if (neighbor.isMine || neighbor.isMarked || neighbor.isRevealed) continue

            neighbor.isRevealed = true
            gGame.revealedCount++
            if (neighbor.minesAroundCount === 0) {
                expandReveal(board, i, j)
            }
        }
    }
}

function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function renderLives() {
    var str = ' '
    for (var i = 0; i < gGame.lives; i++) str += '❤️'
    document.querySelector('.lives').innerText = str
}

function onCellRightClick(ev, i, j) {
    ev.preventDefault()

    console.log('RIGHT CLICK', i, j)

    if (!gGame.isOn) return false

    var cell = gBoard[i][j]
    if (cell.isRevealed) return false

    cell.isMarked = !cell.isMarked
    gGame.markedCount += cell.isMarked ? 1 : -1

    renderBoard(gBoard)
    checkGameOver()

    return false
}

function setSmiley(state) {
    var elSmiley = document.querySelector('.smiley')

    if (state === 'normal') elSmiley.innerText = '😃'
    else if (state === 'lose') elSmiley.innerText = '🤯'
    else if (state === 'win') elSmiley.innerText = '😎'
}

function onSmileyClick() {
    onInit()
}


function useHint(i, j) {
    gHintIdCounter++
    var myHintId = gHintIdCounter

    gIsHintMode = false

    gHintsLeft--
    renderHints()


    var changed = []

    for (var r = i - 1; r <= i + 1; r++) {
        if (r < 0 || r >= gBoard.length) continue
        for (var c = j - 1; c <= j + 1; c++) {
            if (c < 0 || c >= gBoard[0].length) continue

            var curr = gBoard[r][c]
            if (curr.isRevealed || curr.isMarked) continue

            curr.isRevealed = true
            changed.push({ r, c })
        }
    }

    renderBoard(gBoard)

    setTimeout(function () {
        if (myHintId !== gHintIdCounter) return
        for (var k = 0; k < changed.length; k++) {
            var pos = changed[k]
            gBoard[pos.r][pos.c].isRevealed = false
        }

        renderBoard(gBoard)
    }, 1500)
}

function startTimerIfNeeded() {
    if (gTimerInterval) return
    gStartTime = Date.now()
    gTimerInterval = setInterval(function () {
        gGame.secsPassed = Math.floor((Date.now() - gStartTime) / 1000)
       document.querySelector('.time-value').innerText = gGame.secsPassed
    }, 250)
}

function stopTimer() {
    if (!gTimerInterval) return
    clearInterval(gTimerInterval)
    gTimerInterval = null
}

function resetTimer() {
    stopTimer()
    gGame.secsPassed = 0
    var elTimer = document.querySelector('.timer')
    if (elTimer) elTimer.innerText = 'Time: 0'
}

function getLevelKey() {
    return `best_${gLevel.SIZE}_${gLevel.MINES}`
}

function renderBestScore() {
    var key = getLevelKey()
    var best = localStorage.getItem(key)
    document.querySelector('.best').innerText = best ? ('Best: ' + best) : 'Best: --'
}

function updateBestScoreIfNeeded() {
    var key = getLevelKey()
    var bestStr = localStorage.getItem(key)
    var best = bestStr ? +bestStr : null

    if (best === null || gGame.secsPassed < best) {
        localStorage.setItem(key, String(gGame.secsPassed))
    }
    renderBestScore()
}
function onCellRightClick(ev, i, j) {
  ev.preventDefault()
  ev.stopPropagation()   

  if (!gGame.isOn) return false

  var cell = gBoard[i][j]
  if (cell.isRevealed) return false

  cell.isMarked = !cell.isMarked
  gGame.markedCount += cell.isMarked ? 1 : -1

  renderBoard(gBoard)
  checkGameOver()

  return false
}

function toggleLevels() {
  document.querySelector('.dropdown').classList.toggle('show')
}





