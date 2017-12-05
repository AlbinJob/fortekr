// grab the packages we need
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
cors = require('cors');

/*var connection = mysql.createConnection({
        host     : 'jun.cnpvqqpsoao7.us-west-2.rds.amazonaws.com',
        user     : 'wimtachjv',
        password : 'wimtachwi',
        database : 'tree',
}); */

var connection = mysql.createConnection({
        host: 'fortekdb.coi8gct3gevf.us-east-2.rds.amazonaws.com',
        user: 'javierkatz',
        password: 'ja812446',
        database: 'tree',
}); 

// var connection = mysql.createConnection({
//         host: 'fortekdb.coi8gct3gevf.us-east-2.rds.amazonaws.com',
//         user: 'javierkatz',
//         password: 'ja812446',
//         database: 'albin'
// });


var port = process.env.PORT || 5000;


app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
/*app.configure(function()
{
        app.use(express.bodyParser());
        app.use(app.router);
});*/

// app.use(function (req, res, next) {
//         res.header('Access-Control-Allow-Origin', "*");
//         res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//         res.header('Access-Control-Allow-Headers', 'Content-Type'); next();
// });

var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);

// routes will go here
app.get('/api/department', cors(), function (req, res) {

        connection.query('SELECT * FROM Departments ', function (err, rows, fields) {
                console.log('Connection result error ' + err);
                //console.log('no of records is ' + rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json' });

                res.end(JSON.stringify(rows));
                res.end();
        });



});

