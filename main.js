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

function createPieces() {
  const pieces = [
    { name: "black-bishop", img: "./assets/black_bishop.svg", number: 2 },
    { name: "black-king", img: "./assets/black_king.svg", number: 1 },
    { name: "black-knight", img: "./assets/black_knight.svg", number: 2 },
    { name: "black-pawn", img: "./assets/black_pawn.svg", number: 8 },
    { name: "black-queen", img: "./assets/black_queen.svg", number: 1 },
    { name: "black-rook", img: "./assets/black_rook.svg", number: 2 },
    { name: "white-bishop", img: "./assets/white_bishop.svg", number: 2 },
    { name: "white-king", img: "./assets/white_king.svg", number: 1 },
    { name: "white-knight", img: "./assets/white_knight.svg", number: 2 },
    { name: "white-pawn", img: "./assets/white_pawn.svg", number: 8 },
    { name: "white-queen", img: "./assets/white_queen.svg", number: 1 },
    { name: "white-rook", img: "./assets/white_rook.svg", number: 2 },
  ];

  pieces.forEach((piece) => {
    for (let i = 0; i < piece.number; i++) {
      const newPiece = document.createElement("div");
      newPiece.setAttribute("class", "pieces " + piece.name);
      const img = document.createElement("img");
      img.setAttribute("src", piece.img);
      newPiece.append(img);
      board.append(newPiece);
    }
  });
}

createPieces();
