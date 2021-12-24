const scoring = new Map([[3, 100], [4, 400], [5,800], [6,1400], [7, 2200], [8, 3200], [9, 6400], [10, 10_000]]);

window.onload = () => {
    fetch(`${backend_website}/game_results`, {
        credentials: "include",
    }).then((data) => {
        data.json().then(data => {
          addScoreResults(data);
          makeLeaderboard(data);
        })
    })

    document.getElementById("play_again").onclick = function() {
        window.location.href = "ready.html";
    }
    document.getElementById("spectate").onclick = function() {
        // window.location.href = "spectator.html";
        changeMode("spectator", true);
    }
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



const makeLeaderboard = (data) => {
    const leaderboard = document.getElementById("leaderboard");
    data.overall.forEach((user, index) => {
        const rank = index + 1;
        const teamName = user.name;
        const score = user.score;

        const leaderboardItem = document.createElement("div");
        leaderboardItem.classList.add("leaderboard-item");

        const rankP = document.createElement("p");
        rankP.classList.add("rank");
        rankP.innerText = rank;
        leaderboardItem.appendChild(rankP);

        const teamNameP = document.createElement("p");
        teamNameP.classList.add("team-name");
        teamNameP.innerText = teamName;
        leaderboardItem.appendChild(teamNameP);

        const scoreP = document.createElement("p");
        scoreP.classList.add("score");
        scoreP.innerText = score;
        leaderboardItem.appendChild(scoreP);

        leaderboard.appendChild(leaderboardItem);
    })

}

const addScoreResults = (data) => {
  const scoreBoard = document.getElementById('score-board');

  let first = NaN;
  let second = NaN;
  let third = NaN;

  const numPodiums = data.overall.length;
  if (numPodiums >= 1)
    first = makePodium(data.first, "first", "word-list-1");
  if (numPodiums >= 2)
    second = makePodium(data.second, "second", "word-list-2");
  if (numPodiums >= 3)
    third = makePodium(data.third, "third", "word-list-3");

  let podiums = [];
  if (numPodiums >= 3) {
    podiums.push(second);
    podiums.push(first);
    podiums.push(third);
  }
  else if (numPodiums == 2) {
    podiums.push(first);
    podiums.push(second);
  }
  else if (numPodiums == 1) {
    podiums.push(first);
  }

  podiums.forEach((podium) => scoreBoard.append(podium));

  console.log(data.overall.length);
}

const makePodium = (data, place, wordListID) => {
  const podium = document.createElement('div');
  podium.classList.add('podium');
  podium.id = place;

  const name = document.createElement('p');
  name.id = 'name';
  name.innerHTML = data.name;

  const info = document.createElement('div');
  info.id = 'info';

  const scoreInfo = document.createElement('div');
  scoreInfo.id = 'score-info';

  const numWords = document.createElement('div');
  numWords.id = 'num-words';
  numWords.innerHTML = `Total Words: ${data.words.length}`;

  const score = document.createElement('div');
  score.id = 'score';
  score.innerHTML = `Score: ${data.score}`;

  const wordList = document.createElement('div');
  wordList.classList.add('word-list');
  wordList.id = wordListID;

  let playerWords = data.words;
  playerWords.sort((a, b) => b.length - a.length || a.localeCompare(b));
  playerWords.forEach((playerWord) => {
    const wordItem = document.createElement('div');
    wordItem.classList.add('word-item');

    const word = document.createElement('p');
    word.classList.add('word');
    word.innerText = playerWord;
    console.log(`PlayerWord: ${playerWord}`);

    const wordScore = document.createElement('p');
    wordScore.classList.add('word-score');
    wordScore.innerHTML = scoring.get(playerWord.length);

    wordItem.appendChild(word);
    wordItem.appendChild(wordScore);

    wordList.appendChild(wordItem);
  });

  scoreInfo.appendChild(numWords);
  scoreInfo.appendChild(score);

  info.appendChild(scoreInfo);
  info.appendChild(wordList);

  podium.appendChild(name);
  podium.appendChild(info);

  console.log(wordList);
  console.log(playerWords);

  return podium;
}