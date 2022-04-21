const board = document.getElementById("board");

function createBoard() {
  const numberOfSquare = 64;
  for (let i = 0; i < numberOfSquare; i++) {
    const newSquare = document.createElement("div");
    newSquare.setAttribute("class", "square");
    board.append(newSquare);
  }
}

createBoard();
