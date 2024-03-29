const startButton = document.querySelector(".start-button");
const playerTurnDiv = document.querySelector(".player-turn");
const whiteCheckText = document.querySelector(".white-king-attacked");
const blackCheckText = document.querySelector(".black-king-attacked");

const resultElement = document.querySelector(".result");

const resultText = document.querySelectorAll(".result-text");

const restartButton = document.querySelector(".restart");

const promotionMenu = document.querySelector(".promotion-menu");

const promotionMenuPieces = document.querySelectorAll(".promotion-menu-pieces");

const promotionMenuText = document.querySelector(".promotion-menu-text");

const promotionPieces = document.querySelectorAll(".promotion-pieces");

const frenchFlag = document.querySelector(".language-fr");
const ukFlag = document.querySelector(".language-en");

frenchFlag.addEventListener("click", handleFlagClick);

ukFlag.addEventListener("click", handleFlagClick);

function handleFlagClick(e) {
  //Find which flag was choosen and give him the "choosen" class name
  [ukFlag, frenchFlag].forEach((flag) => {
    if (e.currentTarget === flag) {
      flag.classList.add("choosen");
    } else {
      flag.classList.remove("choosen");
    }
  });
  //Extract the 2 letters from class name, which are the language name of the choosen language
  const languageChoosen = [...e.currentTarget.classList]
    .find((className) => /^language/.test(className))
    .slice(-2);
  //Find the right object which contains all texts
  const languageObjectChoosen = [en, fr].find(
    (object) => object.language === languageChoosen
  );
  localStorage.setItem("language", languageChoosen);
  loadText(languageObjectChoosen);
  document.title = languageObjectChoosen.title;
}

const en = {
  language: "en",
  title: "Chess",
  "start-button": "start",
  "player-turn-white-text": "Whites turn",
  "white-king-attacked": "White king is in check !",
  "player-turn-black-text": "Blacks turn",
  "black-king-attacked": "Black king is in check !",
  "black-checkmate": "Black king is in checkmate",
  "white-checkmate": "White king is in checkmate",
  stalemate: "Stalemate",
  "impossibility-checkmate": "Impossibility of checkmate",
  restart: "Restart",
  "promotion-menu-text": "Choose the piece that will replace the pawn",
};

const fr = {
  language: "fr",
  title: "Échecs",
  "start-button": "commencer",
  "player-turn-white-text": "Tour des blanc",
  "white-king-attacked": "Roi blanc en échec !",
  "player-turn-black-text": "Tour des noirs",
  "black-king-attacked": "Roi noir en échec !",
  "black-checkmate": "Roi noir en échec et mat",
  "white-checkmate": "Roi blanc en échec et mat",
  stalemate: "Pat",
  "impossibility-checkmate": "Impossibilité d'échec et mat",
  restart: "Recommencer",
  "promotion-menu-text": "Choisissez la pièce qui remplacera le pion",
};

if (localStorage.getItem("language")) {
  const languageSaved = localStorage.getItem("language");
  const flagToClick = document.querySelector(`.language-${languageSaved}`);
  handleFlagClick({ currentTarget: flagToClick });
} else {
  ukFlag.classList.add("choosen");
  loadText(en);
}

function loadText(languageChoosen) {
  const textsContainers = document.querySelectorAll(".lang");
  //Each object key names are the same as class name of HTML elements
  textsContainers.forEach((container) => {
    const keyWithSameNameThanTextContainerClass = Object.keys(
      languageChoosen
    ).find((keyName) => container.classList.contains(keyName));
    if (keyWithSameNameThanTextContainerClass) {
      container.textContent =
        languageChoosen[keyWithSameNameThanTextContainerClass];
    }
  });
}

startButton.addEventListener("click", function () {
  startButton.classList.add("game-started");
  whitePlayer.isTheirTurn = true;
  blackPlayer.isTheirTurn = false;
  game.onGoing = true;
  playerTurnDiv.classList.add("white");
  createBoard();
  createPieces();
  placePieces();
});

restartButton.addEventListener("click", function () {
  resultElement.classList.remove("show");
  whitePlayer.isTheirTurn = true;
  blackPlayer.isTheirTurn = false;
  game.onGoing = true;
  playerTurnDiv.classList.remove("white");
  playerTurnDiv.classList.remove("black");
  playerTurnDiv.classList.add("white");
  document.querySelectorAll(".lost-pieces").forEach((element) => {
    if (element.classList.contains("show")) {
      element.classList.remove("show");
    }
    element.querySelector(".number").textContent = "";
  });
  board.innerHTML = "";
  allPieces = [];
  createBoard();
  createPieces();
  placePieces();
});

