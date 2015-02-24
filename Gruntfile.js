module.exports = function ( grunt ) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	var taskConfig = {
		jshint: {
			src: ['js/ChatClientModuleConfig.js', 'js/LoginController.js', 'js/RoomsController.js', 'js/RoomController.js', 'js/contains.js', 'gulpfile.js', 'Gruntfile.js'],
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
