const express = require("express");
const mysql   = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
var session = require('express-session');
app.use(session({
  secret: 'keyboard cat'
}));

//routes
app.get("/", async function(req, res){

  res.render("login");

});//root

app.get("/logout", async function(req,res){
   if(req.session && req.session.username && req.session.username.length) {
        delete req.session.username;
        res.render("login");
    }
});

app.get("/appointments", async function(req,res){
    let a = await getAppointInfo(req.session.apID);
    //console.log(a);
    res.send(a);
});


app.get("/dashboard", async function(req,res){
    //console.log(req.session.username);
    if(req.session.username && req.session.username.length > 0) {
      let a = await getAppointInfo(req.session.apID);
      res.render("dashboard", {"appoints":a});
    } else {
      res.redirect('/');
    }
});

app.post('/login', async function(req, res, next) {
    
    let successful = false;
    let rows = await userLogin(req.body);
    //console.log(rows[0]);
    //console.log(req.body)
    if (rows.length > 0) {
        if (rows[0].password == req.body.password &&
        rows[0].name == req.body.username) {
            successful = true;
            req.session.username = rows[0].name;
            req.session.password = rows[0].password;
            req.session.apID = rows[0].final_id;
            //console.log(req.session.username);
        }
    }

    res.json({
        successful: successful
    });

});

app.get("/getAppointment", async function(req,res) {
    let row = await getSingleAppointInfo(req.query.ap_id);
    //console.log(row);
    res.send(row);
});

app.post("/addTime", async function(req,res) {
   console.log(req.body); 
   let successful = false;
   let rows = await insertAppointment(req.body,req.session.apID);
   if(rows.affectedRows > 0) {
       successful = true;
   }
   res.json({
        successful : successful
    });
});


app.post("/deleteTime", async function(req,res) {
   let successful = false;
   let row = await deleteAppointment(req.body.ap_id);
   if(row.affectedRows > 0) {
       successful = true;
   }
   res.json({
        successful : successful
    });
   
});

function deleteAppointment(id){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM final_appointment
                      WHERE ap_id = ?`;
        
           conn.query(sql, [id], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}


function insertAppointment(body,id){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           //console.log("Connected!");
        
           let sql = `INSERT INTO final_appointment
                        (final_id,date, start_hour,start_min,tod,duration_hour,duration_min,end_hour,end_min,booked_by)
                         VALUES (?,?,?,?,?,?,?,?,?,?)`;
        
           let params = [id, body.date, body.start_hour, body.start_min,body.tod,body.duration_hour,body.duration_min,body.end_hour,body.end_min,body.booked_by];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}


function userLogin(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
        //   console.log("Connected!");
        
           let sql = `SELECT * 
                    FROM final_user
                    WHERE name = ? 
                    AND password = ?  
                         `;
        
           let params = [body.username, body.password];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });
    });
}

function getAppointInfo(id){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           //console.log("Connected!");
        
           let sql = `SELECT *
                      FROM final_appointment
                      WHERE final_id = ?`;
        
           conn.query(sql, [id], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows); 
           });
        
        });//connect
    });//promise 
}

function getSingleAppointInfo(id){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           //console.log("Connected!");
        
           let sql = `SELECT *
                      FROM final_appointment
                      WHERE ap_id = ?`;
        
           conn.query(sql, [id], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows[0]); 
           });
        
        });//connect
    });//promise 
}

function dbConnection(){

   let conn = mysql.createConnection({
                 host: "thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
                 user: "afpyfp5fd1jlmcej",
             password: "knlashfisxz2s5sr",
             database: "e5pm882qlvrya6un"
       }); //createConnection

return conn;
}

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});