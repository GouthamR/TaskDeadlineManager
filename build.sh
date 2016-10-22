#!/bin/bash
cd client-ts 
echo compiling typescript...
tsc *.ts
mv nav.js ../public/js/
echo done
echo browserifying...
browserify index.js -o ../public/js/index-bundle.js
browserify calendar.js -o ../public/js/calendar-bundle.js
echo done
