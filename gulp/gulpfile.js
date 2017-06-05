var jsyaml = require('js-yaml'),
	fs = require('fs');


// Load environment
try {
    var env = jsyaml.load(fs.readFileSync('./gulp.env.yaml', 'utf8'));
} catch(err) {
	if (err.code == 'ENOENT') {
		console.log('Gulp environment file missing (gulp.env.yaml). Defaulting to values in example file.');
		var env = jsyaml.load(fs.readFileSync('./gulp.env.default.yaml', 'utf8'));
	} else {
		console.log('There is an error in the ENV file.');
		console.log(err);
		process.exit()
	}
}

// Load assets
try {
    var assets = jsyaml.load(fs.readFileSync('./gulp.assets.yaml', 'utf8'));
} catch(err) {
    if (err.code == 'ENOENT') {
		console.log('Gulp assets file missing (gulp.assets.yaml).');
    } else {
    	console.log('There is an error in the ASSETS file.');
    	console.log(err);
	}
    process.exit()
}

// Load plugin config
try {
    var config = jsyaml.load(fs.readFileSync('./gulp.config.yaml', 'utf8'));
} catch(err) {
	console.log('There is an error in the CONFIG file.');
	console.log(err);
	process.exit()
}

if(assets == null || typeof assets.tasks == 'undefined' || assets.tasks == null) {
	console.log('No tasks defined. Please add some to the assets file.');
	process.exit()
}

// Load plugins
var gulp		= require('gulp'),
	plumber 	= require('gulp-plumber'),
	less        = require('gulp-less'),
	uglify      = require('gulp-uglify'),
	concat      = require('gulp-concat'),
	gulpif 		= require('gulp-if'),
    reveasy     = require("gulp-rev-easy"),
    postcss     = require('gulp-postcss'),
	sourcemaps 	= require('gulp-sourcemaps');


// Get get post CSS plugins
var getPostCssPlugins = function(plugins) {
    var array = [];
    plugins.forEach(function (plugin) {
        var pluginHolder = require(plugin.name);
        if(typeof plugin.options != 'undefined' && plugin.options != null) {
            array.push(pluginHolder(plugin.options));
        } else {
            array.push(pluginHolder);
        }
    });
    return array;
};

// Load Post-CSS Plugins
if(typeof config.postCssPlugins != 'undefined' && config.postCssPlugins != null) {
    var postCssPlugins = getPostCssPlugins(config.postCssPlugins);
} else {
    var postCssPlugins = [];
}

// Load local development plugins
if (env.developmentMode) {
	var filter       	= require('gulp-filter'),
		notify      	= require('gulp-notify'),
		browserSync 	= require('browser-sync')
} else {
	// TODO - This is a hacky way of dealing with missing dev dependancies
	var notify = function() {return true};
	notify.onError = function() {return true};
	filter = function() {return true};
	var browserSync = function() {return true};
	browserSync.reload = function() {return true};
}


/* 	TASKS
	========================================= */

// Browser Sync
gulp.task('browser-sync', function() {
	browserSync(env.browsersync);
});


/* 	LESS Tasks
	----------------------------------------- */

gulp.task('less-main', function() {

    if(typeof assets.tasks.less_main == 'undefined' || assets.tasks.less_main == null) {
        console.log('No Less tasks defined. Please add some to the assets file.');
    } else {

        // Loop over all the tasks and run 'em
        assets.tasks.less_main.forEach(function(task) {

            // Check if a config is set, use some sensible defaults if not
            if(typeof task.postCssPlugins != 'undefined' && task.postCssPlugins != null) {
                var postCssPluginsTask = getPostCssPlugins(task.postCssPlugins);
            } else {
                var postCssPluginsTask = postCssPlugins;
            }

            gulp.src(task.src)
				.pipe(gulpif(env.css.sourceMaps, sourcemaps.init() ))
                .pipe(concat(task.dest))
                .pipe(gulpif(env.developmentMode, plumber({errorHandler: notify.onError(task.name + " Error: <%= error.message %> | Line: <%= error.lineNumber %> | fileName: <%= error.fileName %> | Extract: <%= error.extract %>")}) ))
                .pipe(less())
                .pipe(postcss(postCssPluginsTask))
                .pipe(gulpif(env.css.sourceMaps, sourcemaps.write('.') ))
                .pipe(gulp.dest(task.destFolder))
                .pipe(gulpif(env.developmentMode, filter('**/*.css') ))
                .pipe(gulpif(env.developmentMode, notify({ message: task.name + ' Successful' }) ))
                .pipe(gulpif(env.developmentMode, browserSync.reload({stream:true}) ));

        });
    }

});


