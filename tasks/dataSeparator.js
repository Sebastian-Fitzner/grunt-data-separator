/*
 * data-separator
 * https://github.com/Sebastian-Fitzner/grunt-data-separator
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
			var commentOrRule = function (rule) {
				var strCss = '';
				if (rule.type === 'rule') {
					strCss += rules(rule);
				} else if (rule.type === 'comment') {
					strCss += processComment(rule) + '\n\n';
				}
				return strCss;
			};

			// Process media queries
			var processMedia = function (media) {
				console.log("media", media);
				var strCss = '';
				strCss += '@media ' + media.rule + ' {\n\n';

					media.rules.forEach(function (rule) {
						strCss += commentOrRule(rule);
					});
				strCss += '}\n\n';

				return strCss;
			};

			// Process separate media queries
			var processMediaData = function (media) {
				var strCss = '';
				strCss += '@media ' + media.rule + ' {\n\n';
					media.iconRules.forEach(function (rule) {
						strCss += commentOrRule(rule);
					});
				strCss += '}\n\n';

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
					var strMedia;
					var item;
					var iconStyles = [];
					var processedCSS = {};
					processedCSS.base = [];
					processedCSS.media = [];
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
							else if (rule.type == "media") {

								// Create 'id' based on the query (stripped from spaces and dashes etc.)
								strMedia = rule.media.replace(/[^A-Za-z0-9]/ig, '');

								// Create an array with all the media queries with the same 'id'
								item = processedCSS.media.filter(function (element) {
									return (element.val === strMedia);
								});

								// If there are no media queries in the array, define details
								if (item.length < 1) {
									var mediaObj = {};
									mediaObj.sortVal = parseFloat(rule.media.match(/\d+/g));
									mediaObj.rule = rule.media;
									mediaObj.val = strMedia;
									mediaObj.rules = [];
									mediaObj.iconRules = [];

									processedCSS.media.push(mediaObj);
								}

								// Compare the query to other queries
								var i = 0, matched = false;
								processedCSS.media.forEach(function (elm) {
									if (elm.val === strMedia) {
										matched = true;
									}
									if (!matched) {
										i++;
									}
								});

								// Push every merged query
								rule.rules.forEach(function (mediaRule) {
									if (mediaRule.type === 'rule' || 'comment') {
										mediaRule.declarations.forEach(function (rule) {
											if (rule.value.indexOf(options.indicator) > 0) {
												processedCSS.media[i].iconRules.push(mediaRule);
											} else {
												processedCSS.media[i].rules.push(mediaRule);
											}
										});
									}
								});

							}
						} else {
							console.log("Please set your indicator! These will be separated into your defined file.");
						}

					});

					// Function to output base CSS
					var outputBase = function (base) {
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

					// Function to output media queries
					var outputMedia = function (media) {
						media.forEach(function (item) {
							if (item.iconRules) {
								item.iconRules.forEach(function (el) {
									if (el.declarations) {
										el.declarations.forEach(function (rules) {
											if (rules.value.indexOf(options.indicator) > 0) {
												iconStyles += processMediaData(item);
											}
										});
									}
								});
							}
							if (item.rules) {
								item.rules.forEach(function (el) {
									if (el.declarations) {
										el.declarations.forEach(function (rules) {
											strStyles += processMedia(item);
										});
									}
								});
							}

						});
					};

					// Function to output data CSS
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
					// Check if media queries were processed and print them in order
					if (processedCSS.media.length !== 0) {
						outputMedia(processedCSS.media);
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
