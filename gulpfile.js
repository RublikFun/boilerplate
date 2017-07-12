/* gulpfile.js */
var gulp           = require('gulp'),
    nunjucksRender = require('gulp-nunjucks-render'),
    concat         = require('gulp-concat'),
    sass           = require('gulp-sass'),
    autoprefixer   = require('gulp-autoprefixer'),
    htmlbeautify   = require('gulp-html-beautify'),
    sourcemaps     = require('gulp-sourcemaps'),
    uglify         = require('gulp-uglify'),
    changed        = require('gulp-changed'),
	imagemin       = require('gulp-imagemin'),
	notify         = require('gulp-notify'),
	plumber        = require('gulp-plumber'),
	stripDebug     = require('gulp-strip-debug'),
    cssnano        = require('gulp-cssnano'),
    rename         = require('gulp-rename'),
    htmlreplace    = require('gulp-html-replace'),
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
    gulp.task('build', ['html', 'scripts', 'styles', 'del', 'images'], function() { //
        gulp.src(PATHS.devDir + '/*.html')
        .pipe(htmlreplace({
            'css': 'assets/css/style.min.css',
            'js' : 'assets/js/bundle.min.js'
        }))
        .pipe(gulp.dest(PATHS.output))

        gulp.src([
            'src/assets/**/*',
            '!src/assets/scss', '!src/assets/**/*.scss',
            '!src/assets/css/vendor', '!src/assets/css/vendor/**/*.css', '!src/assets/css/style.css',
            '!src/assets/js/vendor', '!src/assets/js/vendor/**/*.js', '!src/assets/js/main.js'
        ])
    	.pipe(gulp.dest(PATHS.output + '/assets/'))
    });

    // Process HTML
    gulp.task('html', function () {
        var options = {
            "indent_size" : 4
        };
        return gulp.src(PATHS.pages + '/*.html')
            .pipe(plumber({
                errorHandler: onError
            }))
            .pipe(nunjucksRender({
                path: [PATHS.templates],
                watch: true,
            }))
            .pipe(htmlbeautify(options))
            .pipe(gulp.dest(PATHS.devDir + '/'))
            .pipe(livereload.reload({stream: true}))
            .pipe(notify({ message: 'HTML task complete' }));
    });

    // Process Stylesheets
    gulp.task('styles', function () {
        gulp.src([
                PATHS.devDir + '/assets/css/vendor/normalize.css',
                PATHS.devDir + '/assets/css/vendor/magnific-popup.css',
                PATHS.devDir + '/assets/css/vendor/owl.carousel.css',
                PATHS.devDir + '/assets/css/vendor/animate.css',
                PATHS.devDir + '/assets/scss/main.scss'
            ])
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 2 versions']  // config object
            }))
            .pipe(concat('style.css'))
            .pipe(gulp.dest(PATHS.devDir + '/assets/css'))
            .pipe(cssnano())
            .pipe(rename('style.min.css'))
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
            PATHS.devDir + '/assets/js/vendor/jquery-3.1.1.min.js',
            PATHS.devDir + '/assets/js/vendor/jquery.magnific-popup.min.js',
            PATHS.devDir + '/assets/js/vendor/owl.carousel.min.js',
            PATHS.devDir + '/assets/js/vendor/jquery.disablescroll.js',
            PATHS.devDir + '/assets/js/vendor/jquery.validate.js',
            PATHS.devDir + '/assets/js/vendor/wow.min.js',
            PATHS.devDir + '/assets/js/main.js'
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('bundle.js'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(rename('bundle.min.js'))
        .pipe(gulp.dest(PATHS.devDir + '/assets/js'))
        .pipe(livereload.reload({stream: true}))
        .pipe(notify({ message: 'Scripts task complete' }));
    });

    gulp.task('watch', function() {
        // Watch HTML
        gulp.watch(PATHS.pages + '/*.html', ['html']);
        gulp.watch(PATHS.templates + '/**/*.html', ['html']);

    	// Whenever a stylesheet is changed, recompile
        gulp.watch(PATHS.devDir + '/assets/scss/**/*.scss', ['styles']);

    	// If user-developed Javascript is modified, re-run our hinter and scripts tasks
    	gulp.watch([PATHS.devDir + '/assets/js/main.js', PATHS.devDir + '/assets/js/vendor/**/*.js' ], ['scripts']);

    });
