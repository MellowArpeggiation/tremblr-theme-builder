// Gruntfile

var path = require('path');

module.exports = function (grunt) {
    // Read in the replacements file for structuring the sample.html
    var replaceJSON = grunt.file.readJSON('replacements.json'),
        samplePatterns = [],
        tumblrPatterns = [],
        key;

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @desc Parses an input array into a function that returns each element sequentially when called
     *       If the input is anything else, return it unmutated
     * @param {*|Array} input 
     * @returns {*|Function}
     */
    function arrayFactory(input) {
        // Check if the replacement is an array of strings
        if (Array.isArray(input)) {
            return (function () {
                // Return an anonymous function with closured values

                var i = 0,
                    strings = input;

                return function () {
                    var string = strings[i++];
                    if (i === strings.length) i = 0;
                    return string;
                };
            })();
        }

        return input;
    }

    function duplicateFactory(options) {
        var countLocation = parseInt(options.count.substr(1), 10),
            contentLocation;
        
        if (options.content === '$&') {
            contentLocation = 0;
        } else {
            contentLocation = parseInt(options.content.substr(1), 10);
        }

        return function () {
            var countString = arguments[countLocation],
                countSplit = countString.split('-'),
                count,
                content = arguments[contentLocation],
                string = '';

            if (countSplit.length === 1) {
                count = parseInt(countString, 10);
            } else {
                count = getRandomInt(parseInt(countSplit[0], 10), parseInt(countSplit[1], 10));
            }

            for (var i = 0; i < count; i++) {
                string += content;
            }

            return string;
        };
    }

    // Read in the replacement data, importing the match as regex, and using the duplicateFactory replacement
    // match: {Regex}
    // replacement: {Function}
    for (key in replaceJSON.sample.duplicate) {
        samplePatterns.push({
            match: new RegExp(key, 'g'),
            replacement: duplicateFactory(replaceJSON.sample.duplicate[key])
        });
    }

    // Read in the replacement data, importing the match as regex
    // match: {Regex}
    // replacement: {String|Function}
    for (key in replaceJSON.sample.regex) {
        samplePatterns.push({
            match: new RegExp(key, 'g'),
            replacement: arrayFactory(replaceJSON.sample.regex[key])
        });
    }
    
    // Read in the replacement data structure and convert it into an array of
    // match: {String}
    // replacement: {String|Function}
    for (key in replaceJSON.sample.text) {
        samplePatterns.push({
            match: key,
            replacement: arrayFactory(replaceJSON.sample.text[key])
        });
    }

    // Same as above, but for tumblr replacements
    for (key in replaceJSON.tumblr.text) {
        tumblrPatterns.push({
            match: key,
            replacement: arrayFactory(replaceJSON.tumblr.text[key])
        });
    }

    for (key in replaceJSON.tumblr.regex) {
        tumblrPatterns.push({
            match: new RegExp(key, 'g'),
            replacement: arrayFactory(replaceJSON.tumblr.regex[key])
        });
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

        // Lints the Javascript before compilation
        eslint: {
            target: './src/**/*.js'
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

        // Post process CSS to add vendor prefixes
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({
                        browsers: 'last 2 versions'
                    })
                ]
            },
            styles: {
                src: '.grunt/theme.css'
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
                match: '<!-- @import scripts-->'
            },
            styles: {
                src: '.grunt/theme.css',
                dest: '.grunt/theme.html',
                match: '<!-- @import styles-->'
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
                    preserveOrder: true,
                    // Use the constructed patterns array for replacements
                    patterns: samplePatterns
                },
                src: '.grunt/theme.html',
                dest: 'dist/sample.html'
            },
            tumblr: {
                options: {
                    usePrefix: false,
                    preserveOrder: true,
                    patterns: tumblrPatterns
                },
                src: '.grunt/theme.html',
                dest: 'dist/theme.html'
            }
        }
    });

    grunt.registerTask('default', ['watch']);

    grunt.registerTask('views', ['pug', 'prepare-sample']);
    grunt.registerTask('scripts', ['eslint', 'uglify', 'prepare-sample']);
    grunt.registerTask('styles', ['sass', 'postcss', 'prepare-sample']);

    grunt.registerTask('prepare-sample', ['copy', 'insert', 'replace:sample']);
    grunt.registerTask('prepare-tumblr', ['copy', 'insert', 'replace:tumblr']);
    
    // Compile to create a locally viewable version
    // Tumblr to create a a tumblr-ready version
    grunt.registerTask('compile', ['pug', 'eslint', 'uglify', 'sass', 'postcss', 'prepare-sample']);
    grunt.registerTask('tumblr', ['pug', 'eslint', 'uglify', 'sass', 'postcss', 'prepare-tumblr']);
};