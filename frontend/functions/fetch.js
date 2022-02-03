function fetchJSON(password = "") {
    app.status = STATUS.LOADING
    if (typeof ENDPOINT === 'undefined') {
        fetch("./data.json")
            .then(res => {
                return res.json()
            })
            .then(json => {
                for (const [key, value] of Object.entries(json)) {
                    app.postings.push(new JobPosting(key, value))
                }
                app.postings.forEach(x => {
                    x.TargetedClusters.themes.forEach(y => {
                        app.themesAndDegrees.themes.includes(y) || app.themesAndDegrees.themes.push(y)
                    });
                    x.TargetedClusters.degrees.forEach(y => {
                        app.themesAndDegrees.degrees.includes(y) || app.themesAndDegrees.degrees.push(y)
                    })
                })
                app.themesAndDegrees.themes.sort()
                app.themesAndDegrees.degrees.sort()
                app.status = STATUS.READY
            })
    } else {
        ENDPOINT.searchParams.set('pwd', password);
        let xhr = new XMLHttpRequest();
        xhr.open("GET", ENDPOINT, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                for (const [key, value] of Object.entries(json)) {
                    console.log(key, value)
                    app.postings.push(new JobPosting(key, value))
                }
                app.postings.forEach(x => {
                    x.TargetedClusters.themes.forEach(y => {
                        app.themesAndDegrees.themes.includes(y) || app.themesAndDegrees.themes.push(y)
                    });
                    x.TargetedClusters.degrees.forEach(y => {
                        app.themesAndDegrees.degrees.includes(y) || app.themesAndDegrees.degrees.push(y)
                    })
                })
                app.status = STATUS.READY
            }
            if (xhr.readyState === 4 && xhr.status === 401) {
                console.log("set auth failed")
                app.status = STATUS.AUTH_FAILED
                app.password = ""
                document.getElementById("passwordinput").focus()
            }
        };
        xhr.send();
    }
}
