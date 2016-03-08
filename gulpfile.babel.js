import gulp from 'gulp';
import gulpPlumber from 'gulp-plumber';

{
  const src = 'libs/**/*.es6';
  gulp.task('lint', () => {
    const eslint = require('gulp-eslint');
    gulp.src(src)
      .pipe(eslint())
      .pipe(eslint.format())
  });
}

{
  const src = 'libs/**/*.es6';
  const dest = 'build/libs';

  gulp.task('build', () => {
    const plumber = require('gulp-plumber');
    const babel = require('gulp-babel');

    gulp.src(src)
      .pipe(plumber())
      .pipe(babel())
      .pipe(dest(dest));
  });
}

{
  const src = 'libs/**/*.es6';
  gulp.task('watch', ['lint'], () => {
    gulp.watch(src, ['lint']);
  });
}
