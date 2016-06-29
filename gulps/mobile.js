'use strict';

var cordova = require('cordova-lib').cordova.raw,
    devip   = require('dev-ip');

module.exports = function(gulp, plug, pkg) {

    /**
     * Use livereload server when debugging.
     */
    function useServer() {
        return plug.replace(
            '<content src="index.html',
            '<content src="http://' + devip()[0] + ':' + (plug.util.env.port || 9000)
        );
    }

    gulp.task('mobile:clean', function() {
        return plug.del(['./cordova']);
    });

    gulp.task('mobile:copy', function() {
        return gulp.src(['./dist/**/*'], {base: 'dist'})
        .pipe(gulp.dest('./cordova/www'));
    });

    gulp.task('mobile:config', function() {
        return gulp.src(['./app/config.xml'])
        .pipe(plug.replace('{{version}}', pkg.version))
        .pipe(!plug.util.env.dev ?  plug.util.noop() : useServer())
        .pipe(gulp.dest('./cordova'));
    });

    gulp.task('mobile:replace', function() {
        return gulp.src('./cordova/www/index.html')
        .pipe(plug.replace('<!-- {{cordova}} -->', '<script src="cordova.js"></script>'))
        .pipe(plug.replace(' manifest=\'app.appcache\'', ''))
        .pipe(gulp.dest('./cordova/www'));
    });

    gulp.task('mobile:cordova', function() {
        process.chdir('./cordova');

        return cordova.platform('add', ['android'])
        .then(function() {
            return cordova.plugins('add', [
                'cordova-plugin-crosswalk-webview',
                'cordova-plugin-inappbrowser',
                'cordova-plugin-file',
            ]);
        });
    });

    gulp.task('mobile:create', plug.sequence(
        'mobile:clean',
        'build',
        ['mobile:copy', 'mobile:config'],
        'mobile:replace',
        'mobile:cordova'
    ));

    gulp.task('mobile:build', ['mobile:create'], function() {
        return cordova.build({
            platforms: ['android'],
            options  : {
                // argv : ['--release']
            }
        });
    });

};
