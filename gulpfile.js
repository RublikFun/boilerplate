/* gulpfile.js */
var gulp         = require('gulp'),
    concat       = require('gulp-concat'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    uglify       = require('gulp-uglify'),
    jshint       = require('gulp-jshint'),
    changed      = require('gulp-changed'),
	imagemin     = require('gulp-imagemin'),
	notify       = require('gulp-notify'),
	plumber      = require('gulp-plumber'),
	stripDebug   = require('gulp-strip-debug'),
    http         = require('http'),
    cssnano      = require('gulp-cssnano'),
    del          = require('del'),
    livereload   = require('browser-sync');

    // Gulp plumber error handler
    var onError = function(err) {
    	console.log(err);
    }

    // Lets us type "gulp" on the command line and run all of our tasks
    gulp.task('default', ['browser-sync', 'jshint', 'scripts', 'styles', 'watch']);

    // browser-sync task
    gulp.task('browser-sync', function() {
      livereload({
        server: {
            baseDir: 'src'
        },
            notify: false
      });
    });

    // Detele 'dist'
    gulp.task('del', function() {
       del.sync('dist');
    });

    // Copy fonts from a module outside of our project (like Bower)
    gulp.task('build', ['del', 'images'], function() { //
        gulp.src('src/*.html')
        .pipe(gulp.dest('dist'))

    	gulp.src('src/fonts/**/*')
    	.pipe(gulp.dest('dist/fonts'))

        gulp.src('src/css/**/*')
    	.pipe(gulp.dest('dist/css'))

        gulp.src('src/js/**/*.js')
    	.pipe(gulp.dest('dist/js'))
    });

    // Process Stylesheets
    gulp.task('styles', function () {
        gulp.src('src/scss/main.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
              browsers: ['last 2 versions']  // config object
            }))
            .pipe(cssnano())
            .pipe(concat('main.min.css'))
            .pipe(gulp.dest('src/css'))
            .pipe(livereload.reload({stream: true}))
            .pipe(notify({ message: 'Styles task complete' }));
    });

    //Compress Images
    gulp.task('images', function() {
    var imgSrc = 'src/img/**/*',
        imgDst = 'dist/img';

    return gulp.src(imgSrc)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(imgDst))
        //.pipe(imagemin())
        .pipe(gulp.dest(imgDst))
        .pipe(notify({ message: 'Images task complete' }));
    });

    // Hint all of our custom developed Javascript to make sure things are clean
    gulp.task('jshint', function() {
    	return gulp.src('src/scripts/*.js')
    	.pipe(plumber({
    		errorHandler: onError
    	}))
    	.pipe(jshint())
    	.pipe(jshint.reporter('default'))
    	.pipe(notify({ message: 'JS Hinting task complete' }));
    });

    //Combine/Minify Javascript
    gulp.task('scripts', function() {
    return gulp.src([
            'src/js/main.js'
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('main.min.js'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('src/js'))
        .pipe(livereload.reload({stream: true}))
        .pipe(notify({ message: 'Scripts task complete' }));
    });

    gulp.task('watch', function() {
        // Watch HTML
        gulp.watch('src/**/*.html', livereload.reload);

    	// Whenever a stylesheet is changed, recompile
        gulp.watch('src/scss/**/*.scss', ['styles']);

    	// If user-developed Javascript is modified, re-run our hinter and scripts tasks
    	gulp.watch('src/js/**/*.js', ['jshint', 'scripts']);

    	// If an image is modified, run our images task to compress images
    	//gulp.watch('src/img/**/*', ['images']);

    });
