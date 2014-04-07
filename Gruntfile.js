module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    typescript: {
      base: {
        src: [
				'src/Typings/*.d.ts',
				'src/Base.ts',
				'src/TriggerMethod.ts',
				'src/Utils.ts',
				'src/KoMapping.ts',
				'src/View.ts',
				'src/Application.ts',
				'src/Collection.ts',
				'src/Model.ts',
				'src/Service.ts'
			],
        dest: 'Dist/knockbone.js',
        options: {
          target: 'es3',
          sourceMap: true,
          fullSourceMapPath: false,
          declaration: true,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-typescript');

  // Default task(s).
  grunt.registerTask('default', ['typescript']);

};