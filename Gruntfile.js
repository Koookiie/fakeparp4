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
			}
		},
		requirejs: {
			compile: {
				options: rjsconfig
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	grunt.registerTask('default', ['requirejs']);
};
