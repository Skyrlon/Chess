const startButton = document.getElementById("start-button");
const playerTurnDiv = document.getElementsByClassName("player-turn")[0];
const whiteGraveyard = document.querySelectorAll(
  "div.lost-pieces-zone.white"
)[0];
const blackGraveyard = document.querySelectorAll(
  "div.lost-pieces-zone.black"
)[0];

const promotionMenu = document.getElementsByClassName("promotion-menu")[0];

const promotionPieces = document.querySelectorAll(".promotion-pieces");

startButton.addEventListener("click", function () {
  startButton.classList.add("game-started");
  whitePlayer.isTheirTurn = true;
  blackPlayer.isTheirTurn = false;
  game.statusOfTheGame = "on going";
  playerTurnDiv.classList.add("white");
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

  endOfTurn() {
    whitePlayer.isTheirTurn = !whitePlayer.isTheirTurn;
    blackPlayer.isTheirTurn = !blackPlayer.isTheirTurn;
    if (whitePlayer.isTheirTurn) {
      playerTurnDiv.classList.add("white");
      playerTurnDiv.classList.remove("black");
    } else {
      playerTurnDiv.classList.add("black");
      playerTurnDiv.classList.remove("white");
    }
    this.getStatusOfTheGame();
    resetSquareSelected();
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
    const teamPlaying = allPieces.filter(
      (piece) =>
        piece.team() ===
          [whitePlayer, blackPlayer].find((player) => player.isTheirTurn)
            .team && ![whiteGraveyard, blackGraveyard].includes(piece.position)
    );
    const allPiecesNotDead = allPieces.filter(
      (piece) => ![whiteGraveyard, blackGraveyard].includes(piece.position)
    );
    const bishopKingVsKingDraw =
      allPiecesNotDead.length === 3 &&
      allPieces.find((piece) => piece.name === "bishops");
    const knightKingVsKingDraw =
      allPiecesNotDead.length === 3 &&
      allPiecesNotDead.find((piece) => piece.name === "knights");
    const bishopKingVsBishopKingDraw =
      allPiecesNotDead.length === 4 &&
      allPiecesNotDead.find(
        (piece, index, array) =>
          piece.name === "bishops" &&
          array.find(
            (otherPiece) =>
              otherPiece.name === "bishops" &&
              otherPiece.team() !== piece.team() &&
              findSquareColor(piece.position) ===
                findSquareColor(otherPiece.position)
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
    } else if (
      !kingAttacked &&
      !teamPlaying.find(
        (piece) => piece.getAllPossibleMoves(allPieces).length > 0
      )
    ) {
      alert("Stalemate");
    } else if (
      !kingAttacked &&
      (bishopKingVsKingDraw ||
        knightKingVsKingDraw ||
        bishopKingVsBishopKingDraw)
    ) {
      alert("Impossibility of checkmate");
    }
  }

  canTeamPreventCheckMate(kingAttacked) {
    const kingAttackedTeamMates = [...allPieces].filter(
      (piece) => piece.team() === kingAttacked?.team()
    );
    const canOneTeamMateProtectKing = kingAttackedTeamMates.find((teamMate) => {
      return teamMate
        .getAllPossibleMoves(allPieces)
        .find((possibleMove) => !willKingBeAttacked(teamMate, possibleMove));
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
  constructor(element, index, teamIndex, name) {
    this.element = element;
    this.position = null;
    this.index = index;
    this.teamIndex = teamIndex;
    this.name = name;
    this.firstMove = true;
  }

  team() {
    const regex = new RegExp("white*", "g");
    return regex.test(this.element.children[0].src) ? "white" : "black";
  }

  isLegalMove(previousRequirements, squareToGo) {
    return previousRequirements && !willKingBeAttacked(this, squareToGo);
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

  attack(pieceAttacked, squareToGo, piecesPosition) {
    const lostPiecesZone =
      pieceAttacked.team() === "white" ? whiteGraveyard : blackGraveyard;
    if (pieceAttacked.team() === this.team()) {
      resetSquareSelected();
    } else if (
      this.name === "pawns" &&
      this.isAuthorizedMove(squareToGo, piecesPosition) &&
      [rows[0], rows[rows.length - 1]].includes(squareToGo.parentElement)
    ) {
      pieceAttacked.position = lostPiecesZone;
      lostPiecesZone.append(pieceAttacked.element);
      this.pawnPromotion(squareToGo, piecesPosition);
    } else if (
      !willKingBeAttacked(this, squareToGo) &&
      this.isAuthorizedMove(squareToGo, piecesPosition)
    ) {
      pieceAttacked.position = lostPiecesZone;
      lostPiecesZone.append(pieceAttacked.element);
      squareToGo.append(this.element);
      this.position = squareToGo;
      this.firstMove = false;
      game.endOfTurn();
    }
  }

  castlingMoveTo(squareToGo, piecesPosition) {
    const rooksInSameTeam = piecesPosition.filter(
      (piece) => piece.team() === this.team() && piece.name === "rooks"
    );
    const isQueensideCastling =
      indexInClass(squares, squareToGo) < indexInClass(squares, this.position);

    const rookToMove = rooksInSameTeam.find(
      (rook) => rook.teamIndex === (isQueensideCastling ? 0 : 1)
    );
    const newRookPosition =
      squares[
        indexInClass(squares, squareToGo) + (isQueensideCastling ? 1 : -1)
      ];
    squareToGo.append(this.element);
    this.position = squareToGo;
    this.firstMove = false;
    newRookPosition.append(rookToMove.element);
    rookToMove.position = newRookPosition;
    rookToMove.firstMove = false;
    game.endOfTurn();
  }

  pawnPromotion(squareToGo) {
    squareToGo.append(this.element);
    this.position = squareToGo;
    resetSquareSelected();
    promotionMenu.classList.add("show", this.team());
    promotionPieces.forEach((piece) => {
      piece.addEventListener("click", onPromotionPieceClick);
      piece.myParam = { pieceToPromote: this, squareToGo };
    });
  }

  pawnPromotionEnd(newPiece, squareToGo) {
    newPiece.position = squareToGo;
    squareToGo.append(newPiece.element);
    allPieces.push(newPiece);
    this.position = this.team() === "white" ? whiteGraveyard : blackGraveyard;
    this.position.append(this.element);
    promotionMenu.classList.remove("show", this.team());
    promotionPieces.forEach((piece) =>
      piece.removeEventListener("click", onPromotionPieceClick)
    );
    game.endOfTurn();
  }

  moveTo(squareToGo, piecesPosition) {
    if (
      this.name === "kings" &&
      this.isAuthorizedCastlingMove(squareToGo, piecesPosition)
    ) {
      this.castlingMoveTo(squareToGo, piecesPosition);
    } else if (
      this.name === "pawns" &&
      this.isAuthorizedMove(squareToGo, piecesPosition) &&
      [rows[0], rows[rows.length - 1]].includes(squareToGo.parentElement)
    ) {
      this.pawnPromotion(squareToGo, piecesPosition);
    } else if (this.isAuthorizedMove(squareToGo, piecesPosition)) {
      squareToGo.append(this.element);
      this.position = squareToGo;
      this.firstMove = false;
      game.endOfTurn();
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

    return super.isLegalMove(
      Math.abs(actualPosition.row - destination.row) ===
        Math.abs(actualPosition.column - destination.column) &&
        piecesBetween.length === 0,
      squareToGo
    );
  }
}

class King extends Piece {
  resetPosition() {
    super.resetPosition([squares[4], squares[60]]);
  }

  isAuthorizedCastlingMove(squareToGo, piecesPosition) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    const squaresBetween = [];
    for (let i = 0; i < squares.length; i++) {
      const squareColumnIndex = indexInClass(
        squares[i].parentElement.children,
        squares[i]
      );
      const squareRowIndex = indexInClass(rows, squares[i].parentElement);
      const columnRange = [actualPosition.column, destination.column].sort(
        (a, b) => a - b
      );
      if (
        destination.row === actualPosition.row &&
        squareRowIndex === actualPosition.row &&
        squareColumnIndex > columnRange[0] &&
        squareColumnIndex < columnRange[1]
      ) {
        squaresBetween.push(squares[i]);
      }
    }
    const rooksInSameTeam = piecesPosition.filter(
      (piece) => piece.team() === this.team() && piece.name === "rooks"
    );
    const queensideCastling =
      actualPosition.row === destination.row &&
      Math.abs(actualPosition.column - destination.column) === 2 &&
      actualPosition.column > destination.column &&
      rooksInSameTeam.find((rook) => rook.teamIndex === 0).firstMove;
    const kingsideCastling =
      actualPosition.row === destination.row &&
      Math.abs(actualPosition.column - destination.column) === 2 &&
      actualPosition.column < destination.column &&
      rooksInSameTeam.find((rook) => rook.teamIndex === 1).firstMove;
    const piecesBetween = squaresBetween.find((square) =>
      piecesPosition.find((piece) => piece.position === square)
    );
    const squaresBetweenAttacked = squaresBetween.find((square) =>
      piecesPosition.find(
        (piece) =>
          piece.team() !== this.team() &&
          piece.isAuthorizedMove(square, piecesPosition)
      )
    );
    return (
      (queensideCastling || kingsideCastling) &&
      !piecesBetween &&
      !squaresBetweenAttacked
    );
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

    return super.isLegalMove(
      (Math.abs(actualPosition.row - destination.row) < 2 &&
        Math.abs(actualPosition.column - destination.column) < 2) ||
        this.isAuthorizedCastlingMove(squareToGo, piecesPosition),
      squareToGo
    );
  }
}

class Knight extends Piece {
  resetPosition() {
    super.resetPosition([squares[1], squares[6], squares[57], squares[62]]);
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
    return super.isLegalMove(
      (Math.abs(actualPosition.row - destination.row) === 2 &&
        Math.abs(actualPosition.column - destination.column) === 1) ||
        (Math.abs(actualPosition.row - destination.row) === 1 &&
          Math.abs(actualPosition.column - destination.column) === 2),
      squareToGo
    );
  }
}

class Pawn extends Piece {
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
  isAuthorizedMove(squareToGo, piecesPosition) {
    const actualPosition = {
      row: indexInClass(rows, this.position.parentElement),
      column: indexInClass(this.position.parentElement.children, this.position),
    };
    const destination = {
      row: indexInClass(rows, squareToGo.parentElement),
      column: indexInClass(squareToGo.parentElement.children, squareToGo),
    };
    const positionAlreadyTakenByEnnemy = piecesPosition.find(
      (piece) => piece.team() !== this.team() && piece.position === squareToGo
    );
    const authorizedWhiteMove =
      !positionAlreadyTakenByEnnemy &&
      this.team() === "white" &&
      destination.row - actualPosition.row === -1 &&
      destination.column === actualPosition.column;
    const authorizedWhiteSpecialMove =
      !positionAlreadyTakenByEnnemy &&
      this.team() === "white" &&
      this.firstMove &&
      destination.row - actualPosition.row === -2 &&
      destination.column === actualPosition.column;
    const authorizedWhiteAttack =
      positionAlreadyTakenByEnnemy &&
      this.team() === "white" &&
      destination.row - actualPosition.row === -1 &&
      Math.abs(destination.column - actualPosition.column) === 1;
    const authorizedBlackMove =
      !positionAlreadyTakenByEnnemy &&
      this.team() === "black" &&
      destination.row - actualPosition.row === 1 &&
      destination.column === actualPosition.column;
    const authorizedBlackSpecialMove =
      !positionAlreadyTakenByEnnemy &&
      this.team() === "black" &&
      this.firstMove &&
      destination.row - actualPosition.row === 2 &&
      destination.column === actualPosition.column;
    const authorizedBlackAttack =
      positionAlreadyTakenByEnnemy &&
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
    return super.isLegalMove(
      authorizedWhiteMove ||
        (authorizedWhiteSpecialMove && piecesBetween.length === 0) ||
        authorizedWhiteAttack ||
        authorizedBlackMove ||
        (authorizedBlackSpecialMove && piecesBetween.length === 0) ||
        authorizedBlackAttack,
      squareToGo
    );
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
    return super.isLegalMove(
      piecesBetween.length === 0 &&
        (Math.abs(actualPosition.row - destination.row) ===
          Math.abs(actualPosition.column - destination.column) ||
          actualPosition.row === destination.row ||
          actualPosition.column === destination.column),
      squareToGo
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
    return super.isLegalMove(
      (actualPosition.row === destination.row ||
        actualPosition.column === destination.column) &&
        piecesBetween.length === 0,
      squareToGo
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
    allPieces
      .find((piece) => piece.position === e.currentTarget)
      .getAllPossibleMoves(allPieces).length === 0
      ? e.currentTarget.classList.add("cant-move")
      : "";
    squareSelected = e.currentTarget;
    colorPossibleMoves(
      allPieces.find((piece) => piece.position === e.currentTarget)
    );
  } else if (squareSelected && e.currentTarget === squareSelected) {
    resetSquareSelected();
  } else if (
    squareSelected &&
    allPieces.find((piece) => piece.position === e.currentTarget)
  ) {
    allPieces
      .find((piece) => piece.position === squareSelected)
      .attack(
        allPieces.find((piece) => piece.position === e.currentTarget),
        e.currentTarget,
        allPieces
      );
  } else if (squareSelected && e.currentTarget !== squareSelected) {
    allPieces
      .find((piece) => piece.position === squareSelected)
      .moveTo(e.currentTarget, allPieces);
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
    const elements = document.querySelectorAll(`.pieces.${pieces.name}`);
    for (let i = 0; i < elements.length; i++) {
      const teamIndex = i < pieces.number / 2 ? i : i - pieces.number / 2;
      allPieces.push(
        new pieces.classToUse(elements[i], i, teamIndex, pieces.name)
      );
    }
  });

  allPieces.forEach((piece) => piece.resetPosition());
}

function resetSquareSelected() {
  squareSelected?.classList.remove("selected");
  squareSelected?.classList.remove("cant-move");
  squareSelected = null;
  document
    .querySelectorAll(".possible-moves")
    .forEach((possibleMove) => possibleMove.remove());
  document.querySelectorAll(".border").forEach((border) => border.remove());
}

function colorPossibleMoves(pieceSelected) {
  for (let i = 0; i < squares.length; i++) {
    if (
      pieceSelected.isAuthorizedMove(squares[i], allPieces) &&
      !allPieces.find(
        (piece) =>
          piece.team() === pieceSelected.team() && piece.position === squares[i]
      )
    ) {
      const possibleMove = document.createElement("div");
      possibleMove.classList.add("possible-moves");
      squares[i].prepend(possibleMove);
    }
  }
  const allPossibleMovesElements = document.querySelectorAll(".possible-moves");
  if (allPossibleMovesElements.length === 0)
    pieceSelected.position.classList.add("cant-move");
  const border = document.createElement("div");
  border.classList.add("border");
  pieceSelected.position.append(border);
}

function simulateMove(pieceToModify, positionToSimulate) {
  let allPiecesWithSimulatedMove = [...allPieces].map((piece) => {
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
  allPiecesWithSimulatedMove = allPiecesWithSimulatedMove.map((piece) => {
    if (
      piece.team() !== pieceToModify.team() &&
      piece.position === positionToSimulate
    ) {
      return {
        ...piece,
        position: piece.team() === "white" ? whiteGraveyard : blackGraveyard,
        isAuthorizedMove: () => false,
      };
    }
    return piece;
  });
  return allPiecesWithSimulatedMove;
}

function willKingBeAttacked(pieceToModify, positionToSimulate) {
  return simulateMove(pieceToModify, positionToSimulate).find(
    (piece, index, array) =>
      piece.name === "kings" &&
      pieceToModify.team() === piece.team() &&
      array.find(
        (otherPiece) =>
          piece.team() !== otherPiece.team() &&
          ![whiteGraveyard, blackGraveyard].includes(otherPiece) &&
          otherPiece.isAuthorizedMove(piece.position, array)
      )
  );
}

function findSquareColor(square) {
  const index = indexInClass(squares, square);
  const rowIndex = Math.floor(index / 8);
  const isEven = (number) => number % 2 === 0;
  if (
    (isEven(index) && isEven(rowIndex)) ||
    (!isEven(rowIndex) && !isEven(index))
  ) {
    return "clear";
  } else {
    return "dark";
  }
}

function onPromotionPieceClick(e) {
  const pieces = [
    {
      name: "bishops",
      team: "black",
      classToUse: Bishop,
      img: "./assets/black_bishop.svg",
    },
    {
      name: "knights",
      team: "black",
      classToUse: Knight,
      img: "./assets/black_knight.svg",
    },
    {
      name: "queens",
      team: "black",
      classToUse: Queen,
      img: "./assets/black_queen.svg",
    },
    {
      name: "rooks",
      team: "black",
      classToUse: Rook,
      img: "./assets/black_rook.svg",
    },
    {
      name: "bishops",
      team: "white",
      classToUse: Bishop,
      img: "./assets/white_bishop.svg",
    },
    {
      name: "knights",
      team: "white",
      classToUse: Knight,
      img: "./assets/white_knight.svg",
    },
    {
      name: "queens",
      team: "white",
      classToUse: Queen,
      img: "./assets/white_queen.svg",
    },
    {
      name: "rooks",
      team: "white",
      classToUse: Rook,
      img: "./assets/white_rook.svg",
    },
  ];
  const pieceChoosen = pieces.find((piece) =>
    new RegExp(piece.img.slice(1)).test(e.currentTarget.src)
  );
  const newPiece = document.createElement("div");
  newPiece.setAttribute("class", "pieces " + pieceChoosen.name);
  const img = document.createElement("img");
  img.setAttribute("src", pieceChoosen.img);
  newPiece.append(img);
  board.append(newPiece);
  const sameNamePieces = allPieces.filter(
    (piece) => piece.name === pieceChoosen.name
  );
  const newPieceClass = new pieceChoosen.classToUse(
    newPiece,
    99,
    sameNamePieces.length,
    pieceChoosen.name
  );
  e.currentTarget.myParam.pieceToPromote.pawnPromotionEnd(
    newPieceClass,
    e.currentTarget.myParam.squareToGo
  );
}