gulp.task('less-plugins', function() {

    if(typeof assets.tasks.less_plugins == 'undefined' || assets.tasks.less_plugins == null) {
        console.log('No Less tasks defined. Please add some to the assets file.');
    } else {

        // Loop over all the tasks and run 'em
        assets.tasks.less_plugins.forEach(function(task) {

            // Check if a config is set, use some sensible defaults if not
            if(typeof task.postCssPlugins != 'undefined' && task.postCssPlugins != null) {
                var postCssPluginsTask = getPostCssPlugins(task.postCssPlugins);
            } else {
                var postCssPluginsTask = postCssPlugins;
            }

            gulp.src(task.src)
				.pipe(gulpif(env.css.sourceMaps, sourcemaps.init() ))
                .pipe(concat(task.dest))
                .pipe(gulpif(env.developmentMode, plumber({errorHandler: notify.onError(task.name + " Error: <%= error.message %> | Line: <%= error.lineNumber %> | fileName: <%= error.fileName %> | Extract: <%= error.extract %>")}) ))
                .pipe(less())
                .pipe(postcss(postCssPluginsTask))
                .pipe(gulpif(env.css.sourceMaps, sourcemaps.write('.') ))
                .pipe(gulp.dest(task.destFolder))
                .pipe(gulpif(env.developmentMode, filter('**/*.css') ))
                .pipe(gulpif(env.developmentMode, notify({ message: task.name + ' Successful' }) ))
                .pipe(gulpif(env.developmentMode, browserSync.reload({stream:true}) ));

        });
    }

});



/* 	JS Tasks
	----------------------------------------- */

gulp.task('js-main', function() {

	if(typeof assets.tasks.js_main == 'undefined' || assets.tasks.js_main == null) {
		console.log('No JS tasks defined. Please add some to the assets file.');
	} else {

		// Loop over all the tasks and run 'em
		assets.tasks.js_main.forEach(function(task) {

    		// Check if a config is set, use some sensible defaults if not
    		if(typeof task.uglify == 'undefined') {
        		var uglifyConfig = config.uglify;
    		} else {
                var uglifyConfig = task.uglify;
            }

			gulp.src(task.src)
				.pipe(gulpif(env.js.sourceMaps, sourcemaps.init() ))
				.pipe(concat(task.dest))
				.pipe(gulpif(env.developmentMode, plumber({errorHandler: notify.onError(task.name + " Error: <%= error.message %> | Line: <%= error.lineNumber %> | fileName: <%= error.fileName %> | Extract: <%= error.extract %>")}) ))
				.pipe(uglify(uglifyConfig))
				.pipe(gulpif(env.js.sourceMaps, sourcemaps.write('.') ))
				.pipe(gulp.dest(task.destFolder))
				.pipe(gulpif(env.developmentMode, filter('**/*.js') ))
				.pipe(gulpif(env.developmentMode, notify({ message: task.name + ' Successful' }) ))
				.pipe(gulpif(env.developmentMode, browserSync.reload({stream:true}) ));
		});
	}
});