app.get('/api/position', cors(), function (req, res) {

        connection.query('SELECT Position_Id,Position_Name FROM Positions ', function (err, rows, fields) {
                console.log('Connection result error ' + err);
                console.log('no of records is ' + rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json' });

                res.end(JSON.stringify(rows));
                res.end();
        });



});

app.get('/api/user', cors(), function (req, res) {

        connection.query('SELECT id_user,name,email FROM users ', function (err, rows, fields) {
                console.log('Connection result error ' + err);
                //console.log('no of records is ' + rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json' });

                res.end(JSON.stringify(rows));
                res.end();
        });



});


// routes will go here
app.get('/api/login', cors(), function (req, res) {
        var user_id = req.param('user_id');
        var results;
        connection.query('SELECT user_id, name FROM t_user WHERE user_id IN (?)', [user_id], function (err, rows, fields) {
                console.log('Connection result error ' + err);
                console.log('no of records is ' + rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json' });

                res.end(JSON.stringify(rows));
                res.end();
        });



});

app.post('/api/search', cors(), function (req, res) {
        // var dte = req.param('dte');

        console.log(req.body);

        var dte = req.body.dte;


        //var results;
        connection.query('SELECT logtb.tmstp,logtb.sttus,logtb.mde,visitors1.name,visitors1.Dept_name,visitors1.id_visitor,visitors1.Access_id FROM logtb LEFT JOIN visitors1 ON visitors1.ID_card = logtb.rfid where visitors1.name is not null and logtb.tmstp  BETWEEN (?) AND (?) ', [dte, dte], function (err, rows, fields) {
                console.log('Connection result error ' + err);
                console.log('no of records is ' + rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json' });

                res.end(JSON.stringify(rows));
                res.end();
        });



});

app.get('/api/orgtree', cors(), function (req, res) {
        var deptid = req.param('deptid');

        connection.query('select Organization.Org_Name,users.Org_Id,Departments.Dept_Id,users.id_user,users.name,users.lastname,Positions.Position_Id,Positions.position_Name,Departments.Department_Name from users LEFT JOIN Positions on users.position_id = Positions.position_id Left Join Departments on users.dept_id=Departments.Dept_Id left join Organization on users.Org_Id=Organization.Org_Id', function (err, rows, fields) {
                var departments = Array();

                for (i = 0; i < rows.length; i++) {
                        if (getIndexOf(departments, "Department_Name", rows[i].Department_Name) < 0) {
                                departments.push({ "Dept_Id": rows[i].Dept_Id, "Department_Name": rows[i].Department_Name, "positions": [{ "Position_Id": rows[i].Position_Id, "position_Name": rows[i].position_Name, "users": [{ "user_id": rows[i].id_user, "name": rows[i].name, "lastName": rows[i].lastname }] }] });
                        } else {
                                var deptId = getIndexOf(departments, "Department_Name", rows[i].Department_Name);
                                var positionId = getIndexOf(departments[deptId].positions, "position_Name", rows[i].position_Name);

                                if (positionId < 0) {
                                        departments[deptId].positions.push({ "Position_Id": rows[i].Position_Id, "position_Name": rows[i].position_Name, "users": [{ "user_id": rows[i].id_user, "name": rows[i].name, "lastName": rows[i].lastname }] });
                                } else {
                                        departments[deptId].positions[positionId].users.push({ "user_id": rows[i].id_user, "name": rows[i].name, "lastName": rows[i].lastname });
                                }
                        }
                }

                var json1 = '{ "Organization" : "' + rows[1].Org_Name + '" , "Organization_id": "' + rows[1].Org_Id + '", "departments" : [';
                var departmentStr = "";

                for (i = 0; i < departments.length; i++) {
                        if (departmentStr != "") {
                                departmentStr += ', ';
                        }

                        departmentStr += '{ ' +
                                '"department_id" : ' + departments[i].Dept_Id + ', ' +
                                '"departmentName" : "' + departments[i].Department_Name + '", ' +
                                '"positions" : [';

                        var positions = "";
                        for (j = 0; j < departments[i].positions.length; j++) {
                                if (positions != "") {
                                        positions += ', ';
                                }

                                positions += '{' +
                                        '"position_id" : ' + departments[i].positions[j].Position_Id + ', ' +
                                        '"position_name" : "' + departments[i].positions[j].position_Name + '", ' +
                                        '"users" : [';

                                var users = "";
                                for (k = 0; k < departments[i].positions[j].users.length; k++) {
                                        if (users != "") {
                                                users += ', ';
                                        }

                                        users += '{' +
                                                '"user_id" : ' + departments[i].positions[j].users[k].user_id + ', ' +
                                                '"name" : "' + departments[i].positions[j].users[k].name + '", ' +
                                                '"lastName" : "' + departments[i].positions[j].users[k].lastName + '" }';
                                }

                                positions += users;
                                positions += "]}";
                        }

                        departmentStr += positions;
                        departmentStr += "]" +
                                "}";
                }

                departmentStr += "]}";
                json1 += departmentStr;

                console.log(json1);


                res.writeHead(200, { 'Content-Type': 'application/json' });

                var test = JSON.parse(json1);

                res.end(JSON.stringify(test));
                res.end();
        });



});

function getIndexOf(arrayObj, paramterName, valueToCompare) {
        for (var i = 0; i < arrayObj.length; i++) {
                if (arrayObj[i][paramterName] == valueToCompare) {
                        return i;
                }
        }

        return -1;
}


app.get('/api/superuser', cors(), function (req, res) {
        var deptid = req.param('deptid');

        connection.query('select Organization.Org_Name,users.Org_Id,Departments.Dept_Id,users.id_user,users.name,users.lastname,Positions.Position_Id,Positions.position_Name,Departments.Department_Name from users LEFT JOIN Positions on users.position_id = Positions.position_id Left Join Departments on users.dept_id=Departments.Dept_Id left join Organization on users.Org_Id=Organization.Org_Id', function (err, rows, fields) {
                var departments = Array();

                for (i = 0; i < rows.length; i++) {
                        if (getIndexOf(departments, "Department_Name", rows[i].Department_Name) < 0) {
                                departments.push({ "Dept_Id": rows[i].Dept_Id, "Department_Name": rows[i].Department_Name, "positions": [{ "Position_Id": rows[i].Position_Id, "position_Name": rows[i].position_Name, "users": [{ "user_id": rows[i].id_user, "name": rows[i].name, "lastName": rows[i].lastname }] }] });
                        } else {
                                var deptId = getIndexOf(departments, "Department_Name", rows[i].Department_Name);
                                var positionId = getIndexOf(departments[deptId].positions, "position_Name", rows[i].position_Name);

                                if (positionId < 0) {
                                        departments[deptId].positions.push({ "Position_Id": rows[i].Position_Id, "position_Name": rows[i].position_Name, "users": [{ "user_id": rows[i].id_user, "name": rows[i].name, "lastName": rows[i].lastname }] });
                                } else {
                                        departments[deptId].positions[positionId].users.push({ "user_id": rows[i].id_user, "name": rows[i].name, "lastName": rows[i].lastname });
                                }
                        }
                }

                var json1 = '{ "Organization" : "' + rows[1].Org_Name + '" , "Organization_id": "' + rows[1].Org_Id + '", "departments" : [';
                var departmentStr = "";

                for (i = 0; i < departments.length; i++) {
                        if (departmentStr != "") {
                                departmentStr += ', ';
                        }

                        departmentStr += '{ ' +
                                '"department_id" : ' + departments[i].Dept_Id + ', ' +
                                '"departmentName" : "' + departments[i].Department_Name + '", ' +
                                '"positions" : [';

                        var positions = "";
                        for (j = 0; j < departments[i].positions.length; j++) {
                                if (positions != "") {
                                        positions += ', ';
                                }

                                positions += '{' +
                                        '"position_id" : ' + departments[i].positions[j].Position_Id + ', ' +
                                        '"position_name" : "' + departments[i].positions[j].position_Name + '", ' +
                                        '"users" : [';

                                var users = "";
                                for (k = 0; k < departments[i].positions[j].users.length; k++) {
                                        if (users != "") {
                                                users += ', ';
                                        }

                                        users += '{' +
                                                '"user_id" : ' + departments[i].positions[j].users[k].user_id + ', ' +
                                                '"name" : "' + departments[i].positions[j].users[k].name + '", ' +
                                                '"lastName" : "' + departments[i].positions[j].users[k].lastName + '" }';
                                }

                                positions += users;
                                positions += "]}";
                        }

                        departmentStr += positions;
                        departmentStr += "]" +
                                "}";
                }

                departmentStr += "]}";
                json1 += departmentStr;

                console.log(json1);


                res.writeHead(200, { 'Content-Type': 'application/json' });

                var test = JSON.parse(json1);

                res.end(JSON.stringify(test));
                res.end();
        });



});

function getIndexOf1(arrayObj, paramterName, valueToCompare) {
        for (var i = 0; i < arrayObj.length; i++) {
                if (arrayObj[i][paramterName] == valueToCompare) {
                        return i;
                }
        }

        return -1;
}


app.post('/api/operator1', cors(), function (req, res) {

        var op_id = req.body.op_id;
        var op_name = req.body.op_name;
        var op_password = req.body.op_password;
        var userview = req.body.userview;
        var usermanipulation = req.body.usermanipulation;
        var schedulemanip = req.body.schedulemanip;
        var schesuleview = req.body.schesuleview;
        var access_record = req.body.access_record;
        var companyview = req.body.companyview;
        var compmanipula = req.body.compmanipula;
        var Visitorview = req.body.Visitorview;
        var Visitormanip = req.body.test;
        var systemsetting = req.body.systemsetting;
        var onetimelock = req.body.onetimelock;
        var emergencylock_unlock = req.body.emergencylock_unlock;





        //connection.query("INSERT INTO operator set ? ",data, function(err, rows){
        console.log(req.body.test);
        var sql = 'insert into operator (op_name,op_password,userview,usermanipulation,schedulemanip,schesuleview,access_record,companyview,compmanipula,Visitorview,Visitormanip,systemsetting,onetimelock,emergencylock_unlock) values ("' + op_name + '",' + op_password + ',' + userview + ',' + usermanipulation + ',' + schedulemanip + ',' + schesuleview + ',' + access_record + ',' + companyview + ',' + compmanipula + ',' + Visitorview + ',' + Visitormanip + ',' + systemsetting + ',' + onetimelock + ',' + emergencylock_unlock + ')';

        console.log(sql);
        var ch = connection.query(sql, function (err, rows) {

                if (err) {
                        console.log(err);

                }

                else {
                        console.log(ch);
                        console.log("Success!!!");
                        res.sendStatus(200);
                }


        });







});

app.post('/api/editoperator1', cors(), function (req, res) {



        var op_id = req.body.op_id;
        var op_name = req.body.op_name;
        var op_password = req.body.op_password;
        var userview = req.body.userview;
        var usermanipulation = req.body.usermanipulation;
        var schedulemanip = req.body.schedulemanip;
        var schesuleview = req.body.schesuleview;
        var access_record = req.body.access_record;
        var companyview = req.body.companyview;
        var compmanipula = req.body.compmanipula;
        var Visitorview = req.body.Visitorview;
        var Visitormanip = req.body.test;
        var systemsetting = req.body.systemsetting;
        var onetimelock = req.body.onetimelock;
        var emergencylock_unlock = req.body.emergencylock_unlock;





        //connection.query("INSERT INTO operator set ? ",data, function(err, rows){
        console.log(req.body.test);

        var sql = 'update operator set  op_name="' + op_name + '",op_password=' + op_password + ',userview=' + userview + ',usermanipulation=' + usermanipulation + ',schedulemanip=' + schedulemanip + ',schesuleview=' + schesuleview + ',access_record=' + access_record + ',companyview=' + companyview + ',compmanipula=' + compmanipula + ',Visitorview=' + Visitorview + ',Visitormanip=' + Visitormanip + ',systemsetting=' + systemsetting + ',onetimelock=' + onetimelock + ',emergencylock_unlock=' + emergencylock_unlock + ' where op_id=' + op_id + '';

        console.log(sql);
        connection.query(sql, function (err, rows) {

                if (err) {
                        console.log(err);
                        // return next("Mysql error, check your query");
                }

                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }


        });







});

app.post('/api/operator124', function (req, res) {

        var op_name = req.body.op_name;

        console.log(op_name);
        connection.query('insert into op1 (op_val) values (' + op_name + ')', function (err, rows) {

                if (err) {
                        console.log(err);

                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });

});


app.post('/api/operator', function (req, res) {


        var data = {
                name: req.body.name,
                password: req.body.password
        };

        connection.query("INSERT INTO addop set ? ", data, function (err, rows) {

                if (err) {
                        console.log(err);
                        //return next("Mysql error, check your query");
                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });

});


app.post('/api/adduser', function (req, res) {


        var data = {

                name: req.body.name,
                lastname: req.body.lastname,
                Dept_Id: req.body.Dept_Id,
                ID_card: req.body.ID_card,
                Position_Id: req.body.Position_Id,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                image: req.body.image,
                access: req.body.access,
                ManagerPrivellege: req.body.ManagerPrivellege,
                accessgroup: req.body.accessgroup,
                Password: req.body.Password,


        };
        console.log(data);
        console.log(err);

        connection.query("INSERT INTO usersin set ? ", data, function (err, rows) {
                console.log(data);

                if (err) {
                        console.log(err);

                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });



});

app.post('/api/edituser', function (req, res) {

        var id_user = req.body.id_user;

        var data =
                {
                        name: req.body.name,
                        lastname: req.body.lastname,
                        Dept_Id: req.body.Dept_Id,
                        ID_card: req.body.ID_card,
                        Position_Id: req.body.Position_Id,
                        email: req.body.email,
                        phone: req.body.phone,
                        address: req.body.address,
                        image: req.body.image,
                        access: req.body.access,
                        ManagerPrivellege: req.body.ManagerPrivellege,
                        accessgroup: req.body.accessgroup,
                        Password: req.body.Password
                };

        connection.query("update  usersin set ? WHERE id_user = ?", [data, id_user], function (err, rows) {

                if (err) {
                        console.log(err);

                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });



});

app.delete('/api/deleteuser', function (req, res) {

        var id_user = req.body.id_user;


        var sql = connection.query("DELETE FROM  usersin WHERE id_user = ?", [id_user], function (err, rows) {
                console.log(sql);
                if (err) {
                        console.log(err);
                }
                else {
                        console.log(sql);
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });



});

app.post('/api/access', function (req, res) {

        //var id_user = req.body.id_user;


        var sql = connection.query('SELECT door_label,Door_id FROM Doors', function (err, rows) {
                // console.log(sql);

                if (err) {
                        console.log(err);

                }
                else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });

                        res.end(JSON.stringify(rows));
                        console.log("Success!!!");
                        res.end();
                }
        });



});

app.post('/api/accessgroup', function (req, res) {

        //var id_user = req.body.id_user;


        var sql = connection.query('select access_groupid,access_groupname from access_group', function (err, rows) {
                // console.log(sql);

                if (err) {
                        console.log(err);

                }
                else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });

                        res.end(JSON.stringify(rows));
                        console.log("Success!!!");
                        res.end();
                }
        });



});

app.post('/api/accessschedule', function (req, res) {

        //var id_user = req.body.id_user;


        var sql = connection.query('select * from access_schedule', function (err, rows) {
                // console.log(sql);

                if (err) {
                        console.log(err);

                }
                else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });

                        res.end(JSON.stringify(rows));
                        console.log("Success!!!");
                        res.end();
                }
        });



});

