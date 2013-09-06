var SHA3 = require('sha3');
var fs = require('fs');
var path = require('path');
var async = require('async');
var exec = require( 'child_process' ).exec;
var cctlds = require('./cctlds');
var gplist = require('./gplist');

(function(){

var util = {
  qypath : function(meta) {
      var p = [];
      p[0] = cctlds[meta['country']]? meta['country'] : null; 
      p[1] = gplist[meta['group']]? meta['group'] : null;
      p[2] = meta['title'];
      p[3] = meta['package'];

      return p.join('.');
  },

  qyparse : function(meta) {
      var p = [];
      for (var k in meta) {
          if (meta[k]) {
              p[p.length] = this.prefix(k+':'+meta[k]);
          }
      }

      return p;
  },
 
  hashcode : function(data) { 
          return new SHA3.SHA3Hash(256).update(JSON.stringify(data)).digest('hex');
      },

  mkdir_p : function(dirPath, mode) {
      var p =  path.dirname(dirPath);
        if ( fs.existsSync( p ) ) {
          fs.mkdirSync(dirPath, mode);
        } else {
          this.mkdir_p(p, mode);
          this.mkdir_p(dirPath, mode);
        } 
      },

  rmdir_r : function(dirPath){
        if ( fs.existsSync( dirPath ) && this.isDir(dirPath)) {
          exec( 'rm -rf '+dirPath );
        }
  },
  isDir : function(dirPath) {
      return fs.statSync(dirPath).isDirectory();
  },
  pre : 'odify',
  suf : 'end',

  prefix : function(str) {
          return this.pre+':'+str;
      },

  path : function(oid) { 
    return path.join('/data/odify/store', oid.substr(0,3), oid);
  }

  };
  
  module.exports = util;

}())
