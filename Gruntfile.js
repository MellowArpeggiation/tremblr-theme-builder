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
        
        // Compile pug to html
        pug: {
            views: {
                src: 'src/views/theme.pug',
                dest: '.grunt/temp.html'
            }
        },
        
        // Concatenate javascript into a single file
        concat: {
            scripts: {
                src: ['src/scripts/**/*.js'],
                dest: '.grunt/theme.js'
            }
        },

        // Compile sass to css
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
                src: '.grunt/theme.js',
                dest: '.grunt/theme.html',
                match: '<!-- !import scripts -->'
            },
            styles: {
                src: '.grunt/theme.css',
                dest: '.grunt/theme.html',
                match: '<!-- !import styles -->'
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
                    patterns: [
                        {
                            match: '{Title}',
                            replacement: 'Lorem ipsum'
                        },
                        {
                            match: '{Description}',
                            replacement: 'This is a sample blog'
                        },
                        {
                            match: '{Body}',
                            replacement: 'Lorem ipsum, dolor sit amet'
                        },
                        {
                            match: '{Caption}',
                            replacement: 'This image has this caption'
                        },
                        {
                            match: '{PhotoURL-500}',
                            replacement: 'http://lorempixel.com/500/500'
                        },
                        {
                            match: '{PhotoURL-Panorama}',
                            replacement: 'http://lorempixel.com/1000/400'
                        },
                        {
                            match: '{Photoset}',
                            replacement: '<div id="photoset_163011928188" class="html_photoset"><iframe id="photoset_iframe_163011928188" name="photoset_iframe_163011928188" class="photoset" scrolling="no" frameborder="0" height="511" width="100%" style="border:0px; background-color:transparent; overflow:hidden;" src="https://www.tumblr.com/post/163011928188/photoset_iframe/tremblrtheme/tumblr_ot4mv2tChL1wum1vk/0/false"></iframe></div>'
                        },
                        {
                            match: '{Quote}',
                            replacement: 'It does not matter how slow you go so long as you do not stop.'
                        },
                        {
                            match: '{Source}',
                            replacement: 'Confucious'
                        },
                        {
                            match: '{Name}',
                            replacement: 'Link post'
                        }
                    ]
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

    grunt.registerTask('prepare-sample', ['copy', 'insert', 'replace:sample']);
    grunt.registerTask('prepare-tumblr', ['copy', 'insert', 'replace:tumblr']);
    
    // Compile to create a locally viewable version
    // Tumblr to create a a tumblr-ready version
    grunt.registerTask('compile', ['pug', 'concat', 'sass', 'prepare-sample']);
    grunt.registerTask('tumblr', ['pug', 'concat', 'sass', 'prepare-tumblr']);
};