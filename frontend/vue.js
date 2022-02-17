let settingsVersion = 1.1

var app = new Vue({
  el: '#app',
  data: {
    page: 0,
    postings: [],
    password: "",
    passwordVisible: false,
    exportOpen: false,
    status: STATUS.AUTHENTICATING,
    settingsOpen: false,
    settings: JSON.parse(localStorage.getItem("settings")),
    shortlist: JSON.parse(localStorage.getItem("shortlist")) ?? [],
    blacklist: JSON.parse(localStorage.getItem("blacklist")) ?? [],
    search: new URLSearchParams(window.location.search).has('s') ? new URLSearchParams(window.location.search).get('s') : "",
    themeAndDegreesOpen: false,
    themeOpen: false,
    degreeOpen: false,
    themesAndDegrees: {
      "themes": [],
      "degrees": [],
    },
    STATUS: STATUS,
    settingsDesc: [
      {
        "model": "NoExternal",
        "title": "No External",
        "desc": "Exclude job postings that require an external application"
      },
      {
        "model": "NoCoverLetters",
        "title": "No Cover Letters",
        "desc": "Exclude job postings that require a cover letter"
      },
      {
        "model": "FourMonthOnly",
        "title": "4 Month Only",
        "desc": "Exclude job postings that are not 4-month positions"
      },
      {
        "model": "NoSenior",
        "title": "No Senior Positions",
        "desc": "Exclude job postings that are only for senior students"
      },
      {
        "model": "NoSWPP",
        "title": "No SWPP Positions",
        "desc": "Exclude job postings that are only for Canadian students"
      },
      {
        "model": "RemoteOnly",
        "title": "Remote Only",
        "desc": "Exclude jobs postings that are not remote."
      },
      {
        "model": "InPersonOnly",
        "title": "In-person Only",
        "desc": "Exclude jobs postings that are remote"
      },
      {
        "model": "ShortlistOnly",
        "title": "Shortlist Only Mode",
        "desc": "Exclude jobs postings that are not shortlisted"
      },
      {
        "model": "NoShortlist",
        "title": "Exclude Shortlist",
        "desc": "Exclude jobs postings that are shortlisted"
      },
      {
        "model": "BlacklistOnly",
        "title": "Blacklist Only Mode",
        "desc": "Exclude jobs postings that are not blacklisted"
      },
      {
        "model": "NoBlacklist",
        "title": "Exclude Blacklist",
        "desc": "Exclude jobs postings that are blacklisted"
      },
      {
        "model": "ApplyToSearch",
        "title": "Apply To Search Results",
        "desc": "Apply filters to search results"
      },
    ]
  },
  computed: {
    filteredPostings: function () {
      return app.search == "" ? getCleaned(app.postings) : getSearch(app.postings, app.search);
    },
    Exported: function () {
      let shortliststr = ""
      let blackliststr = ""
      // app.shortlist.forEach(x => shortliststr += `\t\"${x}\",\n`)
      // app.blacklist.forEach(x => blackliststr += `\t\"${x}\",\n`)
      shortliststr = app.shortlist.join(", ")
      blackliststr = app.blacklist.join(", ")
      return `SHORTLIST: ${shortliststr}\n\nBLACKLIST: ${blackliststr}`
    }
  },
  methods: {
    makeVisible: (id, type) => {
      document.getElementById(`${type}-readmore-${id}`).classList.remove("truncate")
      document.getElementById(`${type}-readmore-${id}`).classList.remove("max-h-48")
      document.getElementById(`${type}-readmorebtn-${id}`).classList.add("hidden")
    },
    getHeight: (id, type) => {
      return document.getElementById(`${type}-readmore-${id}`).offsetHeight
    },
    UpdateURLSearch: () => {
      let queryParams = new URLSearchParams(window.location.search);
      queryParams.set("s", app.search);
      history.replaceState(null, null, "?" + queryParams.toString())
    },
    submitPassword: () => {
      app.status = STATUS.LOADING
      fetchJSON(app.password)
    },
    saveSettings: () => {
      localStorage.setItem("settings", JSON.stringify(app.settings))
    },
    resetSettings: () => {
      app.settings = {
        version: 1.1,
        themes: {},
        degrees: {},
        NoExternal: true,
        NoCoverLetters: true,
        FourMonthOnly: true,
        FourMonthOnly: false,
        NoSenior: false,
        RemoteOnly: false,
        InPersonOnly: false,
        ShortlistOnly: false,
        NoShortlist: false,
        BlacklistOnly: false,
        NoBlacklist: true,
        ApplyToSearch: false,
      };
      app.saveSettings();
    },
    saveLists: () => {
      localStorage.setItem('shortlist', JSON.stringify(app.shortlist))
      localStorage.setItem('blacklist', JSON.stringify(app.blacklist))
    }
  }
})