const board = document.getElementById("board");
const rows = document.getElementsByClassName("rows");
const squares = document.getElementsByClassName("squares");

let allPieces = [];
let squareSelected = null;

class Game {
  constructor(onGoing) {
    this.onGoing = onGoing;
  }

  endOfTheGame(result) {
    //Prevent players to play
    this.onGoing = false;
    //Show result text
    resultElement.classList.add("show");
    resultText.forEach((text) => {
      if (text.classList.contains(result)) {
        text.classList.add("show");
      } else {
        text.classList.remove("show");
      }
    });
  }

  endOfTurn() {
    //Prevent current player to play and authorize other player to play
    whitePlayer.isTheirTurn = !whitePlayer.isTheirTurn;
    blackPlayer.isTheirTurn = !blackPlayer.isTheirTurn;
    //Show correct text which informs which player can play
    if (whitePlayer.isTheirTurn) {
      playerTurnDiv.classList.add("white");
      playerTurnDiv.classList.remove("black");
    } else {
      playerTurnDiv.classList.add("black");
      playerTurnDiv.classList.remove("white");
    }
    whiteCheckText.classList.remove("show");
    blackCheckText.classList.remove("show");
    //Check if the game is over or if there is a king in check
    this.getStatusOfTheGame();
    resetSquareSelected();
  }

