#!/bin/bash
echo compiling typescript...
tsc client-ts/*.ts
echo done
echo browserifying...
browserify client-ts/calendar.js -o public/js/calendar-bundle.js
browserify client-ts/main.js -o public/js/main-bundle.js
echo done
echo cleaning compiled files...
rm client-ts/*.js
echo done
