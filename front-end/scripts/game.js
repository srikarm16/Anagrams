const letters = [];
let randomLettersMap = new Map();
let currentLettersMap = new Map();
const timerSeconds = 90;
const letterElements = [];
const randomLetterElements = [];
const maxLength = parseInt(localStorage.getItem("max_length"));
console.log(localStorage.getItem("max_length"));
let currIndex = 1;
let lettersPressed = 0;
let score = 0;
let increment = 0;
const alpha = new Set();
localStorage.setItem('seconds', localStorage.getItem('seconds') ?? 60);

let windowLoaded = false;
let countdownTimerStarted = true;

const updateEndTime = (onFinish) => {
  fetch(`${backend_website}/get_end_time`, {
    credentials: "include",
  }).then((data) => {
    data.json().then((data) => {
      if (data.state === "ready") {
        window.location.href = "ready.html";
      } else {
        getServerOffset((serverOffset) => {
          localStorage.setItem("endTime", (data.endTime - serverOffset));
        })
      }
      if (onFinish) {
        onFinish();
      }
    })
  })
}

const countdownTimer = () => {
  let remainingTime = timeRemaining(localStorage.getItem("endTime"));
  if (windowLoaded) {
    const countdownElem = document.getElementById("countdown");
    countdownElem.innerText = Math.ceil(remainingTime - timerSeconds);
  }
  if (remainingTime > timerSeconds) {
    setTimeout(countdownTimer, (remainingTime - Math.floor(remainingTime)) * 1000);
  } else {
    if (windowLoaded) {
      const waiter = document.getElementById("loader");
      waiter.style.display = "none";
      timer();
    } else {
      countdownTimerStarted = false;
    }
  }
}

if (!localStorage.getItem("endTime")) {
  updateEndTime(() => {
    countdownTimer();
  });
} else {
  countdownTimer();
}


window.onload = function() {
  windowLoaded = true;
  createDivs();
  getRandomLetters(maxLength);
  getScore();

  const abc = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < abc.length; i++)
    alpha.add(abc.charAt(i));


  for (let i = 0; i < maxLength; i++) {
    letterElements.push(document.getElementById(`l${i + 1}`));
  }

  letterElements[0].classList.add('selected');

  document.addEventListener("keydown", (e) => {keyPressed(e.key)});
}

const getScore = () => {
  const score = document.getElementById("score");
  fetch(`${backend_website}/get_score`, {
    credentials: "include",
  }).then((data) => {
    data.json().then((data) => {
      score.innerHTML = `Score: ${data.score}`;
    })
  })
}

const createDivs = () => {
  const randomLetter = document.getElementById('random_letters');
  const guessLetter = document.getElementById('guesses');

  for (let i = 0; i < maxLength; i++) {
    const letter = document.createElement('div');
    letter.id = `r${i + 1}`;
    letter.classList.add('randomLetter');
    letter.maxLength = 1;
    letter.innerHTML = '';
    randomLetter.appendChild(letter);

    letter.onclick = (e) => {
      keyPressed(e.target.innerText);
      e.preventDefault();
    }
    
    const guess = document.createElement('div');
    guess.id = `l${i + 1}`;
    guess.maxLength = 1;
    guessLetter.appendChild(guess);
  }
};

const getRandomLetters = (wordLen) => {
  fetch(`${backend_website}/game-letters`).then( (response) => {
    response.text().then( (text) => {
      const regex = /[a-z]/g;
      const letters = text.match(regex);
      const div = document.getElementById("random_letters");
      for (let i = 0; i < letters.length; i++) {
        div.children[i].innerHTML = letters[i];
        randomLetterElements[i] = div.children[i];
        let arr = randomLettersMap.get(letters[i]);
        if (!arr) {
          arr = [];
          randomLettersMap.set(letters[i], arr);
        }
        arr.push(div.children[i]);
      }
      console.log(randomLettersMap);
      if (!countdownTimerStarted) {
        const waiter = document.getElementById("loader");
        waiter.style.display = "none";
        timer();
      }
      addOnClickListeners();
    });
  });
}

