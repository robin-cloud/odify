var _= require('underscore');
var async = require('async'); 
var path = require('path');
var oddb = require('./oddb');
var odutil = require('./odutil');

module.exports = function(req, res){
    var p = res.locals.odify || {};
    var meta = p.meta || {};
    var isLst = !meta['package'] ? true : (_.compact( _.values(meta) ).length < 3);
    var dataset = {};
    
    async.auto({
        find : function(cb){
            console.log( 'tag:find' );

            oddb.count(meta, function(err, rep){
                dataset['total'] = rep;
                console.log( rep );
                cb(err, rep); 
            });
        },
        record : function(cb){ 
            console.log( 'tag:record' );
            oddb.record(meta, cb);
        },
        lst : ['find', function(cb, res){
            if ( !isLst ) { return cb(null, res); }
            console.log( 'tag:lst' );
        }],

        cat : ['find', function(cb, res){
            if ( isLst ) { return cb(null, res); }
                
            console.log( 'tag:cat' );
        }],

        print : ['list', 'cat', function(cb, res) { 
            console.log( 'tag:print' );
            var num = res.find;
            if ( num > 0) { 
            console.log( res.find );
            } else {
            console.log( 'not found' );
            }
            cb();
        }]
    }, function(err, res){ 
        console.log( 'tag:err or fin'+ res );
        if (err) console.log( 'err::'+ err );
      //  oddb.close();
    });

//  if ( p['package'] ) {}

//res.locals.store = path.join(__dirname , 'store');
console.log( 'r' );
res.send(JSON.stringify(meta));
};
