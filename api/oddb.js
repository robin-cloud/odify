var fs = require('fs');
var path = require('path');
var util = require("util");
var redis = require('redis');
var async = require('async');
var _ = require('underscore');
var odutil = require('./odutil');

(function(){
  var client = redis.createClient();
    client.on("error", function (err) {
          console.log("Error " + err);
    });
// start

  var oddb = {
    open : function() {
      client = client || redis.createClient();
    },

    close : function() {
      client && client.quit();
    },
// function
    count : function(meta, cb) {
        var args = 0;
        if ( !_.isObject(meta) )  { return cb(null, args); }
        if ( _.isArray(meta) ||
             _.isFunction(meta) || 
             _.isEmpty(meta) ) { return cb(null, args); }
      
        var qy = odutil.qyparse(meta); 
        var qp = odutil.prefix('qy:'+odutil.qypath(meta));
        client.sinterstore(qp, qy, cb);
    // Optimization
    // if ( !exists || exists > time ) then todo else get SCARD
    },

    record : function(meta, cb) {
        if ( !_.isObject(meta) )  { return cb(null, args); }
        if ( _.isArray(meta) ||
             _.isFunction(meta) ) { return cb(null, args); }

        var qp = odutil.qypath(meta); 
        client.zincrby( odutil.prefix('top:qy'), 1, qp, cb);
      
    },

    getObj : function(meta, cb) {
      var args = [];

      if ( !_.isObject(meta) || _.isEmpty(meta) ) { return cb(null, args); }

      for (var k in meta) {
        args[args.length] = odutil.prefix(k+':'+meta[k]);
      }
      this.open();
      client.sinter(args, cb);
    },

    setObj : function(meta, data, cb) {
      var hashcode = odutil.hashcode(data);
      var oid = odutil.prefix('oid:'+hashcode);
      var fp = odutil.path(hashcode);
      
      this.open();
      // atomic 
      async.auto( {
          find : function(cb) {
              client.exists(oid, function(err, rep) {
                  if (err) { return cb(err); }
                  rep? cb('found '+oid) : cb(); 
              });
          },
      // del
          del : ['find', function(cb) { 
              oddb.delObj(meta, cb);
          }],   
      // add to db
          addOid : ['del', function(cb) {
              client.hmset( oid, meta, cb );
          }],
          addTag : ['del', function(cb) {
              async.each( Object.keys(meta), function(k, cb){
                     client.sadd(odutil.prefix(k+':'+meta[k]), hashcode, cb);
                  }, function(err){
                     if (err) { return cb(err); }
                     cb();
              });
          }], 
      // add to fs
          addFile : ['del', function(cb) {
              fs.exists(fp, function (exists) {
                  if (exists) { return cb(); }
                  odutil.mkdir_p(fp);
                  fs.writeFile( path.join(fp, meta['package']+'.json' ), JSON.stringify(data), cb );
              });
          }]
      }, function(err, results){
         if (err) { cb(err); }
         cb();
      });
      return;
    },

    delObj : function(meta, cb){
        this.getObj(meta, function(err, rep){
            if (err) {  return cb(err);  }
            
            for (var i=0, l=rep.length; i>l; i++) {
                
                var expired = rep[i];
                if (!expired) { continue; }

                var oid = odutil.prefix('oid:'+expired);
                var fp = odutil.path(expired);
        // del from db
                client.hgetall( oid, function(err, reply) {
                    if (err) { return cb(err); }

                    for ( var k in reply ) {
                        client.srem( odutil.prefix(k+':'+reply[k]), expired);
                    }
                    client.del(oid);
                });
        // del from fs
                fs.exists(fp, function (exists) {
                    if (exists) {
                        odutil.rmdir_r(fp);
                    }
                });
            }
         });

         return cb();
    }
  };

//  oddb.setObj([],'');
  module.exports = oddb;
}())
