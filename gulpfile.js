var gulp = require('gulp'),
		uglify = require('gulp-uglify'),
		concat = require('gulp-concat'),
		notify = require('gulp-notify');

gulp.task('js', function(){
	return gulp.src(['./vendor/jquery/dist/jquery.min.js', './vendor/angular/angular.min.js', './vendor/angular-route/angular-route.min.js', './js/socket.io.min.js', './js/ChatClientModuleConfig.js', './js/socket-factory.js', './js/LoginController.js', './js/RoomsController.js', './js/RoomController.js', './js/contains.js']) 
		.pipe(concat('app.js')) 
		//.pipe(uglify()) 
		.pipe(gulp.dest('build'))
		.pipe(notify({ message: 'Finished minifying'}));
});

gulp.task('default', function(){
	gulp.run('js');
});
