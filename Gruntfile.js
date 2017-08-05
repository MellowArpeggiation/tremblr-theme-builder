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

        notify: {
            sample: {
                options: {
                    title: 'Sample compiled',
                    message: 'sample.html has finished compiling'
                }
            },
            tumblr: {
                options: {
                    title: 'Theme compiled',
                    message: 'theme.html has fininshed compiling'
                }
            },
            publish: {
                options: {
                    title: 'Theme uploaded',
                    message: 'theme.html has been successfully uploaded to Tumblr'
                }
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
        },

        // Send the latest theme to Tumblr
        http: {
            postTumblr: {
                options: {
                    url: 'https://www.tumblr.com/customize_api/blog/tremblrtheme',
                    headers: {
                        "Cookie": "rxx=1xcxwccjk91.1g0vbf4&v=1; tmgioct=596997d8cf03d20576528200; anon_id=MUHHYGSHVXYWGKZZJYZLFBUNIUMESLUZ; logged_in=1; use_own_posts=1; nts=true; capture=cnzOgtunXPuMvf6PGb48RReeIRI; language=%2Cen_US; pfp=W1vym2kQDME7VF1oDWW3tqomisU0evn40PLdrVs3; pfs=cmZBl40YfEpKLBgrFltyHD2t5U; pfe=1507871622; pfu=38855025; pfx=1c2fc9024519ac291b0dead44cd2a9ebc8f2a7267b955df6cc9236adbbe491dc%230%234271846327; devicePixelRatio=1; documentWidth=1903; __utma=189990958.1533710215.1406201325.1501922164.1501924784.89; __utmc=189990958; __utmz=189990958.1500725688.77.57.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _ga=GA1.2.1533710215.1406201325; _gid=GA1.2.1161574138.1501906587; yx=4n4816g9fsscq%26o%3D3%26f%3Dze; customize_word_wrap=1"
                    },
                    method: 'POST',
                    json: true,
                    body: {
                        "custom_css": "",
                        "description": "This is a blog to show off the new Tremblr theme",
                        "enable_url_slugs": 1,
                        "name": "tremblrtheme",
                        "open_links_in_new_window": 0,
                        "posts_per_page": "15",
                        "theme_id": 0,
                        "title": "Tremblr Theme",
                        "truncate_feed": 0,
                        "global_params": {
                            "avatar_shape": "square",
                            "background_color": "#FAFAFA",
                            "body_font": "Helvetica Neue",
                            "header_bounds": 0,
                            "header_image": "http://assets.tumblr.com/images/default_header/optica_pattern_02.png?_v=b976ee00195b1b7806c94ae285ca46a7",
                            "header_image_dimens": "",
                            "header_image_focused": "http://assets.tumblr.com/images/default_header/optica_pattern_02.png?_v=b976ee00195b1b7806c94ae285ca46a7",
                            "header_image_scaled": "http://assets.tumblr.com/images/default_header/optica_pattern_02.png?_v=b976ee00195b1b7806c94ae285ca46a7",
                            "header_stretch": true,
                            "link_color": "#529ECC",
                            "show_avatar": true,
                            "show_description": true,
                            "show_header_image": true,
                            "show_title": true,
                            "title_color": "#444444",
                            "title_font": "Gibson",
                            "title_font_weight": "bold"
                        },
                        "custom_params": {
                            "if:Endless scrolling": true,
                            "if:Related Posts": true,
                            "if:Show navigation": true,
                            "if:Sliding header": true,
                            "if:Syntax highlighting": false,
                            "select:Layout": "regular",
                            "text:Disqus shortname": "",
                            "text:Google analytics ID": ""
                        },
                        "custom_theme": grunt.file.read('dist/theme.html'),
                        "purchased_theme_ids": ["39927"],
                        "enable_mobile_interface": false,
                        "enable_google_amp": true,
                        "brag": true,
                        "url": "https://tremblrtheme.tumblr.com/",
                        "theme_author_prompt": false,
                        "PortraitURL-16": "https://assets.tumblr.com/images/default_avatar/cube_closed_16.png",
                        "PortraitURL-24": "https://assets.tumblr.com/images/default_avatar/cube_closed_24.png",
                        "PortraitURL-30": "https://assets.tumblr.com/images/default_avatar/cube_closed_30.png",
                        "PortraitURL-40": "https://assets.tumblr.com/images/default_avatar/cube_closed_40.png",
                        "PortraitURL-48": "https://assets.tumblr.com/images/default_avatar/cube_closed_48.png",
                        "PortraitURL-64": "https://assets.tumblr.com/images/default_avatar/cube_closed_64.png",
                        "PortraitURL-96": "https://assets.tumblr.com/images/default_avatar/cube_closed_96.png",
                        "PortraitURL-128": "https://assets.tumblr.com/images/default_avatar/cube_closed_128.png",
                        "avatar_url": "https://assets.tumblr.com/images/default_avatar/cube_closed_128.png",
                        "id": "tremblrtheme",
                        "user_form_key": "cnzOgtunXPuMvf6PGb48RReeIRI",
                        "secure_form_key": "!331501925758|uXhYGCJ51IhCh0NZR3EM8SdxM"
                    }
                }
            }
        }
    });

    grunt.registerTask('default', ['watch']);

    grunt.registerTask('views', ['pug', 'prepare-sample']);
    grunt.registerTask('scripts', ['eslint', 'uglify', 'prepare-sample']);
    grunt.registerTask('styles', ['sass', 'postcss', 'prepare-sample']);

    grunt.registerTask('prepare-sample', ['copy', 'insert', 'replace:sample', 'notify:sample']);
    grunt.registerTask('prepare-tumblr', ['copy', 'insert', 'replace:tumblr', 'notify:tumblr']);
    grunt.registerTask('prepare-publish', ['copy', 'insert', 'replace:tumblr', 'http', 'notify:publish']);
    
    // Compile to create a locally viewable version
    // Tumblr to create a a Tumblr-ready version
    // Publish to upload the Tumblr-ready version directly to Tumblr
    grunt.registerTask('compile', ['pug', 'eslint', 'uglify', 'sass', 'postcss', 'prepare-sample']);
    grunt.registerTask('tumblr', ['pug', 'eslint', 'uglify', 'sass', 'postcss', 'prepare-tumblr']);
    grunt.registerTask('publish', ['pug', 'eslint', 'uglify', 'sass', 'postcss', 'prepare-publish']);
};