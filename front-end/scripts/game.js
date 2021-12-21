const letters = [];
const letterElements = [];
const maxLength = parseInt(localStorage.getItem("max_length"));
console.log(localStorage.getItem("max_length"));
let currIndex = 1;
let lettersPressed = 0;
const alpha = new Set();
localStorage.setItem('seconds', localStorage.getItem('seconds') ?? 60);

const timeRemaining = (endTime) => {
  const time = luxon.DateTime.now().until(luxon.DateTime.fromMillis(+endTime)).length('seconds');
  if (!time) {
    return 0;
  }
  return time;
}
let windowLoaded = false;
let countdownTimerStarted = true;

const countdownTimer = () => {
  let remainingTime = timeRemaining(localStorage.getItem("endTime"));
  if (windowLoaded) {
    const countdownElem = document.getElementById("countdown");
    countdownElem.innerText = Math.ceil(remainingTime - 60);
  }
  if (remainingTime > 60) {
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

countdownTimer();

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

  document.addEventListener("keydown", (e) => {
    const letter = e.key;

    if (letter === 'Backspace') {
      if (lettersPressed !== 0) {

      if (lettersPressed < maxLength) {
        letterElements[lettersPressed].classList.remove('selected');
      }

        letterElements[--lettersPressed].innerHTML = '';
        letters[lettersPressed] = '';
      }
    } else if (alpha.has(letter) && lettersPressed != maxLength) {
      letters[lettersPressed] = letter;

      if (lettersPressed < maxLength) {
        letterElements[lettersPressed].classList.remove('selected');
      }

      letterElements[lettersPressed++].innerHTML = letter;
    }
    else if (letter === "Enter") {
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
  });


  // Timer Start
  // setTimeout(timer, 5000);
  // setTimeout(timer, 500);
}

const getScore = () => {
  const score = document.getElementById("score");
  fetch("http://localhost:5001/get_score", {
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
    letter.maxLength = 1;
    letter.innerHTML = '';
    randomLetter.appendChild(letter);
    
    const guess = document.createElement('div');
    guess.id = `l${i + 1}`;
    guess.maxLength = 1;
    guessLetter.appendChild(guess);
  }
};

const getRandomLetters = (wordLen) => {
  fetch(`http://localhost:5001/game-letters`).then( (response) => {
    response.text().then( (text) => {
      const regex = /[a-z]/g;
      const letters = text.match(regex);
      const div = document.getElementById("random_letters");
      for (let i = 0; i < letters.length; i++) {
        div.children[i].innerHTML = letters[i];
      }
      if (!countdownTimerStarted) {
        const waiter = document.getElementById("loader");
        waiter.style.display = "none";
        timer();
      }
    });
  });
}

const updateScore = (word) => {
  const score = document.getElementById("score");
  const data = {
    word
  };
  fetch("http://localhost:5001/submit_word", {
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
        score.innerHTML = `Score: ${result.score}`;
      }
    })
  })
  console.log(word);
}

const timer = () => {
  const secondsRaw = timeRemaining(localStorage.getItem("endTime"));
  const seconds = Math.ceil(secondsRaw);
  let minuteHand = 0;
  if (seconds >= 60) {
    minuteHand = Math.floor(seconds / 60);
  }
  const display = minuteHand + ((seconds > 10) ? ':' : ':0') + (seconds % 60); 
  if (seconds <= 10)
    document.getElementById('timer').classList.add('time-ending');
  document.getElementById('timer').innerHTML = display;
  if (secondsRaw > 0)
    setTimeout(timer, (secondsRaw - Math.floor(secondsRaw)) * 1000);
  else {
    // stop game
    window.location.href = "end_screen.html";
  }
}