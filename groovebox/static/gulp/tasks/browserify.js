'use strict';

var config = require('../config');
var gulp = require('gulp');

function buildScript(file) {

  var bundler = browserify({
    entries: config.browserify.entries,
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  }, watchify.args);
}

gulp.task('browserify', function() {
  return buildScript(config.browserify.bundleName);  
});