/*
 * datauri-separator
 * https://github.com/Sebastian-Fitzner/grunt-datauri-separator
 *
 * Copyright (c) 2014 Sebastian Fitzner
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('dataSeparator', 'Split up your Data-Uri into a separate CSS file.', function () {

			var parseCss = require('css-parse');
			var path = require('path');
			var error = true;

			// Merge task-specific and/or target-specific options with these defaults.
			var options = this.options({
				ext: '.icons.css',
				indicator: 'data:'
			});

			// Process comments
			var processComment = function (comment) {
				var strCss = '/*' + comment.comment + '*/';
				return strCss;
			};

			// Process declaration
			var processDeclaration = function (declaration) {
				var strCss = declaration.property + ': ' + declaration.value + ';';
				return strCss;
			};

			// Check declarations type
			var commentOrDeclaration = function (declarations) {
				var strCss = '';
				if (declarations.type === 'declaration') {
					strCss += '\n\t' + processDeclaration(declarations);
				} else if (declarations.type === 'comment') {
					strCss += ' ' + processComment(declarations);
				}
				return strCss;
			};

			var rules = function (rule) {
				var strCss = '';
				strCss += rule.selectors.join(',\n') + ' {';
				rule.declarations.forEach(function (rules) {
					strCss += commentOrDeclaration(rules);
				});
				strCss += '\n}\n\n';
				return strCss;
			};

			// Check rule type
			var commentOrRule = function(rule) {
				var strCss = '';
				if (rule.type === 'rule') {
					strCss += rules(rule);
				} else if (rule.type === 'comment') {
					strCss += processComment(rule) + '\n\n';
				}
				return strCss;
			};

			this.files.forEach(function (f) {

				f.src.forEach(function (filepath) {

					error = false;

					console.log('\nFile ' + filepath + ' found.');

					var destpath = f.dest;
					var filename = filepath.replace(/(.*)\//gi, '');

					if (destpath.indexOf(filename) === -1) {
						destpath = path.join(f.dest, filename);
					}

					var source = grunt.file.read(filepath);
					var cssJson = parseCss(source);
					var strStyles = [];
					var iconStyles = [];
					var processedCSS = {};
					processedCSS.base = [];
					processedCSS.icons = [];

					grunt.file.write(destpath, cssJson);

					// For every rule in the stylesheet...
					cssJson.stylesheet.rules.forEach(function (rule) {
						if (options.indicator) {
							if (rule.declarations) {
								rule.declarations.forEach(function (rules) {
									if (rules.value.indexOf(options.indicator) > 0) {
										processedCSS.icons.push(rule);
									} else {
										processedCSS.base.push(rule);
									}
								});
							}
						} else {
							console.log("Please set your indicator which should be separated");
						}

					});

					// Function to output base CSS
					var outputBase = function(base){
						base.forEach(function (rule) {
							if (rule.declarations) {
								rule.declarations.forEach(function (rules) {
									if (rules.value.indexOf(options.indicator) > 0) {
									} else {
										strStyles += commentOrRule(rule);
									}
								});
							}
						});
					};

					// Function to output base CSS
					var outputIcons = function (base) {
						base.forEach(function (rule) {
							iconStyles += rules(rule);
						});
					};

					// Check if base CSS was processed and print them
					if (processedCSS.base.length !== 0) {
						outputBase(processedCSS.base);
					}
					if (processedCSS.icons.length !== 0) {
						outputIcons(processedCSS.icons);
					}

					// Normalize line endings
					strStyles = grunt.util.normalizelf(strStyles);
					iconStyles = grunt.util.normalizelf(iconStyles);

					// Write the new file
					grunt.file.write(destpath, strStyles);
					grunt.file.write(destpath.replace(/\.(.*)/, options.ext), iconStyles);
					grunt.log.ok('File ' + destpath + ' created.');
					grunt.log.ok('File ' + destpath.replace(/\.(.*)/, options.ext) + ' created.');

				});

				if (error) {
					grunt.fatal('No files found');
				}

			});


		}
	)
	;

}
;
