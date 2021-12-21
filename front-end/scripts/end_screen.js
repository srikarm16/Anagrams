window.onload = () => {
    fetch(`${backend_website}/game_results`, {
        credentials: "include",
    }).then((data) => {
        data.json().then(data => {
            console.log(data);
        })
    })
}