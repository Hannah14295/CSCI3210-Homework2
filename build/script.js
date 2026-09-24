import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
console.log(rightGuessString);

const CORRECT_COLOR = "#9B8FE3";
const WRONG_POSITION_COLOR = "#E58BA8";
const NOT_IN_WORD_COLOR = "#9BB2C3";

//& Timer
let timeleft = 90; // user can edit
let timerInterval;
let timerStarted = false;

const timerLengthInput = document.getElementById("timer-length");

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateTimer() {
    document.getElementById("timer").textContent = `Time left: ${formatTime(timeleft)}`;
}

timerLengthInput.addEventListener("input", () => {
    if (timerStarted) {
        return
    }

    const enteredTime = timerLengthInput.valueAsNumber;

    if (Number.isNaN(enteredTime) || enteredTime < 1) {
        return
    }

    timeleft = Math.floor(enteredTime);
    updateTimer();
})

function startTimer() {
    if (timerStarted) {
        return
    }

    timerStarted = true;
    timerLengthInput.disabled = true;
    updateTimer();

    timerInterval = setInterval(() => {
        timeleft -= 1;
        updateTimer();

        if (timeleft <= 0) {
            stopTimer();
            guessesRemaining = 0;
            toastr.error("Time is up! Game over!");
            toastr.info(`The right word was: "${rightGuessString}"`);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

//& Confetti
function celebrateWin() {
    const colors = [
        "#9B8FE3",
        "#E58BA8",
        "#9BB2C3",
        "#F64A8A",
        "#C4E5FB"
    ];

    confetti({
        particleCount: 300,
        angle: 60,
        spread: 100,
        origin: {x: 0, y: 0.65},
        colors: colors
    });

    confetti({
        particleCount: 300,
        angle: 120,
        spread: 100,
        origin: {x: 1, y: 0.65},
        colors: colors
    });
}

//& Board init
function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
        
            let oldColor = elem.style.backgroundColor;
            if (oldColor === CORRECT_COLOR) {
                return;
            }

            if (oldColor === WRONG_POSITION_COLOR && color !== CORRECT_COLOR) {
                return;
            }

            elem.style.backgroundColor = color;
            break;
        }
    }
}

//& Deleting letters
function deleteLetter  () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

//& Check if guess is correct
function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let guessString = '';
    let rightGuess = Array.from(rightGuessString);

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!");
        return;
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!");
        return;
    }

    for (let i = 0; i < 5; i++) {
        let letterColor = '';
        let box = row.children[i];
        let letter = currentGuess[i];

        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = NOT_IN_WORD_COLOR;
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position
            if (currentGuess[i] === rightGuess[i]) {
                letterColor = CORRECT_COLOR;
            } else {
                letterColor = WRONG_POSITION_COLOR;
            }

            rightGuess[letterPosition] = "#";
        }

        let delay = 250 * i
        setTimeout(() => {
            // flip box
            animateCSS(box, 'flipInX');
            // shade box
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(guessString.charAt(i), letterColor);
        }, delay);
    }

    if (guessString === rightGuessString) {
        stopTimer();
        guessesRemaining = 0;
        celebrateWin();
        toastr.success(`You guessed right with ${formatTime(timeleft)} left! Game over!`);
        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            stopTimer();
            toastr.error("You've run out of guesses! Game over!");
            toastr.info(`The right word was: "${rightGuessString}"`);
        }
    }
}

//& Inserting letters
function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return;
    }

    startTimer(); 

    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

//& Adding animation
const animateCSS = (element, animation, prefix = 'animate__') =>
// We create a Promise and return it
new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty('--animate-duration', '0.3s');

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
        event.stopPropagation();
        node.classList.remove(`${prefix}animated`, animationName);
        resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

//& Check user input
document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return;
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
})

//& Keyboard generate input
document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return;
    }
    let key = target.textContent;

    if (key === "Del") {
        key = "Backspace";
    }

    document.dispatchEvent(new KeyboardEvent("keyup", {key: key}));
})

//! Call to init
initBoard();
updateTimer();
celebrateWin();