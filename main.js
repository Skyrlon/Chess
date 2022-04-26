const board = document.getElementById("board");
const allPieces = [];
let squareSelected = null;

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
    this.position = null;
  }

  index() {
    return indexInClass(this.elementsCollection, this.element);
  }

  team() {
    return this.index() >= this.elementsCollection.length / 2
      ? "white"
      : "black";
  }

  resetPosition(initialPositions) {
    const squares = document.getElementsByClassName("squares");
    const squareToMoveTo = squares[initialPositions[this.index()]];
    squareToMoveTo.append(this.element);
    this.position = initialPositions[this.index()];
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
  moveTo(squareToGo) {
    const squares = document.getElementsByClassName("squares");
    const squarePosition = indexInClass(squares, squareToGo);
    if (
      (this.team() === "white" && squarePosition === this.position - 8) ||
      (this.team() === "black" && squarePosition === this.position + 8)
    ) {
      squareToGo.append(this.element);
      this.position = squarePosition;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
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
  moveTo(squareToGo) {
    const squares = document.getElementsByClassName("squares");
    const squarePosition = indexInClass(squares, squareToGo);
    const correctHorizontalMove =
      (squarePosition - (this.position % 8)) % 8 === 0;
    if (correctHorizontalMove) {
      squareToGo.append(this.element);
      this.position = squarePosition;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
  }
}

function createBoard() {
  const numberOfSquare = 64;
  for (let i = 0; i < numberOfSquare; i++) {
    const newSquare = document.createElement("div");
    newSquare.setAttribute("class", "squares");
    newSquare.addEventListener("click", handleSquareClick);
    newSquare.textContent = i;
    board.append(newSquare);
  }
}

function handleSquareClick(e) {
  const squares = document.getElementsByClassName("squares");
  if (!squareSelected && e.target.nodeName === "IMG") {
    e.target.parentNode.parentNode.classList.add("selected");
    squareSelected = e.target.parentNode.parentNode;
  } else if (squareSelected && e.target !== squareSelected) {
    allPieces
      .find((piece) => piece.element === squareSelected.children[0])
      .moveTo(e.target);
  } else {
    resetSquareSelected();
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

function placePieces() {
  const piecesObjects = [
    { classToUse: Bishop, name: "bishops" },
    { classToUse: King, name: "kings" },
    { classToUse: Knight, name: "knights" },
    { classToUse: Pawn, name: "pawns" },
    { classToUse: Queen, name: "queens" },
    { classToUse: Rook, name: "rooks" },
  ];

  piecesObjects.forEach((pieces) => {
    const elements = document.getElementsByClassName(pieces.name);
    for (let i = 0; i < elements.length; i++) {
      allPieces.push(new pieces.classToUse(elements[i], elements));
    }
  });

  allPieces.forEach((piece) => piece.resetPosition());
}

function resetSquareSelected() {
  squareSelected.classList.toggle("selected");
  squareSelected = null;
}

placePieces();