app.post('/api/opauthpass', function (req, res) {

        console.dir("Started call");
        // var awsIot = require('aws-iot-device-sdk');

        // var device = awsIot.device({
        //         keyPath: 'C:/Users/albinjob/Desktop/fortekMQTT/roy2/private.pem',
        //         certPath: 'C:/Users/albinjob/Desktop/fortekMQTT/roy2/cert.pem',
        //         caPath: 'C:/Users/albinjob/Desktop/fortekMQTT/roy2/rootCA.pem',
        //         clientId: 'FRDM',
        //         host: 'a2x46uxobmyiuz.iot.us-east-2.amazonaws.com'
        // });

        // device
        //         .on('connect', function () {
        //                 device.subscribe('topic1');

        //                 device.subscribe(req.body.orgid);

        //                 device.publish(req.body.orgid, JSON.stringify(data));

        //         });

        // device
        //         .on('message', function (topic, payload) {

        //                 console.log('message', topic, payload.toString());

        //         });

        var data = {

                orgid: req.body.orgid,
                lokunlokpass: req.body.lokunlokpass
        };
        console.log(data);

        connection.query("INSERT INTO locunlocpass set ? ", data, function (err, rows) {

                if (err) {
                        console.log(err);

                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });
        
});

app.post('/api/lockeypadsec', function (req, res) {


        var data = {

                orgid: req.body.orgid,
                doori_d: req.body.doori_d,
                activated: req.body.activated,
                failedattempts: req.body.failedattempts,
                blocktime: req.body.blocktime
        };
        console.log(data);
        connection.query("INSERT INTO lockeypadsec set ? ", data, function (err, rows) {

                if (err) {
                        console.log(err);

                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });





});

app.post('/api/unloctimesec', function (req, res) {


        var data = {

                orgid: req.body.orgid,
                door_id: req.body.door_id,
                door_label: req.body.door_label,
                unlocktime: req.body.unlocktime,

        };
        console.log(data);
        connection.query("INSERT INTO unloctimesetting set ? ", data, function (err, rows) {

                if (err) {
                        console.log(err);

                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                }
        });





});

app.post('/api/adduser1', function (req, res) {


        var data = {

                name: req.body.name,
                lastname: req.body.lastname,
                Dept_Id: req.body.Dept_Id,
                ID_card: req.body.ID_card,
                Position_Id: req.body.Position_Id,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                image: req.body.image,
                access: req.body.access,
                ManagerPrivellege: req.body.ManagerPrivellege,
                accessgroup: req.body.accessgroup,
                Password: req.body.Password,


        };
        //console.log(err);

        connection.query("INSERT INTO usersin set ? ", data, function (err, rows) {


                if (err) {
                        console.log(err);

                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                        connection.query("INSERT INTO usersin set ? ", data, function (err, rows) {

                                if (err) {
                                        //console.log(err);

                                }
                                else {
                                        console.log("Success!!!");
                                        res.sendStatus(200);
                                }
                        });
                }
        });



});

app.post('/api/register1', function (req, res) {
        var data = {
                org_name: req.body.txtorgname,
                orgcategory_name: req.body.txtorgcategory,
                email_id: req.body.txtorgemail,
                password1: req.body.txtorgpassword2
        };
        
        connection.query("INSERT INTO masterlogin11 set ? ", data, function (err, rows) {
                if (err) {
                        console.log(err);
                }
                else {
                        console.log("Success!!!");
                        res.sendStatus(200);
                        connection.query("INSERT INTO usersin set ? ", data, function (err, rows) {
                                if (err) {
                                        //console.log(err);
                                }
                                else {
                                        console.log("Success!!!");
                                        res.sendStatus(200);
                                }
                        });
                }
        });



});

app.post('/api/login1', function (req, res) {


        console.log(req.body);
         var email_id = req.body.txtorgemail;
         var password1 = req.body.txtorgpassword2;
      
// console.log('no of records is ' + email_id);
// console.log('no of records is ' + password1);        
//         connection.query('select org_name,orgcategory_name,email_id from masterlogin11 where email_id in (?) and password1 in(?) ',[email_id,password1], function (err, rows, fields) {
                
//                 console.log('no of records is ' + email_id);
// console.log('no of records is ' + password1); 

//                 console.log('Connection result error ' + err);
//                 console.log('no of records is ' + rows);
//                 console.log('no of records is ' + rows.length);
//                 console.log('no of records is ' + fields.length);
//                 //console.log('no of records is '+fields.length);

//                 res.writeHead(200, { 'Content-Type': 'application/json' });

//                 res.end(JSON.stringify(rows));
//                 res.end();
//         });



});
app.post('/api/login2', function (req, res) {

        //var id_user = req.body.id_user;
         var email_id = req.body.txtorgemail;
         var password1 = req.body.txtorgpassword2;

console.log(req.body);

        connection.query('update masterlogin11 set token=md5(concat(?, now())) where email_id=?',[email_id,email_id], function (err, rows) {
                
        });

        connection.query('select org_id,org_name,orgcategory_name,email_id,token from masterlogin11 where email_id=? and password1=?',[email_id,password1], function (err, rows) {
                // console.log(sql);

                if (err) {
                        console.log(err);

                }
                else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });

                        res.end(JSON.stringify(rows));
                        
                        console.log("Success!!!");
                        res.end();
                }
        });



});



app.get('/', function (req, res) {
        res.sendStatus('Front End APIs ');
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);