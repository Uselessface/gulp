const rename = require('gulp-rename');

let project_folder = 'dist';
let source_folder = 'src';

let fs = require('fs');

let path = {
    build:{
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    src:{
        html: [source_folder + '/*.html', '!' + source_folder + '/_*html'],
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/main.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: source_folder + '/fonts/*.ttf',
    },
    watch:{
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico}',
    },
    clean: './' + project_folder + '/'
}

let {src, dest } = require('gulp'),
    gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    groupMedia = require('gulp-group-css-media-queries'),
    cleanCss = require('gulp-clean-css'),
    renameFile = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    babel = require('gulp-babel'),
    imgmin = require('gulp-imagemin'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter');                                  

function browsersync(){
    browserSync.init({
        server:{
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify:false,
    })
}

function html(){
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream())
}
 
function css(){
    return src(path.src.css)
    .pipe(
        scss({
            outputStyle: 'expanded',
        })
    )
    .pipe(
        autoprefixer({
            overrideBrowserlist: ['last 5 versions'],
            cascade: true
        })
    )
    .pipe(dest(path.build.css))
    .pipe(
        groupMedia()
    )
    .pipe(
        renameFile({
            extname: '.min.css'
        })
    )
    .pipe(cleanCss())
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream())
}

function js(){
    return src(path.src.js)
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            renameFile({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream())
}

function img(){
    return src(path.src.img)
        .pipe(
            imgmin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlaced: true,
                optimizationLevel:3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream())
}

function fontStyle() {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
      fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
      return fs.readdir(path.build.fonts, function(err, items) {
        if (items) {
          let c_fontname;
          for (var i = 0; i < items.length; i++) {
            let fontname = items[i].split('.');
            fontname = fontname[0];
            if (c_fontname != fontname) {
              fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
            }
            c_fontname = fontname;
          }
        }
      })
    }
  }
  
    
    function cb() { }

    
    function cb() {}


function fonts(){
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))    
}


function watchFiles(){
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], img);
} 

function deleteFolder(){
    return del(path.clean);
}
gulp.task('otf', function(){
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        })
        .pipe(dest(source_folder + '/fonts/'))
    )
})

let build = gulp.series(deleteFolder, gulp.parallel(css, html, js, img, fonts), fontStyle);
let watch = gulp.parallel(build, watchFiles , browsersync);

exports.fontStyle = fontStyle;
exports.fonts = fonts;
exports.img = img;
exports.js = js;
exports.css = css;
exports.html = html;
exports.watch = watch;
exports.default = watch;
exports.build = build;
