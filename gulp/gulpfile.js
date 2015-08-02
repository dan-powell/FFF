// Load environment config
try {
    var config = require('./gulpconfig.json');
} catch(err) {
	if (err.code == 'MODULE_NOT_FOUND') {
		console.log('Gulp config file missing (gulpconfig.json). Defaulting to values in example file.');
		var config = require('./gulpconfig.example.json');
	} else {
		console.log('There is an error in the CONFIG file. Please fix it :)');
		console.log(err);
		process.exit()
	}
}


// Load assets config
try {
    var assets = require('./gulpassets.json');
} catch(err) {
	if (err.code == 'MODULE_NOT_FOUND') {
		console.log('Asset config file missing (gulpassets.json). Defaulting to values in example file.');
		var assets = require('./gulpassets.example.json');
	} else {
		console.log('There is an error in the ASSETS file. Please fix it :)');
		console.log(err);
		process.exit()
	}
}



// Load plugins
var gulp		= require('gulp'),
	plumber 	= require('gulp-plumber'),
	less        = require('gulp-less'),
	minifycss   = require('gulp-minify-css'),
	uglify      = require('gulp-uglify'),
	concat      = require('gulp-concat'),
	gulpif 		= require('gulp-if');

// Load local development plugins
if (config.developmentMode) {
	var sourcemaps 	= require('gulp-sourcemaps'),
		filter       	= require('gulp-filter'),
		notify      	= require('gulp-notify'),
		browserSync 	= require('browser-sync')
} else {
	// TODO - This is a hacky way of dealing with missing dependancies
	var notify = function() {return true};
	notify.onError = function() {return true};
	var sourcemaps = {
		init : function() {return true},
		write : function() {return true}
	},
	filter = function() {return true};
	var browserSync = function() {return true};
	browserSync.reload = function() {return true};
}


/* 	TASKS
	========================================= */

// Browser Sync
gulp.task('browser-sync', function() {
	browserSync({
    proxy: config.browsersync.proxy,
    browser: config.browsersync.browser
	});
});


/* 	LESS Tasks
	----------------------------------------- */

gulp.task('less', function() {

	if(assets.tasks.less.length > 0) {
		// Loop over all the tasks and run 'em
		assets.tasks.less.forEach(function(task) {

		  gulp.src(task.src)
		  	.pipe(gulpif(config.developmentMode, plumber({errorHandler: notify.onError(task.name + " Error: <%= error.message %> | Extract: <%= error.extract %>")}) ))
		  	.pipe(gulpif(config.developmentMode, gulpif(config.css.sourceMaps, sourcemaps.init()) ))
		  	.pipe(less())
				.pipe(gulpif(config.css.minify, minifycss() ))
				.pipe(gulpif(config.developmentMode, gulpif(config.css.sourceMaps, sourcemaps.write('.')) ))
		    .pipe(gulp.dest(task.dest))
		    .pipe(gulpif(config.developmentMode, filter('**/*.css') ))
		    .pipe(gulpif(config.developmentMode, notify({ message: task.name + ' Successful' }) ))
		    .pipe(gulpif(config.developmentMode, browserSync.reload({stream:true}) ));

	  });
	} else {
		console.log('No Less tasks defined. Please add some to assetconfig.json');
	}

});


/* 	JS Tasks
	----------------------------------------- */

gulp.task('js-all', function() {

	if(assets.tasks.js.length > 0) {

		// Loop over all the tasks and run 'em
		assets.tasks.js.forEach(function(task) {

		  gulp.src(task.src)
			  .pipe(concat(task.dest))
		  	.pipe(gulpif(config.developmentMode, plumber({errorHandler: notify.onError(task.name + " Error: <%= error.message %> | Extract: <%= error.extract %>")}) ))
		  	.pipe(gulpif(config.developmentMode, gulpif(config.js.sourceMaps, sourcemaps.init()) ))
		  	.pipe(uglify({
		      compress: config.js.minify,
		      mangle: false
		    }))
				.pipe(gulpif(config.developmentMode, gulpif(config.js.sourceMaps, sourcemaps.write('.')) ))
		    .pipe(gulp.dest(task.destFolder))
		    .pipe(gulpif(config.developmentMode, filter('**/*.js') ))
		    .pipe(gulpif(config.developmentMode, notify({ message: task.name + ' Successful' }) ))
		    .pipe(gulpif(config.developmentMode, browserSync.reload({stream:true}) ));

		});
	} else {
		console.log('No JS tasks defined. Please add some to assetconfig.json');
	}
});


/* 	Copy
	----------------------------------------- */

gulp.task('copy-all', function() {

	if(assets.tasks.less.length > 0) {
		// Loop over all the tasks and run 'em
		assets.tasks.copy.forEach(function(task) {

		  gulp.src(task.src)
		    .pipe(gulp.dest(task.dest))
		    .pipe(gulpif(config.developmentMode, notify({ message: 'Successfully copied ' + task.name }) ));

		});
	} else {
		console.log('No Copy tasks defined. Please add some to assetconfig.json');
	}
});



/* 	Debug
	-----------------------------------------
	Use to diagnose issues with gulp or assets
	----------------------------------------- */

gulp.task('debug', function() {

	// Check for missing files in asset json
	console.log('Searching for missing asset files');

	var fs = require("fs"); // Load Nodes native filesystem tool

	for (var key in assets.tasks) {
		if (assets.tasks.hasOwnProperty(key)) {
			var taskGroup = assets.tasks[key];

			taskGroup.forEach(function(task) {
				if (typeof task.src != undefined) {

					task.src.forEach(function(file) {

    					if(file.indexOf("*") == -1) {
    						fs.stat(file, function(err, stat) {
    						    if(err != null) {
    							    console.log('DANGER: ' + file + ' not found! (Task: ' + task.name + ')');
    						    }
    					    });
					    } else {
    					    console.log('WARNING: ' + file + ' is a glob and cannot be checked... (Task: ' + task.name + ')');
					    }
					});
				}
			});
		}
	}



});




/* Cachebust Task
	----------------------------------------- */

gulp.task('rev', function () {
  console.log('Cachebusting. TODO: Does nothing at the moment, need to implement this.');
});



/* Task Groupings
	========================================= */

// Default
gulp.task('default', [], function() {
  gulp.start('watch');
});

// Kitchen sink - should be used to compile for production
gulp.task('build', [], function() {

	// Force minification and disable sitemaps when running build
	config.js.minify = true;
	config.js.sourceMaps = false;
	config.css.minify = true;
	config.css.sourceMaps = false;

	gulp.start('css', 'js', 'copy', 'cachebust');
});

// Task aliases - should always exist, but can be customised
gulp.task('css', [], function() {
  gulp.start('less');
});

gulp.task('js', [], function() {
  gulp.start('js-all');
});

gulp.task('copy', [], function() {
  gulp.start('copy-all');
});

gulp.task('cachebust', [], function() {
  gulp.start('rev');
});


// BrowserSync Reload
gulp.task('reload', [], function () {
  browserSync.reload();
});


// Custom tasks



/* Watch Files
	----------------------------------------- */

// Watch
gulp.task('watch', ['browser-sync'], function () {
	if(!config.developmentMode) {
		console.log('Not in development mode, "watch" task disabled.');
	} else {
		if(config.developmentMode && assets.watch.length > 0) {
			assets.watch.forEach(function(watch) {
		    gulp.watch(watch.files, watch.tasks);
			});
		} else {
			console.log('No watch tasks defined. Please add some to assetconfig.json');
		}
	}
});
