window.onload = function () {
  const form = document.getElementById('enter_game_form');

  document.getElementById('play').onclick = (e) => {
    createUser(true, 'ready.html');
    e.preventDefault();
  }

  document.getElementById('spectate').onclick = (e) => {
    createUser(false, 'spectator.html');
    e.preventDefault();
  }
}

const createUser = (playing, change_location) => {
    const name = document.getElementById('team_name').value;
    console.log(name);
    localStorage.setItem('teamName', name);
    const data = { name, gameMode: (playing ? "playing" : "spectating")};
    fetch("http://localhost:5001/create_user", 
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