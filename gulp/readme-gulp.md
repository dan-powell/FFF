# FFF Gulp

Gulp is a task-runner we use to automatically process static assets (CSS & JS).

## First-Time setup

Install the tools below to your machine if you don't have them already.

### Install Node.js

Go to [http://nodejs.org](http://nodejs.org) and follow the instructions.

### Install Gulp

In order to get started, you'll want to install Gulp globally. You may need to use `sudo` (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to do this.

    npm install -g gulp

### Install BrowserSync (for awesome css injection and auto-reload across multiple browsers)

This may also need to be run as sudo/root/administrator (see Gulp).

    npm install -g browser-sync

### Install project gulp plugins

Even though gulp is globally installed, it relies upon plugins that must be installed to the project itself. To do this, `cd` to the project folder that contains your gulp files and run:

    npm install
    
This will install all gulp plugins locally. Don't forget to add the `node_modules/` folder to `.gitignore` if you haven't already.

### Configure project gulp assets

In this folder you will find a `gulp.assets.example.yaml` file. This file contains the tasks and that files gulp will run/process. You will need to duplicate and rename this file to `gulp.assets.yaml`. Change the tasks within this new file to match your new project. `gulp.assets.yaml` is unique to the project and should be committed.

### Configure project gulp environment

In this folder you will also find a `gulp.env.default.yaml` file. This file contains all options related to a particular environment. You will need to duplicate and rename this file to `gulp.env.yaml`. Change the options within this new file to match your preferences.

NOTE: The `gulp.env.yaml` file should never be committed as it is designed to contain settings unique to your environment. If you wish to edit the default settings for everybody, edit `gulp.env.default.yaml` instead. Add `gulp.env.yaml` to the project `.gitignore` file.

## Existing project setup

To get started with gulp on an existing project, simply follow the 'Install project gulp plugins' and 'Configure project gulp environment' steps above. The assets file should already be configured. Basically, run `npm install` and you should be set. Don't forget to make and configure your gulp environment if you have to.

## Running Tasks

Use the commands below to compile the assets. Simply `cd` in to the same directory as your `gulpfile.js` and run these commands. These are commands you need to use regularly when working with Gulp. Basically it boils down to running `gulp build` for production and `gulp` for local development.

NOTE: Don't forget to install any third party packages with `bower` if you haven't already.

### gulp build

`gulp build` is the kitchen sink of gulp commands. It will concatenate/minify/process everything you need and should be the go-to command when readying assets for production. Note that files will *always* be compressed/minified and source-maps disabled when running `gulp build`.

### gulp watch

Used during development - watches files for changes and auto-refreshes browser (Remember to set correct proxy name in `gulp.env.yaml`). 

You can also use the the shorter `gulp` command as a shortcut.

This command is disabled if `developmentMode: false` is set in the `gulp.env.yaml`.

### gulp copy

Copy asset files like fonts, images & JS plugins in to place.

### gulp css

Processes LESS/CSS files.

### gulp js

Processes JS files

### gulp cachebust

Revises static asset URLS in HTML files.

## Now with Post-CSS!

Gulp now uses Post-CSS to process CSS *after* it has been processed by LESS. Post-CSS plugins are declared as an array in `gulp.config.yaml`, (see the file for an example). Each plugin can also be given options. Post-CSS plugins can also be individually set for each task, (see `gulp.assets.example.yaml` for an example.). 

*NOTE: Remember to install the plugin via NPM before using it!*
