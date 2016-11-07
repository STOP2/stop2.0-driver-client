var gulp = require('gulp');
var shell = require('gulp-shell');
var zip = require('gulp-zip');

gulp.task('webpack', shell.task([
  'webpack'
]));

gulp.task('raspberrypi', ['webpack'], () => {
  gulp.src('./**/*')
    .pipe(zip('package.nw'))
    .pipe(gulp.dest('../nwjs'));
});

gulp.task('default', () => {
    gulp.run('webpack', 'raspberrypi');
});
