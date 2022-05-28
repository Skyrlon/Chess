const startButton = document.getElementById("start-button");

startButton.addEventListener("click", function () {
  startButton.classList.add("game-started");
  whitePlayer.isTheirTurn = true;
  blackPlayer.isTheirTurn = false;
  game.statusOfTheGame = "on going";
  createBoard();
  createPieces();
  placePieces();
});

const board = document.getElementById("board");
const rows = document.getElementsByClassName("rows");
const squares = document.getElementsByClassName("squares");

const allPieces = [];
let squareSelected = null;

class Game {
  constructor(statusOfTheGame) {
    this.statusOfTheGame = statusOfTheGame;
  }
  getStatusOfTheGame() {
    const kingAttacked = allPieces.find(
      (piece) =>
        piece.name === "kings" &&
        allPieces.find(
          (otherPiece) =>
            piece.team() !== otherPiece.team() &&
            !!otherPiece
              .getAllPossibleMoves(allPieces)
              .find((possibleMove) => possibleMove === piece.position)
        )
    );

    if (
      kingAttacked &&
      (kingAttacked.getAllPossibleMoves(allPieces).length > 0 ||
        this.canTeamPreventCheckMate(kingAttacked))
    ) {
      alert(`${kingAttacked.team()} king is in check`);
    } else if (
      kingAttacked &&
      kingAttacked.getAllPossibleMoves(allPieces).length === 0 &&
      !this.canTeamPreventCheckMate(kingAttacked)
    ) {
      alert(`${kingAttacked.team()} king is in checkmate`);
    }
  }

  canTeamPreventCheckMate(kingAttacked) {
    const kingAttackedTeamMates = [...allPieces].filter(
      (piece) => piece.team() === kingAttacked?.team()
    );
    const canOneTeamMateProtectKing = kingAttackedTeamMates.find((teamMate) => {
      return teamMate.getAllPossibleMoves(allPieces).find((possibleMove) => {
        const allPiecesWithSimulatedMove = [...allPieces].map((piece) => {
          const newPiece = {
            ...piece,
            team: piece.team(),
            isAuthorizedMove: (square, piecesPosition) =>
              piece.isAuthorizedMove(square, piecesPosition),
          };
          if (piece === teamMate) {
            newPiece.position = possibleMove;
          }
          return newPiece;
        });
        const foundKingAttacked = allPiecesWithSimulatedMove.find(
          (piece) =>
            piece.name === "kings" &&
            allPiecesWithSimulatedMove.find(
              (otherPiece) =>
                piece.team !== otherPiece.team &&
                otherPiece.isAuthorizedMove(
                  piece.position,
                  allPiecesWithSimulatedMove
                )
            )
        );
        return !foundKingAttacked;
      });
    });

    return canOneTeamMateProtectKing;
  }
}

class Player {
  constructor(team, isTheirTurn) {
    this.team = team;
    this.isTheirTurn = isTheirTurn;
  }
}

const game = new Game("not started");
const whitePlayer = new Player("white", true);
const blackPlayer = new Player("black", false);

function indexInClass(collection, node) {
  for (let i = 0; i < collection.length; i++) {
    if (collection[i] === node) return i;
  }
  return -1;
}

class Piece {
  constructor(element, index, numberOfPieces, name) {
    this.element = element;
    this.position = null;
    this.index = index;
    this.numberOfPieces = numberOfPieces;
    this.name = name;
  }

  team() {
    return this.index >= this.numberOfPieces / 2 ? "white" : "black";
  }

  getAllPossibleMoves(piecesPosition) {
    const allPossibleMoves = [...squares].filter((square) =>
      this.isAuthorizedMove(square, piecesPosition)
    );
    return allPossibleMoves;
  }

  resetPosition(initialPositions) {
    initialPositions[this.index].append(this.element);
    this.position = initialPositions[this.index];
  }

  attack(elementAttacked, squareToGo, piecesPosition, attacking) {
    const pieceAttacked = allPieces.find(
      (piece) => piece.element === elementAttacked
    );
    if (pieceAttacked.team() === this.team()) {
      resetSquareSelected();
    } else if (
      !willKingBeAttacked(this, squareToGo) &&
      this.isAuthorizedMove(squareToGo, piecesPosition, attacking)
    ) {
      const lostPiecesZone =
        pieceAttacked.team() === "white"
          ? document.querySelectorAll("div.lost-pieces-zone.white")[0]
          : document.querySelectorAll("div.lost-pieces-zone.black")[0];
      pieceAttacked.position = lostPiecesZone;
      lostPiecesZone.append(pieceAttacked.element);
      this.moveTo(squareToGo, piecesPosition, attacking);
    }
  }

