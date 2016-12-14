#!/bin/bash
echo compiling typescript...
tsc client-ts/*.ts
echo done
echo browserifying...
browserify client-ts/index.js -o public/js/index-bundle.js
browserify client-ts/calendar.js -o public/js/calendar-bundle.js
browserify client-ts/add-task.js -o public/js/add-task-bundle.js
browserify client-ts/nav.js -o public/js/nav-bundle.js
echo done
