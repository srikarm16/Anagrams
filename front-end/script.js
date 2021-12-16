window.onload = function() {
    const form = document.getElementById("random_letter_form");

    form.onsubmit = (e) => {
        getLetters(e.target.length.value);
        e.preventDefault();
    }

    const submissionForm = document.getElementById("submission");

    submissionForm.onsubmit = (e) => {
      displayVailidity(e.target.word.value);
      e.preventDefault();
    }
}

const getLetters = (wordLen) => {
  fetch(`http://localhost:5001/generate?length=${wordLen}`).then( (response) => {
    response.text().then( (text) => {
      document.getElementById("random_letters").innerHTML = text;
    });
  });
}

const displayVailidity = (word) => {
  fetch(`http://localhost:5001/check?word=${word}`).then( (response) => {
    response.text().then( (text) => {
      const isValid = (text == 'true');
      const display = document.getElementById("submissionDisplay");
      if (isValid) {
        display.innerHTML = "Valid Word!";
      }
      else {
        display.innerHTML = "Invalid Word!";
      }
    });
  });
}

