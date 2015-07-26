'use strict';

/*
 * gulpfile.js
 * ===========
 * Rather than manage one giant configuration file responsible
 * for creating multiple tasks, each task has been broken out into
 * its own file in gulp/tasks. Any file in that folder gets automatically
 * required by the loop in ./gulp/index.js (required below).
 *
 * To add a new task, simply add a new task file to gulp/tasks.
 */


var fs = require('fs');
var settings = fs.existsSync('./settings.json') ? require('./settings.json') : {
  "isProd": false, "debug": true
};
global.isProd = settings.isProd;
require('./gulp');