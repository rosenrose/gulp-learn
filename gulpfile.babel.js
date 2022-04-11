import gulp from "gulp";
import gulp_pug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import gulp_sass from "gulp-sass";
import node_sass from "node-sass";
import autoprefixer from "gulp-autoprefixer";
import minifyCSS from "gulp-csso";
import browserify from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

const sass = gulp_sass(node_sass);

const routes = {
  pug: {
    src: "src/*.pug",
    dest: "build",
    watch: "src/**/*.pug",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    src: "src/scss/style.scss",
    dest: "build/css",
    watch: "src/scss/**/*.scss",
  },
  js: {
    src: "src/js/main.js",
    dest: "build/js",
    watch: "src/js/**/*.js",
  },
};

const clean = () => del(["build/", ".publish"]);

const pug = () => gulp.src(routes.pug.src).pipe(gulp_pug()).pipe(gulp.dest(routes.pug.dest));

const webserver = () => gulp.src("build").pipe(ws({ livereload: true, open: false }));

const img = () => gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest));

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().once("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(gulp.dest(routes.scss.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      browserify({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
        // transform: [babelify.configure({ presets: ["@babel/preset-env"] })],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const ghDeploy = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]);
const assets = gulp.series([pug, styles, js]);
const live = gulp.parallel([webserver, watch]);

//export한 것들은 package.json의 script에서 사용됨.
export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, ghDeploy, clean]);
