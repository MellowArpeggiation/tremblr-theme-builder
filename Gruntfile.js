// Gruntfile

var path = require('path');

module.exports = function (grunt) {
    // Read in the replacement data structure and convert it into an array of
    // match: {String}
    // replacement: {String|Function}
    var replaceJSON = grunt.file.readJSON('replacements.json');
    var patterns = [];

    for (var key in replaceJSON) {
        var replacement = replaceJSON[key];

        // Check if the replacement is an array of strings
        if (Array.isArray(replacement)) {
            replacement = (function () {
                // Create an anonymous function with closured values

                var i = 0;
                var strings = replacement;

                return function () {
                    return strings[i++];
                };
            })();
        }

        var pattern = {
            match: key,
            replacement: replacement
        };

        patterns.push(pattern);
    }

    var scriptsBuild = require('./src/scripts/build.js');

    function prefixArray(prefix, array) {
        return array.map(function (d) {
            return path.normalize(prefix + d);
        });
    }

    // Load all the included grunt tasks, defined by the init
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Configure watched files and tasks to fire
        watch: {
            // Watch for changes to the grunt configuration
            config: {
                files: ['Gruntfile.js', 'replacements.json']
            },

            // Check for changes in any files and run compile
            views: {
                files: ['src/views/**/*.pug', 'replacements.json'],
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
        
        // Compile pug to html
        pug: {
            views: {
                src: 'src/views/theme.pug',
                dest: '.grunt/temp.html'
            }
        },

        // Concatenates and minifies the Javascript
        uglify: {
            scripts: {
                files: {
                    // We use a build file so we can define the order
                    '.grunt/theme.min.js': prefixArray('src/scripts/', scriptsBuild.concat)
                }
            }
        },

        // Compile sass to css
        sass: {
            options: {
                quiet: false,
                outputStyle: 'compressed'
            },
            styles: {
                files: {
                    '.grunt/theme.css': 'src/styles/theme.scss'
                }
            }
        },

        // Create the distibutable copies
        copy: {
            compiled: {
                src: '.grunt/temp.html',
                dest: '.grunt/theme.html'
            }
        },

        // Insert all the JS and CSS into the single html file
        insert: {
            scripts: {
                src: '.grunt/theme.min.js',
                dest: '.grunt/theme.html',
                match: '<!-- !import scripts-->'
            },
            styles: {
                src: '.grunt/theme.css',
                dest: '.grunt/theme.html',
                match: '<!-- !import styles-->'
            }
        },

        // Replace all the tags
        // sample replaces comment tags with sample content
        // tumblr removes the comment wrapping from tags
        // This is the last operation, so it puts the file in the final location
        replace: {
            sample: {
                options: {
                    usePrefix: false,
                    // Use the constructed patterns array for replacements
                    patterns: patterns
                },
                src: '.grunt/theme.html',
                dest: 'dist/sample.html'
            },
            tumblr: {
                options: {
                    usePrefix: false,
                    patterns: [
                        {
                            match: '<!-- ',
                            replacement: ''
                        },
                        {
                            match: '-->',
                            replacement: ''
                        }
                    ]
                },
                src: '.grunt/theme.html',
                dest: 'dist/theme.html'
            }
        }
    });

    grunt.registerTask('default', ['watch']);

    grunt.registerTask('views', ['pug', 'prepare-sample']);
    grunt.registerTask('scripts', ['uglify', 'prepare-sample']);
    grunt.registerTask('styles', ['sass', 'prepare-sample']);

    grunt.registerTask('prepare-sample', ['copy', 'insert', 'replace:sample']);
    grunt.registerTask('prepare-tumblr', ['copy', 'insert', 'replace:tumblr']);
    
    // Compile to create a locally viewable version
    // Tumblr to create a a tumblr-ready version
    grunt.registerTask('compile', ['pug', 'uglify', 'sass', 'prepare-sample']);
    grunt.registerTask('tumblr', ['pug', 'uglify', 'sass', 'prepare-tumblr']);
};