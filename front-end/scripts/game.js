const letters = [];
const letterElements = [];
const maxLength = 6;
let currIndex = 1;
let lettersPressed = 0;
const alpha = new Set();

window.onload = function() {
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
