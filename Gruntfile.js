module.exports = function ( grunt ) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	var taskConfig = {
		jshint: {
			src: ['js/app.js'],
			Gruntfile: ['Gruntfile.js'],
			options: {
				globals: {
					jQuery: true,
					$: true
				}
			}
		}
	};
	grunt.initConfig(taskConfig);
	grunt.registerTask('default', ['jshint']);
};
