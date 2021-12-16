window.onload = function() {
  console.log("IS THIS EVEN RUNNING")
    const form = document.getElementById("random_letter_form");

    form.onsubmit = function(e) {
        getLetters(e.target.length.value);
        e.preventDefault();
    }
}

function getLetters(wordLen) {
  fetch(`http://localhost:5001/hello?length=${wordLen}`).then( (response) => {
    response.text().then( (text) => {
      document.getElementById("random_letters").innerHTML = text;
    });
  });
}