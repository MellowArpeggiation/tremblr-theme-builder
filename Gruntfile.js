// Gruntfile

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Configure watched files and tasks to fire
        watch: {
            // Watch for changes to the grunt configuration
            config: {
                files: ['Gruntfile.js']
            },

            // Check for changes in any files and run compile
            views: {
                files: ['src/views/**/*.pug'],
                tasks: ['views']
            },
            scripts: {
                files: ['src/scripts/**/*.js'],
                tasks: ['scripts']
            },
            styles: {
                files: ['src/styles/**/*.scss'],
                tasks: ['styles']
            }
        },

        sass: {
            styles: {
                options: {
                    quiet: false
                },
                files: {
                    '.grunt/theme.css': 'src/styles/theme.scss'
                }
            }
        },

        concat: {
            options: {

            },
            scripts: {
                src: ['src/scripts/**/*.js'],
                dest: '.grunt/theme.js'
            }
        },

        pug: {
            options: {

            },
            views: {
                src: 'src/views/theme.pug',
                dest: '.grunt/theme.html'
            }
        },

        copy: {
            options: {

            },
            theme: {
                src: '.grunt/theme.html',
                dest: 'dist/theme.html'
            }
        },

        // Insert all the JS and CSS into the single html file
        insert: {
            options: {

            },
            scripts: {
                src: '.grunt/theme.js',
                dest: 'dist/theme.html',
                match: '<!-- !import scripts -->'
            },
            styles: {
                src: '.grunt/theme.css',
                dest: 'dist/theme.html',
                match: '<!-- !import styles -->'
            }
        },

        // Minify the HTML, currently unused
        htmlmin: {
            options: {

            },
            theme: {
                src: 'dist/theme.html',
                dest: 'dist/theme.min.html'
            }
        }
    });

    grunt.registerTask('default', ['watch']);

    grunt.registerTask('views', ['pug:views', 'copy', 'insert']);
    grunt.registerTask('scripts', ['concat:scripts', 'copy', 'insert']);
    grunt.registerTask('styles', ['sass:styles', 'copy', 'insert']);
    
    grunt.registerTask('compile', ['pug:views', 'concat:scripts', 'sass:styles', 'copy', 'insert']);
};