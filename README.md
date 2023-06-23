### Data last updated for S23 Cycle 2 Posting 2
**This is a hacky project that went out of scope, don't use it for production purposes**

This application uses scraped data off of Waterloo Works (A job application site) to provide a more user-friendly experience that allows for real-time search, filtering, saving/exporting, and the ability to see job descriptions without navigating to another page (which you think would be a given, but apparently not).

### Static webpage
The [statically-hosted webpage](https://expitau-dev.github.io/WaterlooWorms/) is available on GitHub, and uses strictly client-side data and has no authentication. The data available here pulls from `frontend/data/wwdata.json`. 

### Running locally
The frontend can also run locally via Docker or any static web server (such as Nginx, VSCode Live Server, etc). Clone the repository, and run `docker compose up frontend` in the root directory. The site will be available at `localhost:8080`.

### Scraper
The scraper can be run with `npm run scrape && npm run clean`. Be sure to set environment variables and initialize a data file first
```bash
cd backend

echo "API_PASSWORD=apipassword" >> .env
echo "API_DATA_PATH=./data/wwdata.raw.json" >> .env
echo "WW_USERNAME=myemail@uwaterloo.ca" >> .env
echo "WW_PASSWORD=mypassword123" >> .env
echo "{}" >> data/wwdata.raw.json

npm run scrape
npm run clean
cp data/wwdata.cleaned.json ../frontend/data/wwdata.json
```

| Vue | Tailwind | Docker | REST APIs | Javascript | Node | Express
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
