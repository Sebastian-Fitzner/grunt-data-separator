# grunt-data-separator

> Split up your Data-URI (or anything else) into a separate CSS file.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-data-separator --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-data-separator');
```

## The "dataSeparator" task

### Overview
In version 0.1.* the whole rule with a matched value will be duplicated.

In your project's Gruntfile, add a section named `dataSeparator` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	dataSeparator: {
		icons: {
			options: {
				pattern: {
					matchValue: /data/, // The RegExp to match values with
					matchRule: false, // The RegExp to match values with
					matchParent: true // Rules (eg. in @media blocks) include their parent node.
				},
				output: 'tmp/styles.icons.css'
			},
			files: {
				'tmp/styles.css': ['test/fixtures/source.css']
			}
		}
	}
})
```

### Options

#### options.pattern.matchValue
Type: `String`
Default value: /data:/

A string value that is used to set the value your are searching for in your css.

#### options.pattern.matchRule
Type: `String`
Default value: false

A string value that is used to set the rule your are searching for in your css.

#### options.pattern.matchParent
Type: `Boolean`
Default value: true

A boolean value that is used to include/exclude the rules parent node (eg. in @media blocks).

#### options.output
Type: `String`
Default value: ''

A string value which needs a path and filename (eg. in tmp/styles.icons.css).

### Usage Examples
In this example, the default options are used to get two files which are generated to the specific folder. So if the `source.css` file has the content

```css
a.top {
background-repeat: no-repeat;
}
a.top {
background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fx.....");
}
```
the generated result would be that there are now two files. One which has the standard styles, the second with your data-uris:

*styles.css*
```css
a.top {
background-repeat: no-repeat;
}
```
*styles.icons.css*
```css
a.top {
background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20v.......");
}
```

#### Match Rules
In this example, custom options are used to get two files which are generated to the specific folder:

```js
grunt.initConfig({
	dataSeparator: {
		ie8: {
			options: {
				pattern: {
					matchValue: false, // The RegExp to match values with
					matchRule: /lt-ie9/, // The RegExp to match values with
					matchParent: true // Rules (eg. in @media blocks) include their parent node.
				},
				output: 'tmp/styles.ie8.css'
			},
			files: {
				'tmp/styles.css': ['test/fixtures/source.css']
			}
		}
	}
})
```

So if the `source.css` file has the content

```css
.lt-ie9 a.top {
background-repeat: no-repeat;
}
a.top {
background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fx.....");
}
```
the generated result would be that there are now two files. One which has the standard styles, the second with your data-uris:

*styles.css*
```css
a.top {
background-repeat: no-repeat;
}
```
*styles.ie8.css*
```css
.lt-ie9 a.top {
background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20v.......");
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Sebastian Fitzner. Licensed under the MIT license.
