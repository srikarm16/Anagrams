let ready = localStorage.getItem('ready') ?? false;

function analyzeCookieForId(unformattedCookie) {
  const cookies = unformattedCookie.split(";");
  let id = null;
  cookies.forEach((cookie) => {
    cookie = cookie.trim();
    if (cookie.startsWith("id=")) {
      id = cookie.substring("id=".length);
    }
  });
  return id;
}

const id = analyzeCookieForId(document.cookie);
console.log(id);
if (id ==  null) {
  window.location.href = "index.html"
}

window.onload = function() {
    document.getElementById("my-user").innerHTML = `I'm ${localStorage.getItem("teamName")}`;

    const socket = io("http://localhost:5001", { transports: ['websocket'] });
    getListOfUsers();

    socket.on("new_user", data => {
      addUser(data._id, data.name, data.ready);
    });

    socket.on('user_disconnected', data => {
      removeUser(data);
    });

    socket.on('user_connected', data => {
      if (data._id !== id) {
        addUser(data._id, data.name, data.ready);
      }
    });

    socket.on('ready_update', (data) => {
      if (data._id !== id) {
        if (data.ready) {
          document.getElementById(`user-${data._id}`).classList.add("ready");
        } else {
          document.getElementById(`user-${data._id}`).classList.remove("ready");
        }
      }
    });

    socket.on('game_start', () => {
      window.location.href = "game.html";
    });

    // const form = document.getElementById("random_letter_form");
    const submissionForm = document.getElementById("submission");
    const readyButton = document.getElementById("ready_button");

    // form.onsubmit = (e) => {
    //     getLetters(e.target.length.value);
    //     e.preventDefault();
    // }

    readyButton.onclick = (e) => {
      updateReadyStatus(!ready);
      socket.emit("ready_update", ready);
    }
}

const addUser = (id, name, ready) => {
  let new_user = document.createElement('div');
  new_user.id = `user-${id}`
  new_user.textContent = name;
  new_user.className = (ready ? "ready" : "");
  document.getElementById('users').appendChild(new_user);
}

const removeUser = (id) => {
  const userElement = document.getElementById(`user-${id}`);
  userElement.remove();
}

const updateReadyStatus = (newReady) => {
  const readyStatus = document.getElementById("ready_status");
  ready = newReady;
  readyStatus.innerHTML = ready ? 'Ready' : 'Not Ready';
  readyStatus.classList.toggle('ready');
  localStorage.setItem("ready", ready);
}

// const getLetters = (wordLen) => {
//   fetch(`http://localhost:5001/generate?length=${wordLen}`).then( (response) => {
//     response.text().then( (text) => {
//       const regex = /[a-z]/g;
//       const letters = text.match(regex);
//       const div = document.getElementById("random_letters");
//       div.innerHTML = '';
//       for (let i = 0; i < letters.length; i++) {
//         div.innerHTML += `<div id=letter${i + 1} class='letter'><p class='letter-info'>${letters[i]}</p></div>`;
//       }
//     });
//   });
// }

const getListOfUsers = () => {
  fetch(`http://localhost:5001/user_list`).then( (response) => {
    response.json().then( (object) => {
      console.log("Object: ", object);
      Object.keys(object).forEach((key) => {
        if (key === id) {
          if (!object[key].ready) {
            document.getElementById("ready_status").classList.toggle("ready");
          }
          updateReadyStatus(object[key].ready);
        } else if (object[key].connected) {
          addUser(key, object[key].name, object[key].ready);
        }
      });
    });
  });
}