  moveTo(squareToGo, piecesPosition, attacking) {
    if (
      !willKingBeAttacked(this, squareToGo) &&
      this.isAuthorizedMove(squareToGo, piecesPosition, attacking)
    ) {
      squareToGo.append(this.element);
      this.position = squareToGo;
      this.firstMove = false;
      resetSquareSelected();
    } else {
      resetSquareSelected();
    }
  }
}

class Bishop extends Piece {
  resetPosition() {
    super.resetPosition([squares[2], squares[5], squares[58], squares[61]]);
  }
  isAuthorizedMove(squareToGo, piecesPosition) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    const piecesBetween = [];
    for (let i = 0; i < squares.length; i++) {
      const rowRange = [actualPosition.row, destination.row].sort(
        (a, b) => a - b
      );
      const columnRange = [actualPosition.column, destination.column].sort(
        (a, b) => a - b
      );
      const squareRowIndex = indexInClass(rows, squares[i].parentElement);
      const squareColumnIndex = indexInClass(
        squares[i].parentElement.children,
        squares[i]
      );
      if (
        squareRowIndex > rowRange[0] &&
        squareRowIndex < rowRange[1] &&
        squareColumnIndex > columnRange[0] &&
        squareColumnIndex < columnRange[1] &&
        Math.abs(squareRowIndex - destination.row) ===
          Math.abs(squareColumnIndex - destination.column) &&
        piecesPosition.find((piece) => piece.position === squares[i])
      ) {
        piecesBetween.push(squares[i]);
      }
    }

    return (
      Math.abs(actualPosition.row - destination.row) ===
        Math.abs(actualPosition.column - destination.column) &&
      piecesBetween.length === 0 &&
      !allPieces.find(
        (piece) =>
          piece.element === squareToGo.children[0] &&
          piece.team() === this.team()
      )
    );
  }
}

class King extends Piece {
  resetPosition() {
    super.resetPosition([squares[4], squares[60]]);
  }
  isAuthorizedMove(squareToGo, piecesPosition) {
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
      Math.abs(actualPosition.column - destination.column) < 2 &&
      !allPieces.find(
        (piece) =>
          piece.element === squareToGo.children[0] &&
          piece.team() === this.team()
      ) &&
      !allPieces.find(
        (piece) =>
          piece.team() !== this.team() &&
          piece.isAuthorizedMove(squareToGo, piecesPosition)
      )
    );
  }
}

class Knight extends Piece {
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
      !allPieces.find(
        (piece) =>
          piece.element === squareToGo.children[0] &&
          piece.team() === this.team()
      ) &&
      ((Math.abs(actualPosition.row - destination.row) === 2 &&
        Math.abs(actualPosition.column - destination.column) === 1) ||
        (Math.abs(actualPosition.row - destination.row) === 1 &&
          Math.abs(actualPosition.column - destination.column) === 2))
    );
  }
}

class Pawn extends Piece {
  constructor(element, index, numberOfPieces, name) {
    super(element, index, numberOfPieces, name);
    this.firstMove = true;
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
  isAuthorizedMove(squareToGo, piecesPosition, attacking) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    const authorizedWhiteMove =
      !attacking &&
      this.team() === "white" &&
      destination.row - actualPosition.row === -1 &&
      destination.column === actualPosition.column;
    const authorizedWhiteSpecialMove =
      !attacking &&
      this.team() === "white" &&
      this.firstMove &&
      destination.row - actualPosition.row === -2 &&
      destination.column === actualPosition.column;
    const authorizedWhiteAttack =
      attacking &&
      this.team() === "white" &&
      destination.row - actualPosition.row === -1 &&
      Math.abs(destination.column - actualPosition.column) === 1;
    const authorizedBlackMove =
      !attacking &&
      this.team() === "black" &&
      destination.row - actualPosition.row === 1 &&
      destination.column === actualPosition.column;
    const authorizedBlackSpecialMove =
      !attacking &&
      this.team() === "black" &&
      this.firstMove &&
      destination.row - actualPosition.row === 2 &&
      destination.column === actualPosition.column;
    const authorizedBlackAttack =
      attacking &&
      this.team() === "black" &&
      destination.row - actualPosition.row === 1 &&
      Math.abs(destination.column - actualPosition.column) === 1;
    const piecesBetween = [];
    if (authorizedWhiteSpecialMove || authorizedBlackSpecialMove) {
      for (let i = 0; i < squares.length; i++) {
        const squareRowIndex = indexInClass(rows, squares[i].parentElement);
        const squareColumnIndex = indexInClass(
          squares[i].parentElement.children,
          squares[i]
        );
        const rowRange = [actualPosition.row, destination.row].sort(
          (a, b) => a - b
        );
        if (
          destination.column === actualPosition.column &&
          squareColumnIndex === actualPosition.column &&
          squareRowIndex > rowRange[0] &&
          squareRowIndex < rowRange[1] &&
          piecesPosition.find((piece) => piece.position === squares[i])
        ) {
          piecesBetween.push(squares[i]);
        }
      }
    }
    return (
      !allPieces.find(
        (piece) =>
          piece.element === squareToGo.children[0] &&
          piece.team() === this.team()
      ) &&
      (authorizedWhiteMove ||
        (authorizedWhiteSpecialMove && piecesBetween.length === 0) ||
        authorizedWhiteAttack ||
        authorizedBlackMove ||
        (authorizedBlackSpecialMove && piecesBetween.length === 0) ||
        authorizedBlackAttack)
    );
  }
  attack(elementAttacked, squareToGo, piecesPosition) {
    super.attack(elementAttacked, squareToGo, piecesPosition, true);
  }
}

