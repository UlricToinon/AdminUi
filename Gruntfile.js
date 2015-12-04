module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),

    compass: {
      dist: {
        options: {
          config: 'config/compass.rb'
        }
      },

      dev: {
        options: {
          config: 'config/compass.rb',
          watch: true
        }
      }
    }
  });
 
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
 
  // Default task(s).
  grunt.registerTask('default', ['compass:dev']);
};