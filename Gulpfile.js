'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var transform = require('vinyl-transform');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var watchify = require('watchify');
var _    = require('lodash');


function createBundle(watch) {
    var opts  = {
        entries: './src/browser.js',
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [babelify]
    };

    if(watch) {
        opts = _.assign({}, watchify.args, opts);
    }

    var b = browserify(opts);

    if(watch) {
        b = watchify(b);
    }

    b.on('update', bundle);
    b.on('log', gutil.log);

    function bundle() {
      return b.bundle()
        .on('error', function(error) {
            gutil.log(error.message);
        })
        .pipe(source('app.js'))
        .pipe(buffer())
        //.pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js'));
    }

    return bundle;
}

gulp.task('js',  createBundle(false));

gulp.task('html', function() {
    return gulp
        .src('./src/index.html')
        .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['html', 'js'])

gulp.task('watch', ['html'], createBundle(true))
