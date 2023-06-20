
// Open unread
javascript:(function () {
    let arr = Array.from(document.getElementsByClassName('dropdown-menu')).map(x => x.children[1].children[0]).filter(x => x.parentElement.parentElement.parentElement.parentElement.parentElement.children[3].lastElementChild.tagName == "STRONG").map(x => x.onclick);
    for(let i = 0; i < arr.length; i++){
        arr[i]();
    }
    if (arr.length > 0){
        setTimeout(() => {location.reload()}, 2000)
    }
})()

// Open n and get next
javascript:(function () {
    let n = 100;
    if (typeof window.incrementor == 'undefined') {
        window.incrementor = 0;
    }
    let arr = Array.from(document.getElementsByClassName('dropdown-menu')).map(x => x.childNodes[3].childNodes[1].onclick);
    for(let i = 0; i < n; i++){
        arr[window.incrementor]();
        window.incrementor++;
    }
    loadPostingTable('', '',  'Reverse', ''+ (+document.getElementsByClassName("active")[1].textContent.trim()+1),'advanced','', null);
    window.incrementor = 0;
})()

// Save
javascript:(function () {
    function postJSON(data){
        let url = "http://localhost:3000";
        let xhr = new XMLHttpRequest();
        xhr.open("POST",url,true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                window.close();
            }
        };
        let strjson = JSON.stringify(data);
        xhr.send(strjson);
    }

    let id = document.getElementsByClassName("dashboard-header__profile-information")[0].children[0].textContent.split("-")[0].trim();
    let outerobj = {};
    let tables = Array.from(document.getElementById("postingDiv").children).map(x => {let obj = {}; let innerobj = {}; Array.from(x.children[1].children[0].children[0].children).forEach(y => {innerobj[y.children[0].textContent.trim()] = y.children[1].textContent.trim();});  obj[x.children[0].textContent.trim()] = innerobj; return obj});
    tables.forEach(x => {
        for (const [key,value] of Object.entries(x)){
            outerobj[key] = value;
        }
    });
    let arr = {};
    arr[id] = outerobj;

    postJSON(arr);
})()