gulp.task('js-plugins', function() {

	if(typeof assets.tasks.js_plugins == 'undefined' || assets.tasks.js_plugins == null) {
        console.log('No JS Plugin tasks defined. Please add some to the assets file');
    } else {
		// Loop over all the tasks and run 'em
		assets.tasks.js_plugins.forEach(function(task) {

    		// Check if a config is set, use some sensible defaults if not
    		if(typeof task.uglify == 'undefined') {
        		var uglifyConfig = config.uglify;
    		} else {
                var uglifyConfig = task.uglify;
            }

			gulp.src(task.src)
				.pipe(gulpif(env.js.sourceMaps, sourcemaps.init() ))
				.pipe(concat(task.dest))
				.pipe(gulpif(env.developmentMode, plumber({errorHandler: notify.onError(task.name + " Error: <%= error.message %> | Line: <%= error.lineNumber %> | fileName: <%= error.fileName %> | Extract: <%= error.extract %>")}) ))
				.pipe(uglify(uglifyConfig))
				.pipe(gulpif(env.js.sourceMaps, sourcemaps.write('.') ))
				.pipe(gulp.dest(task.destFolder))
				.pipe(gulpif(env.developmentMode, filter('**/*.js') ))
				.pipe(gulpif(env.developmentMode, notify({ message: task.name + ' Successful' }) ))
				.pipe(gulpif(env.developmentMode, browserSync.reload({stream:true}) ));

		});
	}
});


/* 	Copy
	----------------------------------------- */

gulp.task('copy-all', function() {

	if(typeof assets.tasks.js_plugins == 'undefined' || assets.tasks.js_plugins == null) {
        console.log('No Copy tasks defined. Please add some to assets file');
	} else {
        // Loop over all the tasks and run 'em
		assets.tasks.copy.forEach(function(task) {

		  	gulp.src(task.src)
		    	.pipe(gulp.dest(task.dest))
		    	.pipe(gulpif(env.developmentMode, notify({ message: 'Successfully copied ' + task.name }) ));

		});
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

			if (taskGroup.constructor === Array) {
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
	}
});




/* Cachebust Task
	----------------------------------------- */

gulp.task('rev', function () {

    if(typeof assets.tasks.cachebust == 'undefined' || assets.tasks.cachebust == null) {
        console.log('No Cachebusting tasks defined. Please add some to assets file');
    } else {
        // Loop over all the tasks and run 'em
        assets.tasks.cachebust.forEach(function(task) {
            // Check if a config is set, use some sensible defaults if not
            if(typeof task.revEasy == 'undefined') {
        		task.revEasy = config.revEasy;
    		}

            gulp.src(task.src)
                .pipe(reveasy(task.revEasy))
                .pipe(gulp.dest(task.dest))
                .pipe(gulpif(env.developmentMode, notify({message: 'Successfully revved ' + task.name})));
        });
	}

});


/* Task Groupings
	========================================= */

// Default
gulp.task('default', [], function() {
    if(env.developmentMode) {
        gulp.start('watch');
    } else {
        gulp.start('build');
    }
});

// Kitchen sink - should be used to compile for production
gulp.task('build', [], function() {

	// Force minification and disable sitemaps when running build
	env.js.minify = true;
	env.js.sourceMaps = false;
	env.css.minify = true;
	env.css.sourceMaps = false;

	gulp.start('css', 'js', 'copy', 'cachebust');
});

// Task aliases - should always exist, but can be customised
gulp.task('css', [], function() {
  gulp.start('less-main', 'less-plugins');
});

gulp.task('js', [], function() {
  gulp.start('js-main', 'js-plugins');
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
	if(!env.developmentMode) {
		console.log('Not in development mode, "watch" task disabled.');
	} else {

        if(typeof assets.watch == 'undefined' || assets.watch == null) {
            console.log('No watch tasks defined. Please add some to the assets file.');
        } else {

			assets.watch.forEach(function(watch) {
		        gulp.watch(watch.files, watch.tasks);
			});

		}
	}
});
