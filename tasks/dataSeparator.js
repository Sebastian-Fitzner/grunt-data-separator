/*
 * data-separator
 * https://github.com/Sebastian-Fitzner/grunt-data-separator
 *
 * Copyright (c) 2014 Sebastian Fitzner
 * Licensed under the MIT license.
 *
 */

'use strict';
var postcss = require('postcss');

module.exports = function (grunt) {
	grunt.registerMultiTask('dataSeparator', 'Split up your Data-Uri into a separate CSS file.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			pattern: {
				match: false, // The RegExp to match selectors with
				matchParent: true // Should child declarations (eg. in @media blocks) include their parent node.
			},
			remove: true, // Should we strip the matched rules from the src style sheet?
			output: false // output file 'false' by default
		});

		var pattern = {};
		var modCSS = postcss.root();

		if (options.pattern instanceof RegExp) {
			pattern.match = options.pattern;
			pattern.matchParent = false;
		} else {
			pattern = options.pattern;
		}

		// Our postCSS process
		var process = postcss(function (css) {
			if (pattern.match) {
console.log("pattern", pattern.match);
				css.eachRule(function (rule) {
					var parent;

					rule.eachDecl(function (declaration) {

						if (declaration._value.match(pattern.match)) {
							if (options.remove) {
								rule.removeSelf();
							}
							if (pattern.matchParent) {
								parent = rule.parent.clone();

								if ('media' === parent.name) {
									parent.eachRule(function (childRule) {
										childRule.removeSelf();
									});
									parent.append(rule);
									modCSS.append(parent);
								} else {
									modCSS.append(rule);
								}
							} else {
								modCSS.append(rule);
							}
						}
					});

				});
			}
		});

		// Iterate over all specified file groups.
		this.files.forEach(function (f) {
			var src = f.src.filter(function (filepath) {
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			}).map(function (filepath) {
					// Read file source.
					var css = grunt.file.read(filepath),
						processOptions = {},
						output;

					processOptions.from = filepath;
					processOptions.to = f.dest;

					// Run the postprocessor
					output = process.process(css, processOptions);

					if (options.output && output.map && output.map.length > 0) {
						grunt.log.writeln('Sourcemap "' + options.output + '" created.');
						grunt.file.write(f.dest + '.map', output.map);
					}

					return output.css;
				});

			// Write the newly split file.
			if (options.output) {
				grunt.file.write(options.output, modCSS);
			}

			// Write the destination file
			grunt.file.write(f.dest, src);

			// Print a success message.
			if (options.output) {
				grunt.log.writeln('File "' + options.output + '" created.');
			}
			grunt.log.writeln('File "' + f.dest + '" created.');
		});
	});
};