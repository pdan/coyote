'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt, {
    pattern: [ // '@*/grunt-*', 'assemble-less',
      'grunt-*'
    ]
  });

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Project settings
    app: {
      public: 'public'
    },

    uglify: {
      dist: {
        files: {
          '<%= app.public %>/js/build.min.js': [
            '<%= app.public %>/js/build.js'
          ]
        }
      }
    },

    filerev: {
      options: {
        algorithm: 'md5',
        length: 8
      },
      buildJS: {
        src: '<%= app.public %>/js/build.min.js'
      }
    },

    shell: {
      options: {
        stderr: false
      },
      jspm: {
        command: 'jspm bundle-sfx js/index.js <%= app.public %>/js/build.min.js'
      }
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          '<%= app.public %>/css/build.css': [
            '<%= app.public %>/css/master.css',
            '<%= app.public %>/packages/github/twbs/bootstrap@3.3.5/css/bootstrap.min.css',
            '<%= app.public %>/packages/github/fezVrasta/bootstrap-material-design@0.3.0/dist/css/material-fullpalette.min.css'
          ]
        }
      }
    },

    htmlbuild: {
      main: {
        src: 'views/index.html',
        dest: 'views/build',
        options: {
          beautify: true,
          prefix: '/js',
          relative: false,
          scripts: {
            buildJS: {
              cwd: '<%= app.public %>/',
              files: 'js/build.*.js'
            }
          },
          styles: {
            buildCSS: {
              cwd: '<%= app.public %>/',
              files: 'css/build.css'
            }
          }
        }
      },
      signup: {
        src: 'views/signup.html',
        dest: 'views/build',
        options: {
          beautify: true,
          prefix: '/js',
          relative: false,
          scripts: {
            buildJS: {
              cwd: '<%= app.public %>/',
              files: 'js/build.*.js'
            }
          },
          styles: {
            buildCSS: {
              cwd: '<%= app.public %>/',
              files: 'css/build.css'
            }
          }
        }
      }
    },

    clean: {
      first: ['<%= app.public %>/js/build.*js*'],
      last: [
        '<%= app.public %>/js/build.js',
        '<%= app.public %>/js/build.min.js'
      ]
    }
  });

  grunt.registerTask('build', 'Build product',
    function() {
      grunt.task.run([
        'clean:first',
        'shell:jspm',
        // 'uglify',
        'filerev:buildJS',
        'htmlbuild',
        'clean:last',
        'cssmin'
      ]);
    });

  grunt.registerTask('default', []);
};
