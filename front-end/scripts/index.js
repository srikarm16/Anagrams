window.onload = function () {
  const form = document.getElementById('enter_game_form');

  form.onsubmit = (e) => {
      const name = e.target.team_name.value;
      const type = e.target.player_type.value;
      if (type === "player") {
          localStorage.setItem('teamName', name);
          window.location.href = "ready.html";
      }
      else {
        window.location.href = 'spectator.html';
      }
      e.preventDefault();
  }
}