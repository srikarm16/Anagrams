let currentState; // ready or plaing
const users = [];
let maxScore = 0;

window.onload = () => {
  const socket = io("http://localhost:5001", { transports: ['websocket'] });

  socket.on("connect", () => {
    getUsersInGame();
  });

  socket.on('user_connected', data => {
      console.log(data);
      if (currentState === "ready") {
        users.push(data);
        addUser(data);
      }
  });

  socket.on("user_disconnected", data => {
    let deleteIndex = -1;
    for (let i = 0; i < users.length; i++) {
      if (users[i]._id == data) {
        deleteIndex = i;
        break;
      }
    }
    if (currentState == "ready") {
      users.splice(deleteIndex, 1);
    }
  })

  socket.on("game_start", () => {
    currentState = "playing";
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
  fetch("http://localhost:5001/game_users", {
    credentials: "include",
  }).then((data) => {
    data.json().then((object) => {
      console.log(object);
      currentState = object.gameState;
      Object.keys(object.users).forEach((key) => {
        users.push(object.users[key]);
      });
      users.sort((a, b) => b.score - a.score)
      console.log(users);
      maxScore = users[0].score;
      users.forEach((user, index) => addUser(user, index));
    });
  })
}

const addUser = (user, index) => {
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
