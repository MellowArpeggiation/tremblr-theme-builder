# Tremblr theme builder
Ever wanted to build a Tumblr theme, but want to use your own preprocessors, and don't like the single file for EVERYTHING architecture? This is the project for you!

No longer will you have to spend hours gawking at your own code, wondering where anything is amongst a gargantuan 2,000 line spaghetti mess. Clean and organised is the key to good design!

## How to compile
1. Install [Node.js](https://nodejs.org/en/download/current/)
2. Open your command line and run:
   * `npm install`
3. Run the following commands
   * To run the watcher, which automatically compiles changes into sample.html:
      * `grunt`
   * To compile sample.html for viewing:
      * `grunt compile`
   * To compile theme.html for submission to Tumblr:
      * `grunt tumblr`

These commands will install all the necessary node_modules into the project, and the grunt-cli will allow you to run the Grunt worker, which will allow you to see your changes immediately, and also create the final product, with no extra work!

## How to use
This package uses Pug for the HTML markup, which is a simple, declarative syntax that maps directly to HTML, [If you don't know how to write Pug, please click here.](https://codepen.io/mimoduo/post/learn-pug-js-with-pugs)

Please note, that the build process will strip out comment start and ends in the final HTML (so that the Tumblr {block} tags show up), please ensure you use //- comments!

This package also uses Sass as a CSS preprocessor, which writes exactly like regular CSS, except you can nest tags! There are also mixins and the like for extra power, [if you'd like to learn more, please click here.](http://sass-lang.com/guide)

There is currently no preprocessor support for Javascript, so nothing too fancy here, just write .js files under scripts and they will all be minified and imported!

### Adding Tumblr's special markup tags
In your pug document, add in the markup tag with a visible comment, for example, use:
```pug
// {block:Posts}
.posts
    p This is where all posts go!
// {/block:Posts}
```

See Tumblr's [custom theme documentation](https://www.tumblr.com/docs/en/custom_themes) for all markup options

## How do I put my finished theme into Tumblr?
Easy! Just copy the contents of dist/theme.html into the "Edit HTML" editor.