const updateScore = (word) => {
  // const score = document.getElementById("score");
  const data = {
    word
  };
  fetch(`${backend_website}/submit_word`, {
    credentials: "include",
    method: "POST", 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  }).then((data) => {
    data.json().then((result) => {
      if (!result.valid) {
        console.log("Not a valid word");
      } else if (result.alreadyUsed) {
        console.log("Already used");
      } else {
        console.log("Score increased by " + result.scoreChange + " to " + result.score);
        // score.innerHTML = `Score: ${result.score}`;
        score = result.score;
        const curr = +document.getElementById("score").innerText.substring("Score: ".length);
        increment = (score - curr)/200;
        animateScoreIncrease(result.scoreChange, result.word);
      }
    })
  })
  console.log(word);
}

const animateScoreIncreaseCounter = () => {
  const target = score;
  const scoreElem = document.getElementById("score");
  let curr = +scoreElem.innerText.substring("Score: ".length);
  if (curr < target) {
    curr = Math.ceil(curr + increment);
    scoreElem.innerText = `Score: ${curr}`;
    setTimeout(animateScoreIncreaseCounter, 1);
  } else {
    curr = target;
    scoreElem.innerText = `Score: ${curr}`;
  }
}

const animateScoreIncrease = (scoreChange, word) => {
  const guesses = document.getElementById("guesses");
  const animateDiv = document.createElement("p");
  animateDiv.classList.add("score_change");
  animateDiv.innerText = `${word.toUpperCase()}(+${scoreChange})`;
  guesses.appendChild(animateDiv);
  animateScoreIncreaseCounter();
}

const keyPressed = (letter) => {
    if (letter === 'Backspace') {
      if (lettersPressed !== 0) {

        if (lettersPressed < maxLength) {
          letterElements[lettersPressed].classList.remove('selected');
        }

        currentLettersMap.set(letters[lettersPressed - 1], currentLettersMap.get(letters[lettersPressed - 1]) - 1);
        randomLettersMap.get(letters[lettersPressed - 1])[currentLettersMap.get(letters[lettersPressed - 1])].classList.remove("used_letter");

        letterElements[--lettersPressed].innerHTML = '';
        letters[lettersPressed] = '';
      }
    } else if (alpha.has(letter) && lettersPressed != maxLength) {
      const newLetterCount = (currentLettersMap.get(letter) ?? 0) + 1;
      console.log((randomLettersMap.get(letter) ?? []));
      if (newLetterCount <= (randomLettersMap.get(letter) ?? []).length) {
        currentLettersMap.set(letter, newLetterCount);
        randomLettersMap.get(letter)[newLetterCount - 1].classList.add("used_letter");
        letters[lettersPressed] = letter;

        if (lettersPressed < maxLength) {
          letterElements[lettersPressed].classList.remove('selected');
        }

        letterElements[lettersPressed++].innerHTML = letter;
      }
    }
    else if (letter === "Enter") {
      currentLettersMap.clear();
      randomLetterElements.forEach((randomLetterElement) => {
        randomLetterElement.classList.remove("used_letter");
      })
      let word = '';
      for (let i = 0; i < lettersPressed; i++)
        word += letters[i];

      lettersPressed = 0;
      document.getElementById('guesses').querySelectorAll('div').forEach(child => {

        child.classList.remove('selected');

        child.innerHTML = '';
      });
      letterElements[0].classList.add('selected');

      updateScore(word);
    }
    if (lettersPressed < maxLength) {
      letterElements[lettersPressed].classList.add("selected");
    }
}

const timer = () => {
  const secondsRaw = timeRemaining(localStorage.getItem("endTime"));
  const seconds = Math.ceil(secondsRaw);
  let minuteHand = 0;
  if (seconds >= 60) {
    minuteHand = Math.floor(seconds / 60);
  }
  const display = minuteHand + ((seconds >= 10) ? ':' : ':0') + (seconds % 60); 
  if (seconds <= 10)
    document.getElementById('timer').classList.add('time-ending');
  document.getElementById('timer').innerHTML = display;
  if (secondsRaw > 0)
    setTimeout(timer, (secondsRaw - Math.floor(secondsRaw)) * 1000);
  else {
    // stop game
    fetch(`${backend_website}/game_done`, {
      credentials: "include",
      method: "POST",
    }).then(() => {
      // window.location.href = "end_screen.html";
    });
  }
}