var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('default', function () {
    return gulp.src('src/**/*.js')
        .pipe(babel({modules: 'amd'}))
        .pipe(gulp.dest('dist'));
});
