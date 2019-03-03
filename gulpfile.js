"use strict";

var gulp = require("gulp"),
    autoprefixer = require("autoprefixer"),
    prettify = require('gulp-html-prettify'),
    rename = require("gulp-rename"),
    removeComments = require('gulp-strip-css-comments'),
    sass = require("gulp-sass"),
    postcss = require('gulp-postcss'),
    cssnano = require("cssnano"),
    uncss = require('postcss-uncss'),
    rigger = require("gulp-rigger"),
    uglify = require("gulp-uglify"),
    watch = require("gulp-watch"),
    plumber = require("gulp-plumber"),
    imagemin = require("gulp-imagemin"),
    run = require("run-sequence"),
    rimraf = require("rimraf"),
    webserver = require("browser-sync"),
    sourcemaps = require('gulp-sourcemaps');


/* Paths to source/build/watch files
=========================*/

var path = {
    build: {
        html: "build/",
        js: "build/assets/js/",
        css: "build/assets/css/",
        img: "build/assets/i/",
        fonts: "build/assets/fonts/"
    },
    src: {
        html: "src/*.{htm,html}",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/style.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    watch: {
        html: "src/**/*.{htm,html}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    clean: "./build"
};


/* Webserver config
=========================*/

var config = {
    server: "build/",
    notify: false,
    open: true,
    ui: false
};


/* Tasks
=========================*/

gulp.task("webserver", function() {
    webserver(config);
});


gulp.task("html:build", function() {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(prettify({ indent_char: ' ', indent_size: 4 }))
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({ stream: true }));
});


gulp.task("css:build", function() {
    var plugins = [
        autoprefixer({ browsers: ['last 5 versions'], cascade: true }),
        // uncss({
        //     html: ['src/search-area.html'],
        //     ignore: ['.catalog__catalog-list_active', '.catalog__aside_active', 'filter-item_open']
        // }),
        cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        })
    ];

    return gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(removeComments())
        .pipe(postcss(plugins))
        .pipe(rename("style.min.css"))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});


gulp.task("css:watch", function() {
    gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(rename("style.min.css"))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});


gulp.task("js:build", function() {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("main.min.js"))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({ stream: true }));
});


gulp.task("fonts:build", function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task("image:build", function() {
    gulp.src(path.src.img)
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});


gulp.task("clean", function(cb) {
    rimraf(path.clean, cb);
});


gulp.task("watch", function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start("html:build");
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start("css:watch");
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start("js:build");
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start("image:build");
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start("fonts:build");
    });
});


gulp.task('build', function(cb) {
    run(
        "clean",
        "html:build",
        "js:build",
        "fonts:build",
        "image:build",
        "css:build"
        , cb);
});


gulp.task("default", function(cb) {
    run(
        "clean",
        "html:build",
        "css:watch",
        "js:build",
        "fonts:build",
        "image:build",
        "webserver",
        "watch"
        , cb);
});


