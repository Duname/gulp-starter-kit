// В переменные получаем установленые пакеты
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var mmq = require('gulp-merge-media-queries');
var del = require('del');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var rigger = require('gulp-rigger');

// Создаем таск для сборки html файлов
gulp.task('html', function () {
  // Берем все файлы с расширением html в папке src
  return gulp.src('./src/*.html')
    // с помощью ригера собираем куски html файлов, если таковые есть (//= в index.html)
    .pipe(rigger())
    // минифицируем html
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    // выкидываем html в папку dist
    .pipe(gulp.dest('./dist'))
    // говорим browser-sync о том что пора перезагрузить барузер так как файл изменился
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Создаем таск для сборки html файлов
gulp.task('css', function () {
  // Берем только файл styles.scss в папке src, в который импортируеются паршалы
  return gulp.src('./src/sass/styles.scss')
    // Преобразовываем sass в css
    .pipe(sass().on('error', sass.logError))
    // Создаем вендорные префиксы
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    // Группируем медиа правила
    .pipe(mmq({
      log: false
    }))
    // Минифицируем css
    .pipe(cssnano())
    // Выкидываем css в папку dist
    .pipe(gulp.dest('./dist'))
    // Говорим browser-sync о том что пора перезагрузить барузер так как файл изменился
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Создаем таск для оптимизации картинок
gulp.task('img', function () {
  // Берем все картинки из папки img
  return gulp.src('./src/img/**/*.+(png|jpg|gif|svg)')
    // Пробуем оптимизировать
    .pipe(imagemin())
    // Выкидываем в папку dist/img
    .pipe(gulp.dest('./dist/img'))
    // Говорим browser-sync о том что пора перезагрузить барузер так как файл изменился
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Таск копирования всех шрифтов из папки fonts в dist/fonts
gulp.task('fonts', function () {
  return gulp.src('./src/fonts/**/*.*')
    .pipe(gulp.dest('./dist/fonts'));
});

// Таск слежения за изменениями файлов
gulp.task('watch', function () {
  // Следим за изменениями в любом html файле и вызываем таск 'html' на каждом изменении
  gulp.watch('./src/**/*.html', ['html']);
  // Следим за изменениями в любом sass файле и вызываем таск 'css' на каждом изменении
  gulp.watch('./src/sass/**/*.scss', ['css']);
});

// Таск создания и запуска веб-сервера
gulp.task('server', function () {
  browserSync.init({
    server: {
      // указываем из какой папки "поднимать" сервер
      baseDir: "./dist"
    },
    // Говорим спрятать надоедливое окошко обновления в браузере
    notify: false
  });
});

// Таск удаления папки dist, будем вызывать 1 раз перед началом сборки
gulp.task('del:dist', function () {
  return del.sync('./dist');
});

// Таск который 1 раз собираем все статические файлы
gulp.task('build', ['html', 'css', 'img']);

// Главный таск, сначала удаляет папку dist, потом собирает статику, после чего поднимает вервер и затем запускает слежение за файлами
// Запускается из корня проекта командой npm start
gulp.task('start', ['del:dist', 'build', 'server', 'watch']);