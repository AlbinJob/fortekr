// grab the packages we need
var express = require('express');
var app = express();
var mysql = require('mysql');
var connection = mysql.createConnection({
        host     : 'jun.cnpvqqpsoao7.us-west-2.rds.amazonaws.com',
        user     : 'wimtachjv',
        password : 'wimtachwi',
        database : 'tree',
});


var port = process.env.PORT || 5000;


// routes will go here
app.get('/api/department', function(req, res) {

connection.query('SELECT * FROM Departments ', function(err, rows, fields)
        {
                console.log('Connection result error '+err);
                console.log('no of records is '+rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json'});

                res.end(JSON.stringify(rows));
                res.end();
        });



});
                 
app.get('/api/position', function(req, res) {

connection.query('SELECT Position_Id,Position_Name FROM Positions ', function(err, rows, fields)
        {
                console.log('Connection result error '+err);
                console.log('no of records is '+rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json'});

                res.end(JSON.stringify(rows));
                res.end();
        });



});

app.get('/api/user', function(req, res) {

connection.query('SELECT id_user,name,email FROM users ', function(err, rows, fields)
        {
                console.log('Connection result error '+err);
                console.log('no of records is '+rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json'});

                res.end(JSON.stringify(rows));
                res.end();
        });



});


// routes will go here
app.get('/api/login', function(req, res) {
  var user_id = req.param('user_id');
var results;
connection.query('SELECT user_id, name FROM t_user WHERE user_id IN (?)',[user_id], function(err, rows, fields)
        {
                console.log('Connection result error '+err);
                console.log('no of records is '+rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json'});

                res.end(JSON.stringify(rows));
                res.end();
        });



});

app.get('/api/search', function(req, res) {
  var dte = req.param('dte');
  

//var results;
connection.query('SELECT logtb.tmstp,logtb.sttus,logtb.mde,visitors1.name,visitors1.Dept_name,visitors1.id_visitor,visitors1.Access_id FROM logtb LEFT JOIN visitors1 ON visitors1.ID_card = logtb.rfid where visitors1.name is not null and logtb.tmstp  BETWEEN (?) AND (?) ',[dte,dte], function(err, rows, fields)
        {


                console.log('Connection result error '+err);
                console.log('no of records is '+rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json'});

                res.end(JSON.stringify(rows));
                res.end();
        });



});
     
app.get('/api/orgtree', function(req, res) {
  var deptid = req.param('deptid');
  
connection.query('select Departments.Dept_Id,users.name,users.lastname,Positions.Position_Id,Positions.position_Name,Departments.Department_Name from users LEFT JOIN Positions on users.position_id = Positions.position_id Left Join Departments on users.dept_id=Departments.Dept_Id', function(err, rows, fields)
//connection.query('select Dept_Id, Department_Name from Departments', function(err, rows, fields)
        {
                var departments = Array();

                for(i = 0; i < rows.length; i++){
                    console.log('no of records is '+rows.length);
                       if(getIndexOf(departments, "Department_Name", rows[i].Department_Name) < 0){
                                departments.push({"Dept_Id" : rows[i].Dept_Id, "Department_Name" : rows[i].Department_Name,"Position_Id" : rows[i].Position_Id, "Position_Name" : rows[i].Position_Name, "users" : [rows[i].name + " " + rows[i].lastname]});
                        }else{
                                departments[getIndexOf(departments, "Department_Name", rows[i].Department_Name)].users.push(rows[i].name);
                        }
                }

                var json1 = '{ "departments" : [';
                var i=0;
                
                for(i = 0; i < departments.length; i++){
                  json1 += '{ ' +
                  '"department_id" : ' + departments[i].Dept_Id + ', ' +
                  '"departmentName" : "' + departments[i].Department_Name + '", ' +
                  '"postion_id" :' + Positions[]
                  '"users" : [';

                        for(j = 0; j < departments[i].users.length; j++){
                                json1 += '"' + departments[i].users[j] + '", ';
                        }
                        
                        json1 += "]" +
                   "},";
                }

                json1 += "]";

                console.log(json1);
                
                //console.log('Connection result error '+err);
                console.log('no of records is '+rows.length);
                //console.log('no of records is '+fields.length);

                res.writeHead(200, { 'Content-Type': 'application/json'});

                res.end(JSON.stringify(json1));
                res.end();
        });



});

function getIndexOf(arrayObj, paramterName, valueToCompare){
        for(var i = 0; i < arrayObj.length; i++) {
                if (arrayObj[i][paramterName] == valueToCompare) {
                        return i;
                }
        }

        return -1;
}

app.get('/', function(req, res){
  res.send('Front End APIs ');
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);