var turn = 0;
var gameId = undefined;
var winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

$(document).ready(function() {
  attachListeners()
})

function player(){
  if (this.turn % 2 === 0) {
    return "X";
  } else {
    return "O";
  }
}

function updateState(position){
  $(position).text(player())
}

function setMessage(message){
  $('#message').text(message)
}

function checkWinner(){
  var board = {};
  $("td").text(function (index, square) {
    board[index] = square
  })

  return ['X', 'O'].some(function (player){
    if (winningCombos.some(function (combo) {
      return combo.every(i => board[i] === player)
    })){
      setMessage(`Player ${player} Won!`)
      return true
    } else {
      return false
    }
  })

  winningCombos.some(function (checkCombos){
  })
}

function doTurn(position){
  updateState(position)
  turn++
  if (checkWinner()){
    saveGame();
    clearBoard();
  } else if (turn === 9) {
    setMessage('Tie game.');
    saveGame();
    clearBoard();
  }
}

function saveGame() {
  const $board = $('td').map(function () { return $(this).text(); }).get();

  const gameData = { state: $board };
  if (currentGame) {
    $.ajax({
      type: 'PATCH',
      url: `/games/${currentGame}`,
      data: gameData,
    });
  } else {
    const posting = $.post('/games', gameData);
    posting.done(function (game) {
      currentGame = game.data.id;
    });
  }
}


function clearBoard(){
  turn = 0
  $('td').empty();
  gameId = undefined
}

function previousGame(){
  $.get('/games').done(function(response){
    var buttons = response.data.map(game => `<button>${game["id"]}</button>`);
    $('#games').html(buttons)
  })
  $('#games').on('click', function(event){
    $.get(`/games/${event.target.innerHTML}`).done(function (response){
      var state = response.data.attributes.state
      $('td').each(function(i, td){
        td.innerHTML = state[i]
      })
      turn = state.filter(function(t){
        return t != ""
      }).length;

      gameId = response.data.id
    })
  })
}

function attachListeners(){
  $('td').on('click', function() {
    if (!$.text(this) && !checkWinner()){
      doTurn(this)
    }
  });
  $('#save').on('click', function() {saveGame()})
  $('#previous').on('click', function() {previousGame()})
  $('#clear').on('click', function() {clearBoard()})
}
