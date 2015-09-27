requirejs.config({
	baseUrl: '/static/js',
	paths: {
		'jquery': '../vendor/jquery/dist/jquery.min',
		'handlebars': '../vendor/handlebars/handlebars.amd',
		'bootstrap': '../vendor/bootstrap/dist/js/bootstrap.min'
	},
	shim: {
		bootstrap: {
			deps: ['jquery']
		}
	}
});
