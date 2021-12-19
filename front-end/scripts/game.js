const letters = [];
const letterElements = [];
const maxLength = 6;
let currIndex = 1;
let lettersPressed = 0;
const alpha = new Set();

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

  // attachKeyupListenerToInputElements();
  document.addEventListener("keydown", (e) => {
    const letter = e.key;

    if (letter === 'Backspace') {
      if (lettersPressed !== 0) {
        letterElements[--lettersPressed].innerHTML = '';
        letters[lettersPressed] = '';
      }
    } else if (alpha.has(letter) && lettersPressed != maxLength) {
      letters[lettersPressed] = letter;
      letterElements[lettersPressed++].innerHTML = letter;
    }
    else if (letter === "Enter") {
      let word = '';
      for (let i = 0; i < lettersPressed; i++)
        word += letters[i];

      lettersPressed = 0;
      document.getElementById('guesses').querySelectorAll('div').forEach(child => {
        child.innerHTML = '';
      });

      updateScore(word);
    }
    // document.getElementById(`l${currIndex++}`).innerHTML = letter;
  });

  // document.querySelectorAll('input').onkeyup = () => {
  //   const box = document.getElementById(`l${currentIndex}`);
  //   console.log(`CurrIndex: ${currIndex}`);
  //   if (box.value.length == 1) {

  //     if (currentIndex !== maxLength) {
  //       console.log(`CurrIndex: ${currIndex}`);
  //       currIndex++;
  //       document.getElementById(`l${currentIndex}`).focus();
  //     }
  //   }
  // }
}

const createDivs = () => {
  const randomLetter = document.getElementById('random_letters');
  const guessLetter = document.getElementById('guesses');

  for (let i = 0; i < maxLength; i++) {
    const letter = document.createElement('div');
    letter.id = `r${i + 1}`;
    letter.maxLength = 1;
    randomLetter.appendChild(letter);
    console.log(letter);
    console.log(letter.parentNode);
    
    const guess = document.createElement('div');
    guess.id = `l${i + 1}`;
    guess.maxLength = 1;
    guessLetter.appendChild(guess);
    console.log(guess);
    console.log(guess.parentNode);
  }

  console.log(randomLetter);
  console.log(guessLetter);
};

const getRandomLetters = (wordLen) => {
  fetch(`http://localhost:5001/generate?length=${wordLen}`).then( (response) => {
    response.text().then( (text) => {
      const regex = /[a-z]/g;
      const letters = text.match(regex);
      const div = document.getElementById("guesses");
      // console.log(div);
      // console.log(letters);
      div.innerHTML = '';
      for (let i = 0; i < letters.length; i++) {
        // div.children[i].innerHTML = letters[i];
      }
    });
  });
}

const updateScore = (word) => {

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
