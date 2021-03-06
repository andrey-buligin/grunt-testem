/*
 * grunt
 * https://github.com/cowboy/grunt
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

module.exports = function(grunt) {
  "use strict";

  var exec = require('child_process').exec,
      async = require('async'),
      _ = require('underscore'),
      testemMulti = require('testem-multi'),
      fs = require('fs');

  grunt.registerMultiTask( 'testem', 'Execute testem.', function() {
    var done = this.async(),
      that = this,
      options = this.options(),
      tap;

    if(options.json){
      options = _.extend({}, JSON.parse( fs.readFileSync(options.json, 'utf-8').replace(/\n/,'')), options);
    }
    tap = options.tap;
    options.files = grunt.file.expand(options.files);

    grunt.log.writeln('Now testing...');
    testemMulti.exec(options);
    testemMulti.on('data', function( data ){
      grunt.verbose.write(''+data);
    });
    testemMulti.on('exit', function( results, memo ){
      var tests = memo.tests,
          pass = memo.pass,
          not = memo.not,
          fail = memo.fail;

      if(tap){
        fs.writeFileSync(tap, results, 'utf-8');
      }
      if( tests != pass ||
          fail ) {
        grunt.log.error(not.join('\n'));
        grunt.log.error(''+fail+'/'+tests+' assertions failed');
        done(false);
      } else {
        grunt.log.ok(''+tests+' assertions passed');
        done(true);
      }
    });

  });

};
