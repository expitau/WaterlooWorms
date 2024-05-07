#!/bin/bash

cd backend && npm run clean && cd ..
rm ./frontend/data/wwdata.json && cp ./backend/data/240501-wwdata.cleaned.json ./frontend/data/wwdata.json
