#!/bin/bash
cd client-ts 
echo compiling typescript...
tsc *.ts
echo done
echo browserifying...
browserify index.js -o ../public/js/index-bundle.js
browserify calendar.js -o ../public/js/calendar-bundle.js
browserify add-task.js -o ../public/js/add-task-bundle.js
browserify nav.js -o ../public/js/nav-bundle.js
echo done
