// --------------------------------------
//   Copyright 2012-2016 George Paton
//   Anagrammer.js, requires jQuery 1.11+
// --------------------------------------

// * User variables * Override before calling anagrammer()

// How many seconds between rearranges
var arrangeRate = 8000;
// How long the animation lasts
var animationDuration = 3000;
var animationSegmentDuration = 100;

// Ensure that the words are true anagrams
// Also ensure that all the letters have images associated
var words = ["manage the ram", "anagram theme"];

var fileFormat = ".svg";

// Location where the images are stored, letters must be in the format "a.svg" and within the first level
// Don't forget trailing slash!
var imageLocation = "//mellowarpeggiation.github.io/Anagrammer.js/letters/";

// --------------------------------------

function arrangeAsString(nameString, animDuration) {
	if ($("#anword").length == 0) {
		anword = document.createElement("div");
		anword.id = "anword";

		dummy = document.createElement("div");
		dummy.id = "dummy";

		$("#anagram").append(anword);
		$("#anagram").append(dummy);

		var spaces = 0;
		for (var i = 0; i < nameString.length; i++) {
			if (nameString[i] == ' ') {
				lBreak = document.createElement("br");
				$("#anword").append(lBreak);
				spaces++
			} else {
				character = document.createElement("img");
				character.src = imageLocation + nameString[i] + fileFormat;
				$(character).addClass(nameString[i]);
				$(character).addClass("anchar");
				$(character).attr("index", i-spaces);
				$("#anword").append(character);
			}
		}
	} else {
		console.log("Rearranging as " + nameString + "...");

		$("#dummy").empty();

		$("#anword *").clone().appendTo($("#dummy"));
		var offset = ($("#anword").offset());
		$("#dummy").css("position", "absolute")
			.css("left", 0)
			.css("top", 0);

		var oldOffsets = new Array();
		$("#dummy img").each(function(i) {
			oldOffsets[i] = $($("#anword img")[i]).offset();
			$(this).css("position", "absolute")
				.css("left", oldOffsets[i].left)
				.css("top", oldOffsets[i].top);
		})

		$("#anword img").each(function(i) {
			$(this).attr("index", i);
		})

		var letters = $("#anword img").detach();
		$("#anword").empty();

		var newOffsets = new Array();

		var spaces = 0;

		for (var i = 0; i < nameString.length; i++) {
			if (nameString[i] == ' ') {
				lBreak = document.createElement("br");
				$("#anword").append(lBreak);
				spaces++
			} else {
				for (var j = 0; j < letters.length; j++) {
					if ($(letters[j]).hasClass(nameString[i])) {
						$("#anword").append(letters[j]);
						letters.splice(j, 1);
						break;
					}
				}
			}
		}

		$("#anword img").each(function(i) {
			newOffsets[i] = $(this).offset();
		})

		$("#anword").hide();
		$("#dummy").show();

		// Animate here
		var temps = new Array();
		for (var i = 0; i < $("#dummy img").length; i++) {
			var currentImage = $("#dummy img")[i];
			$(currentImage).animate({
				left: newOffsets[$(currentImage).attr("index")].left,
				top: newOffsets[$(currentImage).attr("index")].top
			}, {duration: animDuration, complete: finishAnimating} );
		}
	}
}

function finishAnimating() {
	$("#anword").show();
	$("#dummy").hide();
}

function rearrangeLoop() {
	// Keep track of changes for timekeeping
	var animateCounter = 0;

	arrangeAsString(words[1], animationDuration);
	animateCounter++;

	setTimeout(function() {arrangeAsString(words[0], animationDuration)}, arrangeRate * animateCounter);
	animateCounter++;

	setTimeout(rearrangeLoop, arrangeRate * animateCounter);
}


function anagrammer() {
	var numCharacters = 0,
		charactersLoaded = 0;
	var preload = document.createElement("div");
	$(preload).hide();
	for (var i = 0; i < words[0].length; i++) {
		if ((words[0])[i] == ' ') {
			continue;
		} else {
			numCharacters++;

			character = document.createElement("img");
			character.src = imageLocation + (words[0])[i] + fileFormat;
			$(preload).append(character);

			$(character).on("load", function () {
				charactersLoaded++;
				console.log("loaded image");
				if (charactersLoaded >= numCharacters) {
					console.log("all images loaded");
					beginAnagrammer();
				}
			});
		}
	}

	$(preload).ready(function () {
		// Pre arrange to prevent weird pop in
		arrangeAsString(words[1], 1);
		arrangeAsString(words[0], 1);
	})
}

function beginAnagrammer() {
	setTimeout(rearrangeLoop, arrangeRate - animationDuration);

	if (typeof anagramLoaded == "function") {
		anagramLoaded();
	}
}