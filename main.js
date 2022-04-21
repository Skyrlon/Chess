const board = document.getElementById("board");

function indexInClass(collection, node) {
  for (let i = 0; i < collection.length; i++) {
    if (collection[i] === node) return i;
  }
  return -1;
}

class Pawn {
  constructor(element) {
    this.element = element;
  }
  index() {
    return indexInClass(document.getElementsByClassName("pawns"), this.element);
  }
  resetPosition() {
    const squares = document.getElementsByClassName("square");
    const squareToMoveTo =
      this.index() < 8
        ? squares[this.index() + 8]
        : squares[squares.length - 1 - this.index()];
    squareToMoveTo.append(this.element);
  }
}

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
    { name: "bishops", img: "./assets/black_bishop.svg", number: 2 },
    { name: "kings", img: "./assets/black_king.svg", number: 1 },
    { name: "knights", img: "./assets/black_knight.svg", number: 2 },
    { name: "pawns", img: "./assets/black_pawn.svg", number: 8 },
    { name: "queens", img: "./assets/black_queen.svg", number: 1 },
    { name: "rooks", img: "./assets/black_rook.svg", number: 2 },
    { name: "bishops", img: "./assets/white_bishop.svg", number: 2 },
    { name: "kings", img: "./assets/white_king.svg", number: 1 },
    { name: "knights", img: "./assets/white_knight.svg", number: 2 },
    { name: "pawns", img: "./assets/white_pawn.svg", number: 8 },
    { name: "queens", img: "./assets/white_queen.svg", number: 1 },
    { name: "rooks", img: "./assets/white_rook.svg", number: 2 },
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

let pawns = [];

function placePieces() {
  const pawnsElements = document.getElementsByClassName("pawns");
  for (let i = 0; i < pawnsElements.length; i++) {
    pawns.push(new Pawn(pawnsElements[i]));
  }
  pawns.forEach((pawn) => pawn.resetPosition());
}

placePieces();
