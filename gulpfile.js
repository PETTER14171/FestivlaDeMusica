import { src, dest, watch, series } from 'gulp';
import sass from 'gulp-dart-sass';  // Usamos directamente gulp-dart-sass

export function js( done ){

    src('src/js/app.js')
        .pipe( dest('build/js'))

    done()
}

// Tarea para compilar SCSS a CSS
export function css(done) {
    src('src/scss/app.scss', {sourcemaps: true})   // Archivo de entrada
        .pipe(sass().on('error', sass.logError))          // Compilamos usando gulp-dart-sass
        .pipe(dest('build/css', {sourcemaps: true}));  // Guardamos el archivo compilado en la carpeta build/css

    done();  // Finaliza la tarea
}

// Tarea para observar los cambios en los archivos SCSS
export function dev() {
    watch('src/scss/**/*.scss', css);  // Observa los cambios y vuelve a compilar
    watch('src/js/**/*.js', js);  // Observa los cambios y vuelve a compilar
}

// Tarea de construcción para producción
export function build(done) {
    series(js, css)(); // Ejecuta las tareas de JS y CSS sin observación
    done();
}

export default series(js, css, dev)