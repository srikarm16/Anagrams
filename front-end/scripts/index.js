window.onload = function () {
  const form = document.getElementById('enter_game_form');

  document.getElementById('play').onclick = (e) => {
    const name = document.getElementById('team_name').value;
    console.log(name);
    localStorage.setItem('teamName', name);
    e.preventDefault();
  }

  document.getElementById('spectate').onclick = (e) => {
    window.location.href = 'spectator.html';
    e.preventDefault();
  }
  // document.getElementById('play').click( () => {
  //   console.log(`Play Clicked: ${playClicked}`);
  //   playClicked = true;
  //   console.log(`Play Clicked: ${playClicked}`);
  // });

  // form.onsubmit = (e) => {
  //     const name = e.target.team_name.value;
  //     const type = e.target.player_type.value;
  //     console.log(e.target.player_type);
  //     console.log(`Name: ${name} Type: ${type}`);
  //     // if (type === "player") {
  //     //     localStorage.setItem('teamName', name);
  //     //     window.location.href = "ready.html";
  //     // }
  //     // else {
  //     //   window.location.href = 'spectator.html';
  //     // }
  //     e.preventDefault();
  // }
}