// Comment out the next line to use local data
// ENDPOINT = new URL('https://expitau-dev.github.io/WaterlooWorksNow/frontend/data/220101t-wwdata.json')

if (typeof ENDPOINT === 'undefined') {
  fetchJSON('')
}

if (!(app.settings?.version == settingsVersion)){
  app.resetSettings()
}

localStorage.setItem("settings", JSON.stringify(app.settings))

// Returns postings that match the set filters
function getCleaned(postings) {

  // Filters title to only match software and math jobs
  function filterTitle(title) {
    excludes = ["ios"]
    matches = ["software", "develop", "ui\\b", "\\bux\\b", "full.?stack", "back.?end", "front.?end", "programmer", "data", "machine", "linux", "\\bit\\b", "network", "qa\\b", "tutor", "game"]
    // matches = ["game"]
    for (const e of excludes) {
      if ((new RegExp(e, "gi")).test(title)) {
        return false
      }
    }
    for (const m of matches) {
      if ((new RegExp(m, "gi")).test(title)) {
        return true
      }
    }
    return false
  }

  function themesAndDegreesActive() {
    for ([theme, val] of Object.entries(app.settings.themes)) {
      if (val) {
        return true
      }
    }
    for ([degree, val] of Object.entries(app.settings.degrees)) {
      if (val) {
        return true
      }
    }
    return false;
  }

  function matchesThemesAndDegrees(x) {
    for (theme of x.TargetedClusters.themes) {
      if (app.settings.themes[theme]) {
        return true;
      }
    }
    for (degree of x.TargetedClusters.degrees) {
      if (app.settings.degrees[degree]) {
        return true;
      }
    }
    return false
  }

  // Apply filters
  [
    [app.settings.NoExternal,
    x => !x.Special.includes("External")],

    [app.settings.NoCoverLetters,
    x => !x.Documents.includes("Cover Letter")],

    [app.settings.FourMonthOnly,
    x => x.Duration.includes("4-month")],

    [app.settings.CSOnly,
    x => filterTitle(x.Title)],

    [app.settings.NoSenior,
    x => !x.Level[0].includes("Senior")],

    [app.settings.NoSWPP,
    x => !x.Special.includes("SWPP")],

    [app.settings.InPersonOnly,
    x => !x.Special.includes("Remote")],

    [app.settings.RemoteOnly,
    x => x.Special.includes("Remote")],

    [app.settings.ShortlistOnly,
    x => app.shortlist.includes(x.Id)],

    [app.settings.NoShortlist,
    x => !app.shortlist.includes(x.Id)],

    [app.settings.BlacklistOnly,
    x => app.blacklist.includes(x.Id)],

    [app.settings.NoBlacklist,
    x => !app.blacklist.includes(x.Id)],

    [themesAndDegreesActive(),
    x => matchesThemesAndDegrees(x)]

  ].forEach((x) => { x[0] && (() => { postings = postings.filter(x[1]) })() });

  return postings
}

// Get postings that match search results
function getSearch(postings, search) {
  search = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi")
  return (app.settings.ApplyToSearch ? getCleaned(postings) : postings).filter(x => search.test(x.Id) || search.test(x.Title) || search.test(x.Company) || search.test(x.Location) || search.test(x.Summary) || search.test(x.Responsibilities) || search.test(x.ReqSkills) || search.test(x.Compensation))
}