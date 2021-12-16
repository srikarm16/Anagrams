let ready = false;
window.onload = function() {
    const form = document.getElementById("random_letter_form");
    const submissionForm = document.getElementById("submission");
    const readyButton = document.getElementById("ready_button");

    updateReadyStatus(ready);

    form.onsubmit = (e) => {
        getLetters(e.target.length.value);
        e.preventDefault();
    }

    submissionForm.onsubmit = (e) => {
      displayVailidity(e.target.word.value);
      e.preventDefault();
    }

    readyButton.onclick = (e) => {
      ready = !ready;
      document.getElementById('ready_status').classList.toggle('ready');
      updateReadyStatus(ready);
    }
}

const updateReadyStatus = (ready) => {
  const readyStatus = document.getElementById("ready_status");
  if (ready) {
    readyStatus.innerHTML = "Ready";
  } else {
    readyStatus.innerHTML = "Not Ready";
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

