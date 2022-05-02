const board = document.getElementById("board");

const allPieces = [];
let squareSelected = null;

createBoard();
const rows = document.getElementsByClassName("rows");
const squares = document.getElementsByClassName("squares");

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
    initialPositions[this.index()].append(this.element);
    this.position = initialPositions[this.index()];
  }
  attack(elementAttacked, squareToGo) {
    const pieceAttacked = allPieces.find(
      (piece) => piece.element === elementAttacked
    );
    if (pieceAttacked.team() === this.team()) {
      resetSquareSelected();
    } else if (this.isAuthorizedMove(squareToGo)) {
      const lostPiecesZone =
        pieceAttacked.team() === "white"
          ? document.querySelectorAll("div.lost-pieces-zone.white")[0]
          : document.querySelectorAll("div.lost-pieces-zone.black")[0];
      pieceAttacked.position = lostPiecesZone;
      lostPiecesZone.append(pieceAttacked.element);
      this.moveTo(squareToGo);
    }
  }
}

class Bishop extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([squares[2], squares[5], squares[58], squares[61]]);
  }
  isAuthorizedMove(squareToGo) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    return (
      Math.abs(actualPosition.row - destination.row) ===
      Math.abs(actualPosition.column - destination.column)
    );
  }
  moveTo(squareToGo) {
    if (this.isAuthorizedMove(squareToGo)) {
      squareToGo.append(this.element);
      this.position = squareToGo;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
  }
}

class King extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([squares[4], squares[60]]);
  }
  isAuthorizedMove(squareToGo) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    return (
      Math.abs(actualPosition.row - destination.row) < 2 &&
      Math.abs(actualPosition.column - destination.column) < 2
    );
  }
  moveTo(squareToGo) {
    if (this.isAuthorizedMove(squareToGo)) {
      squareToGo.append(this.element);
      this.position = squareToGo;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
  }
}

class Knight extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([squares[1], squares[6], squares[57], squares[62]]);
  }
  isAuthorizedMove(squareToGo) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    return (
      (Math.abs(actualPosition.row - destination.row) === 2 &&
        Math.abs(actualPosition.column - destination.column) === 1) ||
      (Math.abs(actualPosition.row - destination.row) === 1 &&
        Math.abs(actualPosition.column - destination.column) === 2)
    );
  }
  moveTo(squareToGo) {
    if (this.isAuthorizedMove(squareToGo)) {
      squareToGo.append(this.element);
      this.position = squareToGo;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
  }
}

class Pawn extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([
      squares[8],
      squares[9],
      squares[10],
      squares[11],
      squares[12],
      squares[13],
      squares[14],
      squares[15],
      squares[48],
      squares[49],
      squares[50],
      squares[51],
      squares[52],
      squares[53],
      squares[54],
      squares[55],
    ]);
  }
  isAuthorizedMove(squareToGo) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    return (
      ((this.team() === "white" &&
        destination.row - actualPosition.row === -1) ||
        (this.team() === "black" &&
          destination.row - actualPosition.row === 1)) &&
      destination.column === actualPosition.column
    );
  }
  moveTo(squareToGo) {
    if (this.isAuthorizedMove(squareToGo)) {
      squareToGo.append(this.element);
      this.position = squareToGo;
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
    super.resetPosition([squares[3], squares[59]]);
  }
  isAuthorizedMove(squareToGo) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    return (
      Math.abs(actualPosition.row - destination.row) ===
        Math.abs(actualPosition.column - destination.column) ||
      actualPosition.row === destination.row ||
      actualPosition.column === destination.column
    );
  }
  moveTo(squareToGo) {
    if (this.isAuthorizedMove(squareToGo)) {
      squareToGo.append(this.element);
      this.position = squareToGo;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
  }
}

class Rook extends Piece {
  constructor(element, elementsCollection) {
    super(element, elementsCollection);
  }
  resetPosition() {
    super.resetPosition([squares[0], squares[7], squares[56], squares[63]]);
  }
  isAuthorizedMove(squareToGo) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    return (
      actualPosition.row === destination.row ||
      actualPosition.column === destination.column
    );
  }
  moveTo(squareToGo) {
    if (this.isAuthorizedMove(squareToGo)) {
      squareToGo.append(this.element);
      this.position = squareToGo;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
  }
}

function createBoard() {
  const numberOfRowsAndColumns = 8;
  for (let i = 0; i < numberOfRowsAndColumns; i++) {
    const newRow = document.createElement("div");
    newRow.setAttribute("class", "rows");
    board.append(newRow);
    for (let j = 0; j < numberOfRowsAndColumns; j++) {
      const newSquare = document.createElement("div");
      newSquare.setAttribute("class", "squares");
      newSquare.addEventListener("click", handleSquareClick);
      newRow.append(newSquare);
    }
  }
}

function handleSquareClick(e) {
  const squares = document.getElementsByClassName("squares");
  if (!squareSelected && e.target.nodeName === "IMG") {
    e.target.parentNode.parentNode.classList.add("selected");
    squareSelected = e.target.parentNode.parentNode;
  } else if (squareSelected && e.target.nodeName === "IMG") {
    allPieces
      .find((piece) => piece.element === squareSelected.children[0])
      .attack(e.target.parentElement, e.target.parentElement.parentElement);
  } else if (squareSelected && e.target !== squareSelected) {
    allPieces
      .find((piece) => piece.element === squareSelected.children[0])
      .moveTo(e.target);
  } else {
    resetSquareSelected();
  }
}

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
