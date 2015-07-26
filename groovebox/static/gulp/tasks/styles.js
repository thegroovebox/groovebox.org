'use strict';

var config = require('../config');
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function () {
  return gulp.src(config.styles.src)
    .pipe(sass({
      outputStyle: global.isProd ? 'compressed' : 'nested'
    }))
    .pipe(gulp.dest(config.styles.dest));
});