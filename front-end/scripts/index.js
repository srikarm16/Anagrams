let playClicked = false;
let spectatorClicked = false;

window.onload = function () {
  document.getElementById('play').onclick = (e) => {
    if (!playClicked && !spectatorClicked) {
      createUser(true, 'ready.html');
      e.preventDefault();
      playClicked = true;
    }
  }

  document.getElementById('spectate').onclick = (e) => {
    if (!spectatorClicked && !playClicked) {
      createUser(false, 'spectator.html');
      e.preventDefault();
      spectatorClicked = true;
    }
  }
}

const createUser = (playing, change_location) => {
    const name = document.getElementById('team_name').value;
    console.log(name);
    localStorage.setItem('teamName', name);
    const data = { name, gameMode: (playing ? "playing" : "spectating")};
    fetch(`${backend_website}/create_user`, 
    {
      method: "POST", 
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)})
      .then( (data) => {
        data.json().then( (object) => {
          console.log("NAME: ", object.name);
          window.location.href = change_location;
        });
      });
}