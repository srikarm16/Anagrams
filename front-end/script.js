let id = localStorage.getItem("userId") ?? -1;
id = parseInt(id);
let ready = false;

window.onload = function() {
    const socket = io("http://localhost:5001", { transports: ['websocket'] });
    socket.emit("connected", id);
    socket.on("your_id", data => {
      id = data;
      document.getElementById('my-user').innerHTML = `I'm User ${data}`;
      localStorage.setItem('userId', id);
      getListOfUsers();
    });

    socket.on("new_user", data => {
      addUser(data.name, data.number);
    });

    socket.on('user_disconnected', data => {
      const child = document.getElementById(`user-${data}`);
      child.parentNode.removeChild(child);
    });

    socket.on('ready_update', (data) => {
      if (data.id !== id) {
        document.getElementById(`user-${data.id}`).classList.toggle('ready');
      }
    });

    socket.on('game_start', () => {
      window.location.href = "game.html";
    });

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
      socket.emit("ready_update", ready);
    }
}

const addUser = (name, number) => {
  if (id !== -1 && number !== id) {
    let new_user = document.createElement('div');
    new_user.textContent = name;
    new_user.id = `user-${number}`;
    document.getElementById('users').appendChild(new_user);
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
      const regex = /[a-z]/g;
      const letters = text.match(regex);
      const div = document.getElementById("random_letters");
      div.innerHTML = '';
      for (let i = 0; i < letters.length; i++) {
        div.innerHTML += `<div id=letter${i + 1} class='letter'><p class='letter-info'>${letters[i]}</p></div>`;
      }
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

const getListOfUsers = () => {
  fetch(`http://localhost:5001/user_list`).then( (response) => {
    response.json().then( (object) => {
      console.log("Object: ", object);
      Object.keys(object).forEach((key) => {
        console.log(key, object[key]);
        addUser(object[key].name, object[key].number);
      });
    });
  });
}

