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
            scripts: {
                src: ['src/scripts/**/*.js'],
                dest: '.grunt/theme.js'
            }
        },

        pug: {
            views: {
                src: 'src/views/theme.pug',
                dest: '.grunt/theme.html'
            }
        },

        // Create the distibutable copies
        copy: {
            sample: {
                src: '.grunt/theme.html',
                dest: 'dist/sample.html'
            },
            tumblr: {
                src: '.grunt/theme.html',
                dest: 'dist/theme.html'
            }
        },

        // Insert all the JS and CSS into the single html file
        insert: {
            scriptsSample: {
                src: '.grunt/theme.js',
                dest: 'dist/sample.html',
                match: '<!-- !import scripts -->'
            },
            stylesSample: {
                src: '.grunt/theme.css',
                dest: 'dist/sample.html',
                match: '<!-- !import styles -->'
            },
            scriptsTumblr: {
                src: '.grunt/theme.js',
                dest: 'dist/theme.html',
                match: '<!-- !import scripts -->'
            },
            stylesTumblr: {
                src: '.grunt/theme.css',
                dest: 'dist/theme.html',
                match: '<!-- !import styles -->'
            }
        },

        // Minify the HTML, currently unused
        htmlmin: {
            theme: {
                src: 'dist/theme.html',
                dest: 'dist/theme.min.html'
            }
        }
    });

    grunt.registerTask('default', ['watch']);

    grunt.registerTask('views', ['pug', 'prepare-sample']);
    grunt.registerTask('scripts', ['concat', 'prepare-sample']);
    grunt.registerTask('styles', ['sass', 'prepare-sample']);

    grunt.registerTask('prepare-sample', ['copy:sample', 'insert:scriptsSample', 'insert:stylesSample']);
    grunt.registerTask('prepare-tumblr', ['copy:tumblr', 'insert:scriptsTumblr', 'insert:stylesTumblr']);
    
    // Compile to create a locally viewable version
    // Tumblr to create a a tumblr-ready version
    grunt.registerTask('compile', ['pug', 'concat', 'sass', 'prepare-sample']);
    grunt.registerTask('tumblr', ['pug', 'concat', 'sass', 'prepare-tumblr']);
};