const board = document.getElementById("board");

function indexInClass(collection, node) {
  for (let i = 0; i < collection.length; i++) {
    if (collection[i] === node) return i;
  }
  return -1;
}

class Piece {
  constructor(element, elementsCollection) {
    this.element = element;
    this.elementsCollection = elementsCollection;
  }
  index() {
    return indexInClass(this.elementsCollection, this.element);
  }
  resetPosition(initialPositions) {
    const squares = document.getElementsByClassName("squares");
    const squareToMoveTo = squares[initialPositions[this.index()]];
    squareToMoveTo.append(this.element);
  }
}

class Bishop extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([2, 5, 58, 61]);
  }
}

class King extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([4, 60]);
  }
}

class Knight extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([1, 6, 57, 62]);
  }
}

class Pawn extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([
      8, 9, 10, 11, 12, 13, 14, 15, 48, 49, 50, 51, 52, 53, 54, 55,
    ]);
  }
}

class Queen extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([3, 59]);
  }
}

class Rook extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([0, 7, 56, 63]);
  }
}

function createBoard() {
  const numberOfSquare = 64;
  for (let i = 0; i < numberOfSquare; i++) {
    const newSquare = document.createElement("div");
    newSquare.setAttribute("class", "squares");
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

let bishops = [];
let kings = [];
let knights = [];
let pawns = [];
let queens = [];
let rooks = [];

function placePieces() {
  const allPieces = [
    { array: bishops, classToUse: Bishop, elementsName: "bishops" },
    { array: kings, classToUse: King, elementsName: "kings" },
    { array: knights, classToUse: Knight, elementsName: "knights" },
    { array: pawns, classToUse: Pawn, elementsName: "pawns" },
    { array: queens, classToUse: Queen, elementsName: "queens" },
    { array: rooks, classToUse: Rook, elementsName: "rooks" },
  ];

  allPieces.forEach((pieces) => {
    const elements = document.getElementsByClassName(pieces.elementsName);
    for (let i = 0; i < elements.length; i++) {
      pieces.array.push(new pieces.classToUse(elements[i], elements));
    }
  });

  allPieces.forEach((pieces) => {
    pieces.array.forEach((piece) => {
      piece.resetPosition();
    });
  });
}

placePieces();
