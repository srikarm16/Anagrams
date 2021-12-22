let currentState; // ready or plaing
const users = [];
const userSet = new Set();
let maxScore = 0;

const timer = () => {
  const secondsRaw = timeRemaining(localStorage.getItem("endTime"));
  const seconds = Math.ceil(secondsRaw);
  let minuteHand = 0;
  if (seconds >= 60) {
    minuteHand = Math.floor(seconds / 60);
  }
  const display = minuteHand + ((seconds >= 10) ? ':' : ':0') + (seconds % 60); 
  if (seconds <= 10)
    document.getElementById('timer').classList.add('time-ending');
  document.getElementById('timer').innerHTML = display;
  if (secondsRaw > 0)
    setTimeout(timer, (secondsRaw - Math.floor(secondsRaw)) * 1000);
}

window.onload = () => {
  const socket = io(`${backend_website}`, { transports: ['websocket'] });

  socket.on("connect", () => {
    getUsersInGame();
  });

  socket.on('user_connected', data => {
      if (currentState === "ready") {
        data.score = 0;
        console.log(data, userSet);
        if (!userSet.has(data._id)) {
          users.push(data);
          addUser(data);
        }
      }
  });

  socket.on("user_disconnected", data => {
    if (!userSet.has(data)) {
      return;
    }
    userSet.delete(data);
    let deleteIndex = -1;
    for (let i = 0; i < users.length; i++) {
      if (users[i]._id == data) {
        deleteIndex = i;
        break;
      }
    }
    if (currentState == "ready") {
      users.splice(deleteIndex, 1);
      const rankElem = document.getElementById(`${data}`);
      rankElem.remove();
    }
  })

  socket.on("game_start", (endTimeMillis) => {
    maxScore = 0;
    currentState = "playing";
    // set endTimeMillis for current game
    getServerOffset((serverOffset) => {
      localStorage.setItem("endTime", endTimeMillis - serverOffset);
      timer();
    })
  })

  socket.on("game_done", () => {
    currentState = "ready";
    localStorage.removeItem("endTime");
    // window.location.href = "end_screen.html";
  })

  socket.on("word_entered", data => {
    console.log(data);
    let index = 0;
    let dataIndex = -1;

    for (let i = 0; i < users.length; i++) {
      if (data.score < users[i].score) {
        index = i + 1;
      }

      if (users[i]._id == data._id) {
        users[i].score = data.score;
        dataIndex = i;
        break;
      }
    }

    const firstSwap = document.getElementById(data._id);
    for (let i = dataIndex - 1; i >= 0; i--) {
      // users[i + 1] or current element
      if (users[i].score < users[i + 1].score) {
        const secondSwap = document.getElementById(users[i]._id);
        firstSwap.style.order = `${i + 1}`;
        secondSwap.style.order = `${i + 2}`;

        let temp = users[i];
        users[i] = users[i + 1];
        users[i + 1] = temp;
      }
    }

    if (dataIndex === -1) {
      console.error("BIG ERROR: SHOULDN'T HAPPEN");
      return;
    }

    document.getElementById(`score${data._id}`).innerHTML = data.score;

    if (data.score > maxScore) {
      maxScore = data.score;
    }
    for (let i = 0; i < users.length; i++) {
      const progress = document.getElementById(`progress${users[i]._id}`);
      progress.style.width = `${(users[i].score/(((maxScore/1000) + 1) * 1000)) * 100}%`;
    }
  });
}

const getUsersInGame = () => {
  fetch(`${backend_website}/game_users`, {
    credentials: "include",
  }).then((data) => {
    data.json().then((object) => {
      console.log(object);
      currentState = object.gameState;
      if (currentState === "ready") {
          localStorage.removeItem("endTime");
          const timerElem = document.getElementById("timer");
          timerElem.innerText = "Waiting for users to connect";
          timerElem.classList.remove("time-ending");
      } else {
        if (!localStorage.getItem("endTime")) {
          getServerOffset((serverOffset) => {
            localStorage.setItem("endTime", endTimeMillis - serverOffset);
            timer();
          })
        } else {
          timer();
        }
      }
      Object.keys(object.users).forEach((key) => {
        const val = object.users[key];
        if (currentState === "ready") {
          val.score = 0;
        }
        users.push(val);
      });
      users.sort((a, b) => b.score - a.score)
      if (users.length !== 0) {
        maxScore = users[0].score;
      }
      users.forEach((user, index) => addUser(user, index));
    });
  })
}

const addUser = (user, index) => {
  if (userSet.has(user._id)) {
    return;
  }
  userSet.add(user._id);
  const ranking = document.getElementById('ranking');

  const rank_elem = document.createElement('div');
  rank_elem.style.order = `${index + 1}`;
  rank_elem.classList.add('rank-elem');
  rank_elem.id = user._id;

  const name = document.createElement('p');
  name.classList.add('team_name');
  name.innerText = user.name;

  const container = document.createElement('div');
  container.classList.add('container');

  const progress = document.createElement('div');
  progress.classList.add('progress');
  progress.id = `progress${user._id}`;
  progress.style.width = `${(user.score/(((maxScore/1000) + 1) * 1000)) * 100}%`;

  const score = document.createElement('div');
  score.classList.add('score');
  score.id = `score${user._id}`;
  score.innerHTML = user.score;

  container.appendChild(progress);

  rank_elem.appendChild(name);
  rank_elem.appendChild(container);
  rank_elem.appendChild(score);

  ranking.appendChild(rank_elem);
}
