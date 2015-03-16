'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('puppetglasses.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      distjs: {
        src: ['src/js/config.js',
	      'src/js/statistics.js',
	      'src/js/nodes.js',
	      'src/js/<%= pkg.name %>.js'],
        dest: 'dist/js/<%= pkg.name %>.js'
      },
      distcss: {
        src: ['src/css/<%= pkg.name %>.css',],
        dest: 'dist/css/<%= pkg.name %>.css'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.distjs.dest %>',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      },
    },
    bower_concat: {
      all: {
	dest: 'dist/js/_deps.js',
	cssDest: 'dist/css/_deps.css',
	dependencies: {
	  'dataTables.bootstrap': 'datatables'
	},
	mainFiles: {
	  'jquery-ui': [ 'themes/base/jquery-ui.min.css', 'jquery-ui.min.js']
	}
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    compress: {
      main: {
	options: {
	  archive: 'puppetglasses-<%= pkg.version %>.zip'
	},
	files : [
	  { src: ['index.html', 'dist/**'], dest: 'puppetglasses-<%= pkg.version %>/'}
	]
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },
    },
    copy: {
      main: {
	files: [
	  { expand: true, flatten: true, src: ['bower_components/datatables/media/images/*'], dest: 'dist/images/' }
	]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-bower-concat');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'concat', 'bower_concat', 'copy', 'uglify']);

};
