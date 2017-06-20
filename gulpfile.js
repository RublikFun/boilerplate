/* gulpfile.js */
var gulp           = require('gulp'),
    nunjucksRender = require('gulp-nunjucks-render'),
    concat         = require('gulp-concat'),
    sass           = require('gulp-sass'),
    autoprefixer   = require('gulp-autoprefixer'),
    sourcemaps     = require('gulp-sourcemaps'),
    uglify         = require('gulp-uglify'),
    changed        = require('gulp-changed'),
	imagemin       = require('gulp-imagemin'),
	notify         = require('gulp-notify'),
	plumber        = require('gulp-plumber'),
	stripDebug     = require('gulp-strip-debug'),
    http           = require('http'),
    cssnano        = require('gulp-cssnano'),
    del            = require('del'),
    livereload     = require('browser-sync');

    // Gulp plumber error handler
    var onError = function(err) {
    	console.log(err);
    }

    var PATHS = {
        devDir    : 'src',
        output    : 'dist',
        templates : 'src/templates',
        pages     : 'src/pages',
    }

    // Lets us type "gulp" on the command line and run all of our tasks
    gulp.task('default', ['browser-sync', 'html', 'scripts', 'styles', 'watch']);

    // browser-sync task
    gulp.task('browser-sync', function() {
      livereload({
        server: {
            baseDir: PATHS.devDir
        },
            notify: false
      });
    });

    // Detele PATHS.output
    gulp.task('del', function() {
       del.sync(PATHS.output);
    });

    // Copy fonts from a module outside of our project (like Bower)
    gulp.task('build', ['del', 'images'], function() { //
        gulp.src(PATHS.devDir + '/*.html')
        .pipe(gulp.dest(PATHS.output))

        gulp.src(['src/assets/**/*', '!src/assets/scss', '!src/assets/**/*.scss'])
    	.pipe(gulp.dest(PATHS.output + '/assets/'))
    });

    // Process HTML
    gulp.task('html', function () {
        return gulp.src(PATHS.pages + '/*.html')
            .pipe(plumber({
                errorHandler: onError
            }))
            .pipe(nunjucksRender({
                path: [PATHS.templates],
                watch: true,
            }))
            .pipe(gulp.dest(PATHS.devDir + '/'))
            .pipe(livereload.reload({stream: true}))
            .pipe(notify({ message: 'HTML task complete' }));
    });

    // Process Stylesheets
    gulp.task('styles', function () {
        gulp.src(PATHS.devDir + '/assets/scss/main.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
              browsers: ['last 2 versions']  // config object
            }))
            .pipe(cssnano())
            .pipe(concat('main.min.css'))
            .pipe(gulp.dest(PATHS.devDir + '/assets/css'))
            .pipe(livereload.reload({stream: true}))
            .pipe(notify({ message: 'Styles task complete' }));
    });

    //Compress Images
    gulp.task('images', function() {
    var imgSrc = PATHS.devDir + '/assets/img/**/*',
        imgDst = PATHS.output + '/assets/img';

    return gulp.src(imgSrc)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(imgDst))
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst))
        .pipe(notify({ message: 'Images task complete' }));
    });

    //Combine/Minify Javascript
    gulp.task('scripts', function() {
    return gulp.src([
            PATHS.devDir + '/assets/js/main.js'
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('main.min.js'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest(PATHS.devDir + '/assets/js'))
        .pipe(livereload.reload({stream: true}))
        .pipe(notify({ message: 'Scripts task complete' }));
    });

    gulp.task('watch', function() {
        // Watch HTML
        gulp.watch(PATHS.pages + '/*.html', ['html']);

    	// Whenever a stylesheet is changed, recompile
        gulp.watch(PATHS.devDir + '/assets/scss/**/*.scss', ['styles']);

    	// If user-developed Javascript is modified, re-run our hinter and scripts tasks
    	gulp.watch(PATHS.devDir + '/assets/js/**/*.js', ['scripts']);

    });
