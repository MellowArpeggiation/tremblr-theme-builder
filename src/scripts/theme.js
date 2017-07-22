(function () {
    /**
     * @desc This will be triggered when a new page of Notes is loaded and ready to be inserted.
     * @param {Element} html - The HTML node that the AJAX notes loading function returns.
     * @returns {Boolean}    - If this function returns false, it will block the Notes from being inserted.
     */
    var onNotesLoaded = function (html) {
        return true;
    };

    /**
     * @desc This will be triggered after a new page of Notes has been inserted into the DOM.
     */
    var onNotesInserted = function () {

    };

    // Expose the note insertion functions
    window.tumblrNotesLoaded = onNotesLoaded;
    window.tumblrNotesInserted = onNotesInserted;
})();