  getStatusOfTheGame() {
    //Check if there is a king in check
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

    //Get all current player's pieces
    const teamPlaying = allPieces.filter(
      (piece) =>
        piece.team() ===
        [whitePlayer, blackPlayer].find((player) => player.isTheirTurn).team
    );

    const bishopKingVsKingDraw =
      allPieces.length === 3 &&
      allPieces.find((piece) => piece.name === "bishops");

    const knightKingVsKingDraw =
      allPieces.length === 3 &&
      allPieces.find((piece) => piece.name === "knights");

    const bishopKingVsBishopKingDraw =
      allPieces.length === 4 &&
      allPieces.find(
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
    //King in check
    if (
      kingAttacked &&
      (kingAttacked.getAllPossibleMoves(allPieces).length > 0 ||
        this.doesTeamHavePossibleMoves(kingAttacked))
    ) {
      kingAttacked.team() === "white"
        ? whiteCheckText.classList.add("show")
        : blackCheckText.classList.add("show");
    }
    //King in checkmate
    else if (
      kingAttacked &&
      kingAttacked.getAllPossibleMoves(allPieces).length === 0 &&
      !this.doesTeamHavePossibleMoves(kingAttacked)
    ) {
      this.endOfTheGame(`${kingAttacked.team()}-checkmate`);
    }
    //Stalemate
    else if (
      !kingAttacked &&
      !teamPlaying.find(
        (piece) => piece.getAllPossibleMoves(allPieces).length > 0
      )
    ) {
      this.endOfTheGame("stalemate");
    }
    //Draw because of impossibility of checkmate
    else if (
      !kingAttacked &&
      (bishopKingVsKingDraw ||
        knightKingVsKingDraw ||
        bishopKingVsBishopKingDraw)
    ) {
      this.endOfTheGame("impossibility-checkmate");
    }
  }

  doesTeamHavePossibleMoves(kingAttacked) {
    const kingAttackedTeamMates = [...allPieces].filter(
      (piece) => piece.team() === kingAttacked?.team()
    );
    const canOneTeamMateMove = kingAttackedTeamMates.find(
      (teamMate) => teamMate.getAllPossibleMoves(allPieces).length > 0
    );

    return canOneTeamMateMove;
  }
}

class Player {
  constructor(team, isTheirTurn) {
    this.team = team;
    this.isTheirTurn = isTheirTurn;
  }
}

const game = new Game(false);
const whitePlayer = new Player("white", true);
const blackPlayer = new Player("black", false);

function indexInClass(collection, node) {
  for (let i = 0; i < collection.length; i++) {
    if (collection[i] === node) return i;
  }
  return -1;
}

let deadBlackPieces = {
  team: "black",
  pieces: {
    bishops: 0,
    knights: 0,
    pawns: 0,
    queens: 0,
    rooks: 0,
  },
};
let deadWhitePieces = {
  team: "white",
  pieces: {
    bishops: 0,
    knights: 0,
    pawns: 0,
    queens: 0,
    rooks: 0,
  },
};

function putNewPieceInGraveyard(futureDeadPiece) {
  const deadPiecesObjectToModify = [deadWhitePieces, deadBlackPieces].find(
    (object) => object.team === futureDeadPiece.team()
  );
  const keyToChange = Object.keys(deadPiecesObjectToModify.pieces).find(
    (deadPiece) => futureDeadPiece.name === deadPiece
  );
  deadPiecesObjectToModify.pieces[keyToChange] =
    deadPiecesObjectToModify.pieces[keyToChange] + 1;
  const lostPieceElementToModify = document.querySelector(
    `.lost-pieces-zone.${futureDeadPiece.team()}  .${keyToChange}.${
      deadPiecesObjectToModify.team
    }`
  );
  lostPieceElementToModify.classList.add("show");
  lostPieceElementToModify.querySelector(".number").textContent =
    "x" + deadPiecesObjectToModify.pieces[keyToChange];
  futureDeadPiece.element.remove();
  allPieces = allPieces.filter((piece) => piece !== futureDeadPiece);
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

  //Check if the move does not put his king in danger
  isLegalMove(previousRequirements, squareToGo) {
    return previousRequirements && !willKingBeAttacked(this, squareToGo);
  }

  //Get all possible moves and check if they are legal and if there is no piece from the same team on them
  getAllPossibleMoves(piecesPosition) {
    const allPossibleMoves = [...squares].filter(
      (square) =>
        this.isAuthorizedMove(square, piecesPosition) &&
        !piecesPosition.find(
          (piece) => piece.team() === this.team() && square === piece.position
        )
    );
    return allPossibleMoves;
  }

  //Put the piece on its starting square
  resetPosition(initialPositions) {
    initialPositions[this.index].append(this.element);
    this.position = initialPositions[this.index];
  }

  //Handle when piece attack another
  attack(pieceAttacked, squareToGo, piecesPosition) {
    if (pieceAttacked.team() === this.team()) {
      resetSquareSelected();
    } else if (
      this.name === "pawns" &&
      this.isAuthorizedMove(squareToGo, piecesPosition) &&
      [rows[0], rows[rows.length - 1]].includes(squareToGo.parentElement)
    ) {
      putNewPieceInGraveyard(pieceAttacked);
      this.pawnPromotion(squareToGo, piecesPosition);
    } else if (
      !willKingBeAttacked(this, squareToGo) &&
      this.isAuthorizedMove(squareToGo, piecesPosition)
    ) {
      putNewPieceInGraveyard(pieceAttacked);
      squareToGo.append(this.element);
      this.position = squareToGo;
      this.firstMove = false;
      game.endOfTurn();
    }
  }

  //Handle castling special move
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

  //Show promotion menu
  pawnPromotion(squareToGo) {
    squareToGo.append(this.element);
    this.position = squareToGo;
    resetSquareSelected();
    promotionMenu.classList.add("show", this.team());
    promotionMenuPieces.forEach((piece) => piece.classList.add("show"));
    promotionMenuText.classList.add("show", this.team());
    squareToGo.append(promotionMenu);
    promotionPieces.forEach((piece) => {
      piece.addEventListener("click", onPromotionPieceClick);
      piece.myParam = { pieceToPromote: this, squareToGo };
    });
  }

  //Triggered when a piece was choosen to swap with the pawn
  pawnPromotionEnd(newPiece, squareToGo) {
    newPiece.position = squareToGo;
    squareToGo.append(newPiece.element);
    allPieces.push(newPiece);
    putNewPieceInGraveyard(this);
    promotionMenu.classList.remove("show", this.team());
    promotionMenuPieces.forEach((piece) => piece.classList.remove("show"));
    promotionMenuText.classList.remove("show", this.team());
    promotionPieces.forEach((piece) =>
      piece.removeEventListener("click", onPromotionPieceClick)
    );
    game.endOfTurn();
  }

  //Handle piece moving
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
      rooksInSameTeam.find(
        (rook) =>
          (this.team() === "black" && rook.position === squares[0]) ||
          (this.team() === "white" && rook.position === squares[56])
      )?.firstMove &&
      this.firstMove;
    const kingsideCastling =
      actualPosition.row === destination.row &&
      Math.abs(actualPosition.column - destination.column) === 2 &&
      actualPosition.column < destination.column &&
      rooksInSameTeam.find(
        (rook) =>
          (this.team() === "black" && rook.position === squares[7]) ||
          (this.team() === "white" && rook.position === squares[63])
      )?.firstMove &&
      this.firstMove;
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
    promotionMenuText.classList.contains("show") &&
    [...e.currentTarget.children].some((child) =>
      child.classList.contains("promotion-menu")
    )
  ) {
    promotionMenuPieces.forEach((piece) => piece.classList.toggle("show"));
  } else if (!game.onGoing || promotionMenuText.classList.contains("show")) {
    return;
  } else if (
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
        position: null,
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
