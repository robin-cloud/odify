var _= require('underscore');
var path = require('path');
var cctlds = require('./cctlds');
var gplist= require('./gplist');

module.exports = function(req, res, next){
    var p = {};
    var q = req.query;
    var x = req.path.toLowerCase().split('/');
  
    q['tp'] = q['tp'] && q['tp'].toLowerCase() || 'json';
    q['qy'] = q['qy'] || '';
    q['df'] = (q['df'] !== void 0) && 
              (!q['df'] ||
              (q['df'].charAt(0) !== '-' && 
              '0,f,false'.indexOf(q['df'].toLowerCase()) === -1));
// get api version
    if ( req.method === 'GET' && !q['df'] ) {
        res.charset = res.charset || 'utf-8';
        switch (q['tp']) {
          case 'csv' :
            res.set('Content-Type', 'text/plain');
           //res.set('Content-Type', 'text/csv'); // file
            break;
          case 'xml' :
            res.set('Content-Type', 'text/xml');
            break;
          default:
            q['tp'] = 'json';
            break;
        }
    }


    x.shift();
    if ( /^\d+$/.test(x[0]) ) {
        x.shift();
    }
    x = _.compact(x);

    if ( x.length !== 0) { 
// 0: country
        if ( gplist[x[0]] || x[0] === void 0) {
            x.unshift(null);
        }
// 1: group  
        if ( !gplist[x[1]] ) {
            x.splice(1, 0, null);
        }
// 2: title, 3: package 
        p['country'] = cctlds[x[0]]? x[0] : null;
        p['group']   = gplist[x[1]]? x[1] : null;
        p['title']   = x[2] || null;
        p['package'] = x[3] || null;
    }
//  res.locals.store   = path.join(__dirname , 'store');
    res.locals.odify = res.locals.odify || {};
    res.locals.odify.meta = p; 

    return next();
};
