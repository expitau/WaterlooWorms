function handleJSON(json){
    for (const [key, value] of Object.entries(json)) {
        app.postings.push(value)
    }
    app.postings.forEach(x => {
        x.themes.themes.forEach(y => {
            app.themesAndDegrees.themes.includes(y) || app.themesAndDegrees.themes.push(y)
        });
        x.themes.degrees.forEach(y => {
            app.themesAndDegrees.degrees.includes(y) || app.themesAndDegrees.degrees.push(y)
        })
    })
    app.themesAndDegrees.themes.sort()
    app.themesAndDegrees.degrees.sort()
    app.status = STATUS.READY
}

function fetchJSON(password = "") {
    app.status = STATUS.LOADING
    if (typeof ENDPOINT === 'undefined') {
        fetch("https://expitau-dev.github.io/WaterlooWorksNow/frontend/data/wwdata.json")
            .then(res => {
                return res.json()
            })
            .then(handleJSON)
    } else {
        ENDPOINT.searchParams.set('pwd', password);
        let xhr = new XMLHttpRequest();
        xhr.open("GET", ENDPOINT, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                handleJSON(json)
            }
            if (xhr.readyState === 4 && xhr.status === 401) {
                app.status = STATUS.AUTH_FAILED
                app.password = ""
                document.getElementById("passwordinput").focus()
            }
        };
        xhr.send();
    }
}
