
var soap = require('soap');
var async = require('async');

var odutil = require('./odutil'); 
var oddb = require('./oddb'); 


var url = 'http://www.czone2.tcg.gov.tw/link_ws/TFD/Religion4Opendata.cfc?wsdl';
var args = '<mns:getEmp xmlns:mns="http://TFD.link_ws" soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"></mns:getEmp>';


soap.createClient(url, function(err, client) {
    var meta = {'country' : 'tw', 'group' : 'gov', 'title' : 'taipei', 'package' : 'temple'};

   async.auto({
        catchData : function(cb){
            client.getEmp(args, function(err, result) {
                var data = result.getEmpReturn.TpReligion.GARDENREC;
                cb(null, data);
            });
        }, 
        open : function(cb){
            oddb.open();
            cb();  
        },
        modify : ['catchData', 'open', function(cb, res) {
            oddb.setObj(meta, res['catchData'], cb);  
        }]
        
      }, function(err){ 
           if (err) { console.log('@@'+err); }
           oddb.close();
    }); 
      
/*      
      csv( {
      data : result.getEmpReturn.TpReligion.GARDENREC, 
      options : {
          delimiter : ',',
          empty : '',   
          ignorecase : true ,
          fields :[ { name : 'SNO',                              label : 'SNO' },
                    { name : 'RELIGION_TYPE',                    label : 'RELIGION_TYPE' },
                    { name : 'CB_NAME',                          label : 'CB_NAME'},
                    { name : 'CB_SNAME',                         label : 'CB_SNAME'},
                    { name : 'PTNAME1',                          label : 'PTNAME1'},
                    { name : 'V_NAME',                           label : 'V_NAME'},
                    { name : 'CB_REG_TITLE',                     label : 'CB_REG_TITLE'},
                    { name : 'CB_PRESIDENT_NAME|PRESIDENT_NAME', label : 'CB_PRESIDENT_NAME'},
                    { name : 'CB_TEL',                           label : 'CB_TEL'},
                    { name : 'TOTAL_ADDR',                       label : 'TOTAL_ADDR'},
                    { name : 'R_STREET',                         label : 'R_STREET'},  
                    { name : 'R_SECTION',                        label : 'R_SECTION'},
                    { name : 'R_LANE',                           label : 'R_LANE'},
                    { name : 'R_ALLEY',                          label : 'R_ALLEY'},
                    { name : 'R_NO',                             label : 'R_NO'},
                    { name : 'R_OTHER',                          label : 'R_OTHER'},
                    { name : 'X',                                label : 'X'},  
                    { name : 'Y',                                label : 'Y'},
                    { name : 'DATA_STR',                         label : 'DATA_STR'},
                    { name : 'REG_NO',                           label : 'REG_NO'} ]
               } 
           }, function(err, csv) {
            if (err) console.log(err);
               console.log(csv);
       });
 })*/
});