class Queen extends Piece {
  resetPosition() {
    super.resetPosition([squares[3], squares[59]]);
  }
  isAuthorizedMove(squareToGo, piecesPosition) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    const piecesBetween = [];
    for (let i = 0; i < squares.length; i++) {
      const rowRange = [actualPosition.row, destination.row].sort(
        (a, b) => a - b
      );
      const columnRange = [actualPosition.column, destination.column].sort(
        (a, b) => a - b
      );
      const squareRowIndex = indexInClass(rows, squares[i].parentElement);
      const squareColumnIndex = indexInClass(
        squares[i].parentElement.children,
        squares[i]
      );
      if (
        squareRowIndex > rowRange[0] &&
        squareRowIndex < rowRange[1] &&
        squareColumnIndex > columnRange[0] &&
        squareColumnIndex < columnRange[1] &&
        Math.abs(squareRowIndex - destination.row) ===
          Math.abs(squareColumnIndex - destination.column) &&
        piecesPosition.find((piece) => piece.position === squares[i])
      ) {
        piecesBetween.push(squares[i]);
      }
      if (
        destination.row === actualPosition.row &&
        squareRowIndex === actualPosition.row &&
        squareColumnIndex > columnRange[0] &&
        squareColumnIndex < columnRange[1] &&
        piecesPosition.find((piece) => piece.position === squares[i])
      ) {
        piecesBetween.push(squares[i]);
      }
      if (
        destination.column === actualPosition.column &&
        squareColumnIndex === actualPosition.column &&
        squareRowIndex > rowRange[0] &&
        squareRowIndex < rowRange[1] &&
        piecesPosition.find((piece) => piece.position === squares[i])
      ) {
        piecesBetween.push(squares[i]);
      }
    }
    return (
      piecesBetween.length === 0 &&
      !allPieces.find(
        (piece) =>
          piece.element === squareToGo.children[0] &&
          piece.team() === this.team()
      ) &&
      (Math.abs(actualPosition.row - destination.row) ===
        Math.abs(actualPosition.column - destination.column) ||
        actualPosition.row === destination.row ||
        actualPosition.column === destination.column)
    );
  }
}

