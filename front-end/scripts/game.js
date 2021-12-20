const letters = [];
const letterElements = [];
const maxLength = 6;
let currIndex = 1;
let lettersPressed = 0;
const alpha = new Set();
localStorage.setItem('seconds', localStorage.getItem('seconds') ?? 60);

window.onload = function() {
  createDivs();
  getRandomLetters(maxLength);

  const abc = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < abc.length; i++)
    alpha.add(abc.charAt(i));


  for (let i = 0; i < maxLength; i++) {
    letterElements.push(document.getElementById(`l${i + 1}`));
  }

  // document.getElementById('l1').focus();
  letterElements[0].classList.add('selected');

  // attachKeyupListenerToInputElements();
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
  setTimeout(timer, 500);
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
  // fetch(`http://localhost:5001/generate?length=${wordLen}`).then( (response) => {
  //   response.text().then( (text) => {
  //     const regex = /[a-z]/g;
  //     const letters = text.match(regex);
  //     const div = document.getElementById("random_letters");
  //     for (let i = 0; i < letters.length; i++) {
  //       div.children[i].innerHTML = letters[i];
  //     }
  //   });
  // });
  fetch(`http://localhost:5001/game-letters`).then( (response) => {
    response.text().then( (text) => {
      const regex = /[a-z]/g;
      const letters = text.match(regex);
      const div = document.getElementById("random_letters");
      for (let i = 0; i < letters.length; i++) {
        div.children[i].innerHTML = letters[i];
      }
    });
  });
}

const updateScore = (word) => {
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
      }
    })
  })
  console.log(word);
}

const timer = () => {
  let seconds = localStorage.getItem('seconds');
  const display = ((seconds > 10) ? '0:' : '0:0') + --seconds;
  localStorage.setItem('seconds', seconds);
  if (seconds <= 10)
    document.getElementById('timer').classList.add('time-ending');
  document.getElementById('timer').innerHTML = display;
  if (seconds > 0)
    setTimeout(timer, 1000);
}

// function attachKeyupListenerToInputElements(){
//     var inputs = document.querySelectorAll('input');
//     for (var i = 0; i < inputs.length; i += 1) {
//         inputs[i].addEventListener("keyup", keyupHandler);
//     }

//     function keyupHandler(e) {

//       if (lettersPressed < maxLength) {
//         const letter = e.key;
//         console.log(letter);
//       }

//       console.log(e);
//       // const box = document.getElementById(`l${currIndex}`);
//       // console.log(`CurrIndex: ${currIndex}`);
//       // if (box.value.length == 1) {

//         // if (currIndex !== maxLength) {
//           // console.log(`CurrIndex: ${currIndex}`);
//           // document.getElementById(`l${currIndex}`).focus();
//         // }
//         // console.log(this.value);
//       // }
//   }
// }
