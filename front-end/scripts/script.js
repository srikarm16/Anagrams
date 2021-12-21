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

const getServerOffset = (onDone) => {
  let serverOffset = 0;
  var clientTimestamp = (new Date()).valueOf();
  $.getJSON(`${backend_website}/getdatetimejson/?ct=`+clientTimestamp, function( data ) {
      var nowTimeStamp = (new Date()).valueOf();
      var serverClientRequestDiffTime = data.diff;
      var serverTimestamp = data.serverTimestamp;
      var serverClientResponseDiffTime = nowTimeStamp - serverTimestamp;
      var responseTime = (serverClientRequestDiffTime - nowTimeStamp + clientTimestamp - serverClientResponseDiffTime )/2

      serverOffset = responseTime;
      console.log("server offset: ", serverOffset);
      console.log(responseTime);
      if (onDone) 
        onDone(serverOffset);
  });
  return serverOffset;
}

window.onload = function() {
    const readyButton = document.getElementById("ready_button");
    const wordLength = document.getElementById("length_value");
    const spectator = document.getElementById('spectate');

    document.getElementById("my-user").innerHTML = `I'm ${localStorage.getItem("teamName")}`;

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
      if (data._id !== id) {
        if (data.ready) {
          document.getElementById(`user-${data._id}`).classList.add("ready");
        } else {
          document.getElementById(`user-${data._id}`).classList.remove("ready");
        }
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
    let new_user = document.createElement('div');
    new_user.id = `user-${newId}`
    new_user.textContent = name;
    new_user.className = (ready ? "ready" : "");
    document.getElementById('users').appendChild(new_user);
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
  const readyStatus = document.getElementById("ready_status");
  ready = newReady;
  readyStatus.innerHTML = ready ? 'Ready' : 'Not Ready';
  readyStatus.classList.toggle('ready');
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
          if (!users[key].ready) {
            document.getElementById("ready_status").classList.toggle("ready");
          }
          updateReadyStatus(users[key].ready);
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

