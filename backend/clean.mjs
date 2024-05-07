import dotenv from 'dotenv';
dotenv.config()

import fs from 'fs'

let SHORTLIST = []
let EXISTING = []
SHORTLIST = SHORTLIST.concat(EXISTING)

let inputFile = process.env.API_DATA_PATH;
let outputFile = inputFile.split(".").slice(0, -2).join(".") + '.cleaned.json';
var obj = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

/****** Formatting phase *******/

let techs = [".net", "agile", "airflow", "ajax", "android", "angular", "angular(js)?", "apache kafka", "apache nifi", "api", "asp.net", "asp.net mvc", "aurora", "aws", "azure", "bash", "bigquery", "bootstrap", "c(?![\\#\\+])", "c\\+\\+", "c#", "canvas", "cloud formation", "cloudformation", "cognito", "collectd", "confluence", "css", "css3", "cuda", "dart", "devops", "django", "docker", "docker compose", "docker swarm", "dynamodb", "ec2", "elastic beanstalk", "elasticsearch", "ember", "eventmachine", "express", "extjs ", "flask", "flexbox", "gcp", "git", "github", "go", "google cloud", "google dialogflow", "grafana", "graphite", "graphql", "helm", "heroku", "html", "html5", "iam", "invision", "ios", "istio", "jasmine", "java(?!script)", "javascript", "jenkins", "jest", "jira", "jms", "jquery", "junit", "jupyter", "kafka", "karma", "katalon", "kotlin", "kubernetes", "lambda", "lambda function", "less", "linux", "lodash", "logstash", "maple", "matlab", "maya", "microsoft azure", "mongodb", "mq", "ms sqlserver", "mvc", "mysql", "new relic", "nginx", "node", "node.js", "nodejs", "nosql", "nuke or houdini", "numpy", "obj-c", "objective", "opencv", "pandas", "php", "polymer", "postgres", "postgresql", "postman ", "python", "qgis", "r", "rails", "rds", "react", "redux", "rest", "rest api", "restapi", "ruby", "rust", "s3", "saas", "sass", "scala", "scikit-learn", "scikt-learn", "selenium", "snowflake", "sns", "solr", "spark", "spring", "spring boot", "springboot", "sql", "statsd", "sumo logic", "swift", "swiftui", "tensorflow", "testrail", "typescript", "underscore", "unity", "vector maps", "visual studio", "vscode", "vue", "vuex", "webforms", "websockets", "wpf", "xamarin", "xctest"]
let techdesc = { "c(?![\\#\\+])": "c", "c\\+\\+": "c++", "java(?!script)": "java", "angular(js)?": "angular" }
let techsobj = {}
techs.forEach((key, i) => techsobj[techdesc[techs[i]] ?? techs[i]] = "(\\b|\\,|\\s|\\\\|\\/|\\()" + techs[i] + "(\\b|\\,|\\s|\\\\|\\/|\\))");
let newpostings = {}

for (let id in obj) {
    let posting = obj[id]
    let formattedPosting = {}

    if (Object.keys(posting) == 0)
        continue

    if (!posting["Job Posting Information"]["Required Skills:"])
        continue


    formattedPosting.id = id
    formattedPosting.title = posting["Job Posting Information"]["Job Title:"]
    let companyInfo = posting["Company Info"] ? posting["Company Info"] : posting["Company Information"]
    formattedPosting.company = companyInfo ? companyInfo["Organization:"] : ""
    formattedPosting.location = posting["Job Posting Information"]["Job - City:"]
    formattedPosting.openings = +posting["Job Posting Information"]["Number of Job Openings:"]
    formattedPosting.term = posting["Job Posting Information"]["Work Term:"]
    formattedPosting.duration = extractText(posting["Job Posting Information"]["Work Term Duration:"], {
        "8-month": "8 month consecutive work term required",
        "8-month preferred": "8 month consecutive work term preferred",
        "4-month": "4 month work term",
        "2-term": "2 work term commitment"
    })
    formattedPosting.special = extractText(posting["Job Posting Information"]["Special Job Requirements:"], {
        "External": "directly to the employer",
        "Timezone": "recruitment timelines do not correspond to the University of Waterloo's",
        "Remote": "remote",
        "SWPP": "SWPP",
    })
    formattedPosting.remote = posting["Job Posting Information"]["Employment Location Arrangement:"]
    if (!['Remote', 'Hybrid', 'In-person'].includes(formattedPosting.remote))
        formattedPosting.remote = "Unknown"
    formattedPosting.documents = posting["Application Information"] ? extractText(posting["Application Information"]["Application Documents Required:"], {
        "Resume": "Résumé",
        "Grade": "Grades Report",
        "Cover Letter": "Cover Letter"
    }) : []
    formattedPosting.techs = extractText(posting["Job Posting Information"]["Required Skills:"], techsobj)
    formattedPosting.level = extractText(posting["Job Posting Information"]["Level:"], { "Junior": "Junior", "Intermediate": "Intermediate", "Senior": "Senior" })
    formattedPosting.summary = posting["Job Posting Information"]["Job Summary:"].replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
    formattedPosting.responsibilities = posting["Job Posting Information"]["Job Responsibilities:"].replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
    formattedPosting.skills = posting["Job Posting Information"]["Required Skills:"].replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
    formattedPosting.compensation = posting["Job Posting Information"]["Compensation and Benefits Information:"]?.replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
    formattedPosting.themes = ((arr) => (
        {
            "themes": arr.filter(x => x.startsWith("- Theme")).map(x => x.replace("- Theme -", "")),
            "degrees": arr.filter(x => !x.startsWith("- Theme"))
        }))(posting["Job Posting Information"]["Targeted Degrees and Disciplines:"] ? posting["Job Posting Information"]["Targeted Degrees and Disciplines:"].split(/\s*\n\t+\s*/).slice(1) : [])

    newpostings[id] = formattedPosting
}

function extractText(text, extract) {
    let out = []
    for (const [key, value] of Object.entries(extract)) {
        if ((new RegExp(value, "gi")).test(text)) {
            out.push(key)
        }
    }
    return out
}

/****** Pruning phase *******/

// SHORTLIST.forEach((x) => { delete newpostings[x] })

/****** Minifying phase *******/

fs.writeFileSync(outputFile, JSON.stringify(newpostings, null, ' '))
