let ready = localStorage.getItem('ready') ?? false;
const allUsers = new Set();

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
  document.querySelectorAll('p').forEach((element) => element.onclick = (e) => {
    document.getElementById('lengthSelector').innerHTML = e.target.innerText;
  });

  
    const readyButton = document.getElementById("ready_button");
    const wordLength = document.getElementById("length_value");
    const spectator = document.getElementById('spectate');

    document.getElementById("my-name").innerText = `${localStorage.getItem("teamName")}`;

    const socket = io(`${backend_website}`, { transports: ['websocket'] });
    socket.on("connect", () => {
      changeMode("playing", false);
      getListOfUsers();
    });

    spectator.onclick = () => {
      socket.disconnect();
      changeMode("spectating", true);
    }

    socket.on('user_disconnected', data => {
      removeUser(data);
    });

    socket.on('user_connected', data => {
      if (data._id !== id) {
        addUser(data._id, data.name, data.ready);
      }
    });

    socket.on('ready_update', (data) => {
      localStorage.removeItem("endTime");
      if (data._id !== id) {
        const readyStatus = document.getElementById( `ready-${data._id}`);
        if (data.ready) {
          readyStatus.classList.add("ready-user");
        } else {
          readyStatus.classList.remove("ready-user");
        }
        readyStatus.innerText = data.ready ? "READY" : "NOT READY";
      }
    });

    socket.on("word_length_changed", (newWordLength) => {
      localStorage.setItem("max_length", newWordLength);
      wordLength.value = newWordLength;
    });

    socket.on('game_start', (endTimeMillis) => {
      localStorage.setItem("seconds", "60");
      getServerOffset((serverOffset) => {
        console.log(serverOffset);
        localStorage.setItem("endTime", endTimeMillis - serverOffset);
        // localStorage.setItem("endTime", endTimeMillis);
        socket.disconnect();
        window.location.href = "game.html";
      })
      // localStorage.setItem("endTime", endTimeMillis);
      // socket.disconnect();
      // window.location.href = "game.html";
    });

    wordLength.onchange = (e) => {
      socket.emit("word_length_changed", e.target.value);
    }

    readyButton.onclick = (e) => {
      updateReadyStatus(!ready);
      socket.emit("ready_update", ready);
    }
}

const addUser = (newId, name, ready) => {
  if (newId !== id && !allUsers.has(newId)) {
    allUsers.add(newId);

    const userContainer = document.createElement('div');
    userContainer.classList.add('user-container');
    userContainer.id = `user-${newId}`;

    const userNameDiv = document.createElement('div');
    userNameDiv.classList.add("user-name");
    userNameDiv.textContent = name;
    userContainer.appendChild(userNameDiv);

    const readyStatusP = document.createElement("p");
    readyStatusP.classList.add("ready-status");
    if (ready) {
      readyStatusP.classList.toggle("ready-user");
    }
    readyStatusP.id = `ready-${newId}`
    readyStatusP.innerText = ready ? "READY" : "NOT READY";
    userContainer.appendChild(readyStatusP);

    document.getElementById('users').appendChild(userContainer);
  }
}

const removeUser = (id) => {
  if (allUsers.has(id)) {
    allUsers.delete(id);
    const userElement = document.getElementById(`user-${id}`);
    userElement.remove();
  }
}

const updateReadyStatus = (newReady) => {
  const readyStatus = document.getElementById("my-ready-status");
  ready = newReady;
  const readyButton = document.getElementById("ready_button");
  readyButton.innerText = (ready) ? "Ready" : "Not Ready";
  localStorage.removeItem("endTime");
  readyStatus.innerHTML = ready ? 'READY' : 'NOT READY';
  readyStatus.classList.toggle('ready-user');
  localStorage.setItem("ready", ready);
}

const removeLoading = () => {
  document.getElementById("loading").style.display = "none";
}

const getListOfUsers = () => {
  fetch(`${backend_website}/user_list`).then( (response) => {
    response.json().then( (object) => {
      console.log(object);
      document.getElementById("length_value").value = object.wordLength;
      localStorage.setItem("max_length", object.wordLength);
      // if (object.gameState !== "ready") {
      //   if (object.gameState === "playing") {
      //     window.location.href = "game.html";
      //   } else {
      //     window.location.href = "end_screen.html";
      //   }
      // }
      const users = object.users;
      Object.keys(users).forEach((key) => {
        if (key === id) {
          updateReadyStatus(users[key].ready);
          if (!users[key].ready) {
            document.getElementById("my-ready-status").classList.toggle("ready-user");
          }
        } else if (users[key].connected) {
          addUser(key, users[key].name, users[key].ready);
        }
      });
      removeLoading();
    });
  });
}

const changeMode = (mode, should_change_location) => {
  const data = {
    gameMode: mode,
  }
  fetch(`${backend_website}/change_mode`, {
    method: "POST",
    credentials: "include",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  }).then((data) => {
    data.text().then((data) => {
      if (should_change_location)
        window.location.href = 'spectator.html';
    })
  });
}

