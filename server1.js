// grab the packages we need
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser= require('body-parser');

var connection = mysql.createConnection({
        host     : 'jun.cnpvqqpsoao7.us-west-2.rds.amazonaws.com',
        user     : 'wimtachjv',
        password : 'wimtachwi',
        database : 'tree',
});


var port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
/*app.configure(function()
{
        app.use(express.bodyParser());
        app.use(app.router);
});*/

app.use(function(req, res, next) { 
        res.header('Access-Control-Allow-Origin', "*"); 
        res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); 
        res.header('Access-Control-Allow-Headers', 'Content-Type'); next();
});

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

app.post('/api/search', function(req, res) {
 // var dte = req.param('dte');

 console.log(req.body);

 var dte= req.body.dte;
  

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
  
connection.query('select Organization.Org_Name,users.Org_Id,Departments.Dept_Id,users.id_user,users.name,users.lastname,Positions.Position_Id,Positions.position_Name,Departments.Department_Name from users LEFT JOIN Positions on users.position_id = Positions.position_id Left Join Departments on users.dept_id=Departments.Dept_Id left join Organization on users.Org_Id=Organization.Org_Id', function(err, rows, fields)

        {
                var departments = Array();

                for(i = 0; i < rows.length; i++){
                       if(getIndexOf(departments, "Department_Name", rows[i].Department_Name) < 0){
                                departments.push({"Dept_Id" : rows[i].Dept_Id, "Department_Name" : rows[i].Department_Name, "positions" : [{"Position_Id" : rows[i].Position_Id, "position_Name" : rows[i].position_Name, "users" : [{"user_id" : rows[i].id_user, "name" : rows[i].name, "lastName" : rows[i].lastname}]}]});
                        }else{
                                var deptId = getIndexOf(departments, "Department_Name", rows[i].Department_Name);
                                var positionId = getIndexOf(departments[deptId].positions, "position_Name", rows[i].position_Name);

                                if(positionId < 0){
                                        departments[deptId].positions.push({"Position_Id" : rows[i].Position_Id, "position_Name" : rows[i].position_Name, "users" : [{"user_id" : rows[i].id_user, "name" : rows[i].name, "lastName" : rows[i].lastname}]});
                                }else{
                                        departments[deptId].positions[positionId].users.push({"user_id" : rows[i].id_user, "name" : rows[i].name, "lastName" : rows[i].lastname});
                                }
                        }
                }

                var json1 = '{ "Organization" : "' + rows[1].Org_Name + '" , "Organization_id": "' + rows[1].Org_Id + '", "departments" : [';
                var departmentStr = "";
                
                for(i = 0; i < departments.length; i++){
                        if(departmentStr != ""){
                                departmentStr += ', ';
                        }

                  departmentStr += '{ ' +
                  '"department_id" : ' + departments[i].Dept_Id + ', ' +
                  '"departmentName" : "' + departments[i].Department_Name + '", ' +
                  '"positions" : [';

                        var positions = "";
                        for(j = 0; j < departments[i].positions.length; j++){
                                if(positions != ""){
                                        positions += ', ';
                                }

                                positions += '{' +
                                        '"position_id" : ' + departments[i].positions[j].Position_Id + ', ' +
                                        '"position_name" : "' + departments[i].positions[j].position_Name + '", ' +
                                        '"users" : [';

                                        var users = "";
                                        for(k = 0; k < departments[i].positions[j].users.length; k++){
                                                if(users != ""){
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


                res.writeHead(200, { 'Content-Type': 'application/json'});

                var test = JSON.parse(json1);

                res.end(JSON.stringify(test));
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


app.post('/api/operator12', function(req, res) {

        var op_name= req.body.op_name;

                console.log(op_name);
                connection.query('insert into op1 (op_val) values (' + op_name + ')', function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }
           else{
console.log("Success!!!");
          res.sendStatus(200);
}
        });




}); 

app.get('/', function(req, res){
  res.send('Front End APIs ');
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);