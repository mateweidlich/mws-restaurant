/* eslint-dev node */

const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');
const minifyJs = require('gulp-minify');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');
const connect = require('gulp-connect');

gulp.task('default', ['styles', 'scripts', 'lint', 'devserver'], () => {
	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js', ['lint', 'scripts']);
});

gulp.task('server', () => {
	connect.server({
		port: 8000
	});
});

gulp.task('devserver', () => {
	connect.server({
		port: 8000,
		livereload: true
	});
});

gulp.task('styles', () => {
	gulp
		.src(['sass/**/*.scss', '!sass/**/r-item.scss'])
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(cleanCss())
		.pipe(concat('index.min.css'))
		.pipe(gulp.dest('./css'));

	gulp
		.src(['sass/**/*.scss', '!sass/**/r-list.scss'])
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(cleanCss())
		.pipe(concat('restaurant.min.css'))
		.pipe(gulp.dest('./css'));
});

gulp.task('scripts', function () {
	gulp
		.src('js/*.js')
		.pipe(minifyJs({
			ext: {
				src: '-debug.js',
				min: '.js'
			},
			ignoreFiles: ['-min.js']
		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('lint', () => {
	return gulp
		.src(['js/**/*.js', '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});
