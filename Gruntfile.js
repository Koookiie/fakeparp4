const sass = require('node-sass');

module.exports = function(grunt) {

	var rjsconfig = {
		baseUrl: "erigam/static/js",
		mainConfigFile: "erigam/static/js/config.js",
		name: "../vendor/almond/almond",
		include: "erigam",
		findNestedDependencies: true,
		out: "erigam/static/js/app.min.js"
	};

	grunt.initConfig({
		watch: {
			grunt: {
				files: ['Gruntfile.js'],
				tasks: []
			},
			js: {
				files: [
					'erigam/static/**/*.js',
					'!erigam/static/js/app.min.js'
				],
				tasks: ['requirejs']
			},
			css: {
				files: ['erigam/static/scss/**/*.scss'],
				tasks: ['sass', 'cssmin']
			}
		},
		requirejs: {
			compile: {
				options: rjsconfig
			}
		},
		sass: {
			options: {
				implementation: sass,
				sourceMap: false
			},
			dist: {
				files: [
					{"build/home.css": "erigam/static/scss/home.scss"},
					{"build/chat.css": "erigam/static/scss/chat.scss"}
				]
			}
		},
		cssmin: {
			target: {
				files: {
					'erigam/static/css/home.min.css': [
						'erigam/static/vendor/bootstrap/dist/css/bootstrap.min.css',
						'build/home.css'
					],
					'erigam/static/css/chat.min.css': [
						'build/chat.css'
					]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('default', ['requirejs', 'sass', 'cssmin']);
	grunt.registerTask('js', ['requirejs']);
	grunt.registerTask('css', ['sass', 'cssmin']);
};
