var app = new Vue({
  el: '#app',
  data: {
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
    STATUS: STATUS,
  },
  computed: {
    filteredPostings: function () {
      return app.search == "" ? getCleaned(app.postings) : getSearch(app.postings, app.search);
    },
    Exported: function () {
      let shortliststr = ""
      let blackliststr = ""
      app.shortlist.forEach(x => shortliststr += `\t\"${x}\",\n`)
      app.blacklist.forEach(x => blackliststr += `\t\"${x}\",\n`)
      return `let SHORTLIST = [\n${shortliststr}];\n\nlet BLACKLIST = [\n${blackliststr}];`
    }
  },
  methods: {
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
        NoExternal: true,
        NoCoverLetters: true,
        FourMonthOnly: true,
        CSOnly: false,
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


typeof ENDPOINT === 'undefined' && fetchJSON()

!app.settings && app.resetSettings()
localStorage.setItem("settings", JSON.stringify(app.settings))


function getCleaned(postings) {

  let conditions = []

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

  function addCondition(cond, desc) {
    conditions.push({
      cond: cond,
      desc: desc
    })
  }
  app.settings.NoExternal && addCondition(x => !x.Special.includes("External"), "required an external application")
  app.settings.NoCoverLetters && addCondition(x => !x.Documents.includes("Cover Letter"), "did not require a cover letter")
  app.settings.FourMonthOnly && addCondition(x => x.Duration.includes("4-month"), "were not 4-month positions")
  app.settings.CSOnly && addCondition(x => filterTitle(x.Title), "were not computer science or math related")
  app.settings.NoSenior && addCondition(x => !x.Level[0].includes("Senior"), "were senior only")
  app.settings.InPersonOnly && addCondition(x => !x.Special.includes("Remote"), "were remote jobs")
  app.settings.RemoteOnly && addCondition(x => x.Special.includes("Remote"), "were not remote jobs")
  app.settings.ShortlistOnly && addCondition(x => app.shortlist.includes(x.Id), "were not shortlisted")
  app.settings.NoShortlist && addCondition(x => !app.shortlist.includes(x.Id), "were shortlisted")
  app.settings.BlacklistOnly && addCondition(x => app.blacklist.includes(x.Id), "were shortlisted")
  app.settings.NoBlacklist && addCondition(x => !app.blacklist.includes(x.Id), "were shortlisted")

  arr = postings;
  for (const [id, condition] of Object.entries(conditions)) {
    arr = arr.filter(x => { return condition.cond(x) })
  }

  return arr
}

function getSearch(postings, search) {
  search = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi")
  return postings.filter(x => search.test(x.Id) || search.test(x.Title) || search.test(x.Company) || search.test(x.Location) || search.test(x.Summary) || search.test(x.Responsibilities) || search.test(x.ReqSkills) || search.test(x.Compensation))
}