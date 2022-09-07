function extractText(text, extract) {
    let out = []
    for (const [key, value] of Object.entries(extract)) {
        if ((new RegExp(value, "gi")).test(text)) {
            out.push(key)
        }
    }
    return out
}

class JobPosting {
    constructor(id, data) {
        this.Id = id
        this.Title = data["Job Posting Information"]["Job Title:"]
        this.Company = data["Company Info"] ? data["Company Info"]["Organization:"] : data["Company Information"]["Organization:"]
        this.Location = data["Job Posting Information"]["Job - City:"]
        this.Openings = +data["Job Posting Information"]["Number of Job Openings:"]
        this.Term = data["Job Posting Information"]["Work Term:"]
        this.Duration = extractText(data["Job Posting Information"]["Work Term Duration:"], {
            "8-month": "8 month consecutive work term required",
            "8-month preferred": "8 month consecutive work term preferred",
            "4-month": "4 month work term",
            "2-term": "2 work term commitment"
        })
        this.Special = extractText(data["Job Posting Information"]["Special Job Requirements:"], {
            "External": "directly to the employer",
            "Timezone": "recruitment timelines do not correspond to the University of Waterloo's",
            "Remote": "remote",
            "SWPP": "SWPP",
        })
        this.Documents = extractText(data["Application Information"]["Application Documents Required:"], {
            "Resume": "Résumé",
            "Grade": "Grades Report",
            "Cover Letter": "Cover Letter"
        })
        this.Skills = extractText(data["Job Posting Information"]["Required Skills:"], techsobj)
        this.Level = extractText(data["Job Posting Information"]["Level:"], { "Junior": "Junior", "Intermediate": "Intermediate", "Senior": "Senior" })
        this.Summary = data["Job Posting Information"]["Job Summary:"].replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
        this.Responsibilities = data["Job Posting Information"]["Job Responsibilities:"].replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
        this.ReqSkills = data["Job Posting Information"]["Required Skills:"].replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
        this.Compensation = data["Job Posting Information"]["Compensation and Benefits Information:"]?.replaceAll(" ", "").replaceAll(/\n[\n\s]+/gi, "\n");
        this.TargetedClusters = ((arr) => (
            {
                "themes": arr.filter(x => x.startsWith("- Theme")).map(x => x.replace("- Theme -","")),
                "degrees": arr.filter(x => !x.startsWith("- Theme"))
            }))(data["Job Posting Information"]["Targeted Degrees and Disciplines:"].split(/\s*\n\t+\s*/).slice(1))
    }
    toString() {
        output = ""
        output += `\n---\n`
        output += `## ${this.Title}\n`
        output += `### ${this.Id} - ${this.Company} - ${this.Location}${this.Special.includes("Remote") ? " - Remote" : ""}\n`
        if (CONSTANTS.OUTPUT_STACK && this.Skills.length > 0) {
            output += `Tech${"|".repeat(this.Skills.length)}
  ${"-|".repeat(this.Skills.length)}
  ${this.Skills.join("|")}
  `
        }
        if (CONSTANTS.OUTPUT_DESC) {
            output += `\n\n${this.Description}` + "\n"
        }
        if (CONSTANTS.OUTPUT_SKILLS) {
            output += `\n\n${this.SkillsDesc}` + "\n"
        }
        if (CONSTANTS.OUTPUT_COMPENSATION && this.Compensation != "**COMPENSATION**\n\nundefined") {
            output += `\n\n${this.Compensation}` + "\n"
        }
        return output;
    }
}
