var gulp = require('gulp');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var cache = require('gulp-cached');
var polyclean = require('polyclean');
var htmlmin = require('gulp-htmlmin');
var stylemod = require('gulp-style-modules');
var sass = require('gulp-sass');
var vulcanize = require('gulp-vulcanize');

gulp.task('default', ['less', 'components'], function () {
    gulp.src([
        'bower_components/app-*/*.html',
        'bower_components/iron-*/*.html',
        'bower_components/paper-*/*.html',
        'bower_components/google-*/*.html',
        'bower_components/gold-*/*.html',
        'bower_components/neon-*/*.html',
        'bower_components/platinum-*/*.html',
        'bower_components/polymer/*.html',
        'dist/components/*.html'
    ], {base: './'})
        .pipe(cache('components'))
        .pipe(polyclean.cleanCss())
        .pipe(polyclean.leftAlignJs())
        .pipe(polyclean.uglifyJs())
        .pipe(htmlmin({removeComments: true}))
        .pipe(gulp.dest('./'));
    gulp.src('dist/js/*.js')
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist/js'));
    return gulp.src('dist/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('less', function () {
    return gulp.src('src/less/style.less')
        .pipe(less({
            paths: ['vendor/twbs/bootstrap/less']
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', ['coffee'], function () {
    return gulp.src(['bower_components/moment/moment.js'])
        .pipe(gulp.dest('dist/js'))
});

gulp.task('coffee', function () {
    return gulp.src('src/coffee/*.coffee')
        .pipe(coffee())
        .pipe(gulp.dest('dist/js/'))
});

gulp.task('components', ['style-modules', 'js-modules', 'scripts'], function () {
    return gulp.src('src/components/*')
        .pipe(vulcanize({
            inlineScripts: true,
            inlineCss: true,
            stripComments: true,
            excludes: ['bower_components/', 'dist/components/']
        }))
        .pipe(gulp.dest('dist/components'))
});

gulp.task('style-modules', function () {
    var path = require('path');
    return gulp.src('src/sass/*.module.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(stylemod({
            filename: function (file) {
                return path.basename(file.path, path.extname(file.path));
            },
            moduleId: function (file) {
                return path.basename(file.path, path.extname(file.path));
            }
        }))
        .pipe(gulp.dest('dist/css-modules'));
});

gulp.task('js-modules', function () {
    return gulp.src('src/coffee/*.module.coffee')
        .pipe(coffee())
        .pipe(gulp.dest('dist/js-modules'));
});