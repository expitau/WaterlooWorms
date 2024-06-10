#!/bin/bash

cd backend && npm run clean && cd ..
rm ./frontend/data/wwdata.json && cp ./backend/data/240601-wwdata.cleaned.json ./frontend/data/wwdata.json