class Rook extends Piece {
  resetPosition() {
    super.resetPosition([squares[0], squares[7], squares[56], squares[63]]);
  }
  isAuthorizedMove(squareToGo, piecesPosition) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    const piecesBetween = [];
    for (let i = 0; i < squares.length; i++) {
      const squareRowIndex = indexInClass(rows, squares[i].parentElement);
      const squareColumnIndex = indexInClass(
        squares[i].parentElement.children,
        squares[i]
      );
      const rowRange = [actualPosition.row, destination.row].sort(
        (a, b) => a - b
      );
      const columnRange = [actualPosition.column, destination.column].sort(
        (a, b) => a - b
      );
      if (
        destination.row === actualPosition.row &&
        squareRowIndex === actualPosition.row &&
        squareColumnIndex > columnRange[0] &&
        squareColumnIndex < columnRange[1] &&
        piecesPosition.find((piece) => piece.position === squares[i])
      ) {
        piecesBetween.push(squares[i]);
      }
      if (
        destination.column === actualPosition.column &&
        squareColumnIndex === actualPosition.column &&
        squareRowIndex > rowRange[0] &&
        squareRowIndex < rowRange[1] &&
        piecesPosition.find((piece) => piece.position === squares[i])
      ) {
        piecesBetween.push(squares[i]);
      }
    }
    return (
      (actualPosition.row === destination.row ||
        actualPosition.column === destination.column) &&
      piecesBetween.length === 0 &&
      !allPieces.find(
        (piece) =>
          piece.element === squareToGo.children[0] &&
          piece.team() === this.team()
      )
    );
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
  if (
    !squareSelected &&
    !!allPieces.find(
      (piece) =>
        piece.position === e.currentTarget &&
        piece.team() ===
          [whitePlayer, blackPlayer].find((player) => player.isTheirTurn).team
    )
  ) {
    e.currentTarget.classList.add("selected");
    squareSelected = e.currentTarget;
    colorPossibleMoves(
      allPieces.find((piece) => piece.position === e.currentTarget)
    );
  } else if (squareSelected && e.currentTarget === squareSelected) {
    resetSquareSelected();
  } else if (squareSelected && e.target.nodeName === "IMG") {
    allPieces
      .find((piece) => piece.element === squareSelected.children[0])
      .attack(
        e.target.parentElement,
        e.target.parentElement.parentElement,
        allPieces
      );
    whitePlayer.isTheirTurn = !whitePlayer.isTheirTurn;
    blackPlayer.isTheirTurn = !blackPlayer.isTheirTurn;
    game.getStatusOfTheGame();
  } else if (squareSelected && e.target !== squareSelected) {
    allPieces
      .find((piece) => piece.element === squareSelected.children[0])
      .moveTo(e.target, allPieces);
    whitePlayer.isTheirTurn = !whitePlayer.isTheirTurn;
    blackPlayer.isTheirTurn = !blackPlayer.isTheirTurn;
    game.getStatusOfTheGame();
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

function placePieces() {
  const piecesObjects = [
    { classToUse: Bishop, name: "bishops", number: 4 },
    { classToUse: King, name: "kings", number: 2 },
    { classToUse: Knight, name: "knights", number: 4 },
    { classToUse: Pawn, name: "pawns", number: 16 },
    { classToUse: Queen, name: "queens", number: 2 },
    { classToUse: Rook, name: "rooks", number: 4 },
  ];

  piecesObjects.forEach((pieces) => {
    const elements = document.getElementsByClassName(pieces.name);
    for (let i = 0; i < elements.length; i++) {
      allPieces.push(
        new pieces.classToUse(elements[i], i, pieces.number, pieces.name)
      );
    }
  });

  allPieces.forEach((piece) => piece.resetPosition());
}

function resetSquareSelected() {
  squareSelected.classList.toggle("selected");
  squareSelected = null;
  for (let i = 0; i < squares.length; i++) {
    squares[i].classList.remove("possible-move");
  }
}

function colorPossibleMoves(piece) {
  for (let i = 0; i < squares.length; i++) {
    if (
      piece.name === "pawns" &&
      !!squares[i].children.length &&
      piece.isAuthorizedMove(squares[i], allPieces, true)
    ) {
      squares[i].classList.add("possible-move");
    } else if (
      piece.name === "pawns" &&
      !squares[i].children.length &&
      piece.isAuthorizedMove(squares[i], allPieces, false)
    ) {
      squares[i].classList.add("possible-move");
    } else if (
      piece.name !== "pawns" &&
      piece.isAuthorizedMove(squares[i], allPieces)
    ) {
      squares[i].classList.add("possible-move");
    }
  }
}

function simulateMove(pieceToModify, positionToSimulate) {
  const allPiecesWithSimulatedMove = [...allPieces].map((piece) => {
    const newPiece = {
      ...piece,
      team: () => piece.team(),
      isAuthorizedMove: (square, piecesPosition) =>
        piece.isAuthorizedMove(square, piecesPosition),
    };
    if (piece === pieceToModify) {
      newPiece.position = positionToSimulate;
    }
    return newPiece;
  });
  return allPiecesWithSimulatedMove;
}

function willKingBeAttacked(pieceToModify, positionToSimulate) {
  return simulateMove(pieceToModify, positionToSimulate).find(
    (piece, index, array) =>
      piece.name === "kings" &&
      piece.team() === pieceToModify.team() &&
      array.find(
        (ennemyPiece) =>
          ennemyPiece.team() !== piece.team() &&
          ennemyPiece.isAuthorizedMove(piece.position, array, true)
      )
  );
}
