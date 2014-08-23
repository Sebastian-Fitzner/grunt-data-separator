/*
 * datauri-separator
 * https://github.com/Sebastian-Fitzner/grunt-datauri-separator
 *
 * Copyright (c) 2014 Sebastian Fitzner
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	// load all npm grunt tasks
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp']
		},

		// Configuration to be run (and then tested).
		dataSeparator: {
			icons: {
				options: {
					pattern: {
						matchValue: /data/, // The RegExp to match values with
						matchParent: true // Rules (eg. in @media blocks) include their parent node.
					},
					output: 'tmp/styles.icons.css'
				},
				files: {
					'tmp/styles.css': ['test/fixtures/source.css']
				}
			},
			ie: {
				options: {
					pattern: {
						matchRule: /lt-ie9/, // The RegExp to match values with
						matchMedia: false, // The RegExp to match media queries with
						matchParent: true // Rules (eg. in @media blocks) include their parent node.
					},
					output: 'tmp/styles.ie8.css'
				},
				files: {
					'tmp/styles.css': ['tmp/styles.css']
				}
			},
			image2x: {
				options: {
					pattern: {
						matchValue: false, // The RegExp to match values with
						matchRule: false, // The RegExp to match values with
						matchMedia: /((min|max)-)?resolution\:\s*(\d+)?\.?(\d+)?dppx/, // The RegExp to match media queries with
						matchParent: false // Rules (eg. in @media blocks) include their parent node.
					},
					output: 'tmp/styles.media.css'
				},
				files: {
					'tmp/styles.css': ['tmp/styles.css']
				}
			}
		},

		// Unit tests.
		nodeunit: {
			tests: ['test/*_test.js']
		}

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'jshint', 'dataSeparator', 'nodeunit']);


	grunt.registerTask('default', ['clean', 'dataSeparator:icons', 'dataSeparator:ie', 'dataSeparator:image2x']);

};
