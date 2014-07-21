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
			default_options: {
				options: {
					pattern: {
						match: /data/, // The RegExp to match selectors with
						matchParent: true // Should child declarations (eg. in @media blocks) include their parent node.
					},
					output: 'tmp/styles-icons.css'
				},
				files: {
					'tmp/source.css': ['test/fixtures/source.css']
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
	grunt.registerTask('test', ['clean', 'dataSeparator', 'nodeunit']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'test']);

};
