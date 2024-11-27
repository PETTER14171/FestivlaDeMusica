import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { src, dest, watch, series } from 'gulp';
import sass from 'gulp-dart-sass';  // Usamos directamente gulp-dart-sass
import sharp from 'sharp';

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


    //Trabaja las imagenes para ajustar el tamaño de las imagenes
export async function crop(done) {
    const inputFolder = 'src/img/gallery/full'
    const outputFolder = 'src/img/gallery/thumb';
    const width = 250;
    const height = 180;
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true })
    }
    const images = fs.readdirSync(inputFolder).filter(file => {
        return /\.(jpg)$/i.test(path.extname(file));
    });
    try {
        images.forEach(file => {
            const inputFile = path.join(inputFolder, file)
            const outputFile = path.join(outputFolder, file)
            sharp(inputFile) 
                .resize(width, height, {
                    position: 'centre'
                })
                .toFile(outputFile)
        });

        done()
    } catch (error) {
        console.log(error)
    }
}


export async function imagenes(done) {
    const srcDir = './src/img';
    const buildDir = './build/img';
    const images =  await glob('./src/img/**/*{jpg,png}')

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
    done();
}

function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true })
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)
    const outputFile = path.join(outputSubDir, `${baseName}${extName}`)
    const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`)
    const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`)

    const options = { quality: 80 }
    sharp(file).jpeg(options).toFile(outputFile)
    sharp(file).webp(options).toFile(outputFileWebp)
    sharp(file).avif().toFile(outputFileAvif)

}


// Tarea de construcción para producción
export function build(done) {
    series(js, css)(); // Ejecuta las tareas de JS y CSS sin observación
    done();
}

// Tarea para observar los cambios en los archivos SCSS
export function dev() {
    watch('src/scss/**/*.scss', css);  // Observa los cambios y vuelve a compilar
    watch('src/js/**/*.js', js);  // Observa los cambios y vuelve a compilar
    watch('src/js/**/*.{png, jpg}', imagenes);  // Observa los cambios y vuelve a compilar
}

export default series(imagenes, crop, js, css, dev)