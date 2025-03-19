const { faker } = require('@faker-js/faker');
// Get the client
const mysql = require('mysql2');
const express = require("express");
const app  = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'Advika@12'
});

// Inserting new data
// let q = "SHOW TABLES";
// let q = "INSERT INTO user(id, username, email, password) VALUES ?";
// let users = [
//   ["123d","123_newuserd","ab@gmail.com","ab"],
//   ["123c","123_newuserc","abcd@gmail.com","abcde"],
// ];

// inserting data in bulk
let getRandomUser = () =>{
  return [
    faker.datatype.uuid(),
    faker.internet.userName(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};
// inserting data in bulk
// let data = [];
// for(let i=1; i<=5; i++){
//   // console.log(getUser());
//   data.push(getRandomUser());
// };
// try{
//   connection.query(q,[data],(err,result)=>{
//     if(err) throw err;
//     console.log(result);
//   });
// }catch(err){
//   console.log(err);
// }
// connection.end();

// let createRandomUser= () => {
//   return {
//     userId: faker.string.uuid(),
//     username: faker.internet.username(), // before version 9.1.0, use userName()
//     email: faker.internet.email(),
//     avatar: faker.image.avatar(),
//     password: faker.internet.password(),
//     birthdate: faker.date.birthdate(),
//     registeredAt: faker.date.past(),
//   };
// };
// console.log(createRandomUser());

// let getUser = () =>{
//   return {
//     id: faker.string.uuid(),
//     username: faker.internet.username(), // before version 9.1.0, use userName()
//     email: faker.internet.email(),
//     password: faker.internet.password(),
//   };
// };

// console.log(getUser());

// home route
app.get("/", (req, res) =>{
  let q = `select count(*) from user`; //total no. of users in user table
  try{
    connection.query(q,(err, result) =>{
      if(err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs",{count});
    });
  }catch(err){
    console.log(err);
    res.send("some error in database");
  }
  // res.send("Welcome to home page");
});

// show route
app.get("/user",(req,res) =>{
  let q = `select * from user`;
  try{
    connection.query(q,(err, users) =>{
      if(err) throw err;
      // console.log(result);
      // res.send(result);
      res.render("showusers.ejs",{users});
    });
  }catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

// Edit Route
app.get("/user/:id/edit",(req,res)=>{
  let {id} = req.params;
  let q = `select * from user where id = '${id}'`;//${id} should be passed as a string so we are giving single quotes

  try{
    connection.query(q,(err, result) =>{
      if(err) throw err;
      let user = result[0]; //result will be an array we need the oth index element of that array
      res.render("edit.ejs",{user});
    });
  }catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

// UPDATE ROUTE(actual update in database)
app.patch("/user/:id",(req,res)=>{
  // res.send("updated");
  let {id} = req.params;
  let {password: formPassword, username:newUsername} = req.body;
  let q = `select * from user where id = '${id}'`;

  try{
    connection.query(q,(err, result) =>{
      if(err) throw err;
      let user = result[0];

      if(formPassword != user.password){
        res.send("WRONG Password");
      }else{
        let q2 = `UPDATE user SET username="${newUsername}" WHERE id="${id}"`;
        connection.query(q2,(err,result) =>{
          if(err) throw err;
          res.send(result);
          res.redirect("/user");
        });
      }      
    });
  }catch(err){
    console.log(err);
    res.send("some error in database");
  }
});

// Add a new user
app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
});

app.post("/user/new",(req,res)=>{
  let {username,email,password} = req.body;
  let id = uuidv4();
  // Query to insert New user
  let q=`INSERT INTO user(id,username,email,password) VALUES('${id}','${username}','${email}','${password}')`;

  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  }catch(err){
    res.send("some error occured");
  }
});

// Delete user
app.get("/user/:id/delete",(req,res)=>{
  let {id} = req.params;
  let q =`SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs",{user});
    });
  }catch(err){
    res.send("some error with database");
  }
});

app.delete("/user/:id",(req,res)=>{
  let {id} = req.params;
  let {password} = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];

      if(user.password != password){
        res.send("WRONG Password entered");
      }else{
        let q2 = `DELETE FROM user WHERE id='${id}'`;
        connection.query(q2,(err,result)=>{
          if(err) throw err;
          else{
            console.log(result);
            console.log("Deleted");
            res.redirect("/user");
          }
        });
      }
    });
  }catch(err){
    res.send("some error with database");
  }
});

app.listen("8080",()=>{
  console.log("server is listening to port 8080");
});