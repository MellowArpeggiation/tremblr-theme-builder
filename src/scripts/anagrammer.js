/** --------------------------------------
 *   Copyright 2012-2017 George Paton
 *   Anagrammer.js, requires jQuery 1.11+
 *  --------------------------------------
 */

(function () {

    // Default values
    var defaults = {
        // How many seconds between rearranges
        arrangeRate: 8000,

        // How long the animation lasts
        animationDuration: 3000,

        // Ensure that the words are true anagrams
        // Also ensure that all the letters have images associated
        words: [],
        fileFormat: '.svg',

        // Location where the images are stored, letters must be in the format 'a.svg' and within the first level
        // Don't forget trailing slash!
        imageLocation: '//mellowarpeggiation.github.io/Anagrammer.js/letters/',

        onStart: $.noop,
    };

    // --------------------------------------

    var $body = $('body');

    var Anagrammer = function ($container, options) {
        var self = this;

        if (!(self instanceof Anagrammer)) {
            return new Anagrammer();
        }

        self.opts = $.extend({}, defaults, options);
        self.$container = $container;

        self.init();
    };

    Anagrammer.prototype = {
        init: function () {
            var self = this;

            self.currentWord = self.opts.words[0];
            self.$anagramWord = $('<div class="anagram-word"></div>').appendTo(self.$container);
            self.$dummyWord = $('<div class="dummy-word"></div>').appendTo(self.$container);

            var spaces = 0;
            for (var i = 0; i < self.currentWord.length; i++) {
                var character = self.currentWord[i];
                if (character === ' ') {
                    $('<br>').appendTo(self.$anagramWord);
                    spaces++;
                } else {
                    var characterImage = self.opts.imageLocation + character + self.opts.fileFormat;
                    var $character = $('<img src="' + characterImage + '" class="anagram-character ' + character + '">');
                    $character.data('index', i - spaces).appendTo(self.$anagramWord);
                }
            }

            // // Pre arrange to prevent weird pop in
            // self.arrange(self.opts.words[1], true);
            // self.arrange(self.opts.words[0], true);
        },
        preload: function () {
            var numCharacters = 0;
            var charactersLoaded = 0;
            var $preload = $('<div></div>').hide().appendTo($body);
        
            for (var i = 0; i < self.opts.words[0].length; i++) {
                if ((self.opts.words[0])[i] === ' ') {
                    continue;
                } else {
                    numCharacters++;

                    var imageLocation = self.opts.imageLocation + (self.opts.words[0])[i] + self.opts.fileFormat;
                    var $character = $('<img src="' + imageLocation + '">').appendTo($preload);

                    $character.on('load', function () {
                        charactersLoaded++;
                        // console.log('loaded image');
                        if (charactersLoaded >= numCharacters) {
                            // console.log('all images loaded');
                            self.start();
                        }
                    });
                }
            }
        },
        start: function () {
            var self = this;

            self.opts.onStart();

            setTimeout(self.arrange, self.opts.arrangeRate);
        },
        arrange: function (toWord) {
            var i, j;
            
            // console.log('Rearranging as ' + toWord + '...');

            // Clone the contents of anagramWord into the dummy
            self.$dummyWord.html(self.$anagramWord.html());

            // var offset = (self.$anagramWord.offset());
            self.$dummyWord.css({
                position: 'absolute',
                left: 0,
                top: 0,
            });

            var $letters = self.$anagramWord.find('img');
            var $dummyLetters = self.$dummyWord.find('img');

            var oldOffsets = [];
            $dummyLetters.each(function (i) {
                oldOffsets[i] = $($letters[i]).offset();
                $(this).css({
                    position: 'absolute',
                    left: oldOffsets[i].left,
                    top: oldOffsets[i].top,
                });
            });

            $letters.each(function (i) {
                $(this).data('index', i);
            });

            $letters.detach();
            self.$anagramWord.empty();

            var newOffsets = [];

            // var spaces = 0;
            for (i = 0; i < toWord.length; i++) {
                if (toWord[i] === ' ') {
                    $('<br>').appendTo(self.$anagramWord);
                    // spaces++;
                } else {
                    for (j = 0; j < $letters.length; j++) {
                        if ($($letters[j]).hasClass(toWord[i])) {
                            self.$anagramWord.append($letters[j]);
                            $letters.splice(j, 1);
                            break;
                        }
                    }
                }
            }

            $letters.each(function (i) {
                newOffsets[i] = $(this).offset();
            });

            self.$anagramWord.hide();
            self.$dummyWord.show();

            // Animate here
            $dummyLetters.each(function () {
                var $letter = $(this);
                $letter.animate({
                    left: newOffsets[$letter.data('index')].left,
                    top: newOffsets[$letter.data('index')].top,
                }, {
                    duration: self.opts.animationDuration,
                    complete: function () {
                        self.$anagramWord.show();
                        self.$dummyWord.hide();
                    },
                });
            });

            setTimeout(self.arrange, self.opts.arrangeRate);
        },

    };

    window.Anagrammer = Anagrammer;
})();