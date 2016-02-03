# Gulp/Front-end Assets Setup

## Global Tools
Install the tools below to your machine if you don't have them already. You probably don't need to do this if you've worked on a new CMS recently.

### Node.js
If you don't have it already, go to [http://nodejs.org](http://nodejs.org) and follow the instructions.

### Bower

Bower depends on Node and npm. Install it globally using npm:

    npm install -g bower

Note: Make sure to run as sudo if using *nix.
Also make sure that git is installed as some bower packages require it to be fetched and installed.

### Gulp

In order to get started, you'll want to install Gulp globally. You may need to use `sudo` (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to do this.

    npm install -g gulp

### BrowserSync (for awesome css injection and auto-reload across multiple browsers)

This may also need to be run as sudo/root/administrator (see Gulp).

    npm install -g browser-sync

## Asset commands/instructions

To get everything working initially, we'll need to setup the Gulp plugins and get the latest packages that are specific to this project.

To install Gulp plugins:

    npm install

Get 3rd party vendor frameworks using Bower.

    bower install

This will pull down the files of a particular version of Bootstrap etc.

Duplicate and rename `gulpconfig.default.yaml` (remove '.default' from the name). Change the settings accordingly for your local setup.

`gulpassets.yaml` contains the configuration specific to your project.

### COMPILE ALL THE THINGS!

Use the commands below to compile the assets. These are commands you need to use regularly when working on the front-end.

Normal development - watches files for changes and auto-refreshes (Remember to set correct proxy name in `gulpconfig.yaml`)

    gulp watch

Copy asset files like fonts, images & js plugins in to place:

    gulp copy

Compile all assets ready for deployment (minified with no sourcemaps):

    gulp build

Compile individual frontend assets:

    gulp css

    gulp js
