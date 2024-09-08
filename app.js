const express = require('express');
const path = require('path');
const sqlite = require('sqlite3');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookie_parser = require("cookie-parser");
const app = express();

const SECRET_KEY = "henlo";

// app.use(bodyparser.json());
app.use(cookie_parser());
app.use(bodyparser.urlencoded({extended: true}));



const saltRounds = 10;

const db = new sqlite.Database('./ayush.db');

app.set('view engine','ejs');
app.use(express.static('public'))

app.listen(5000,()=>{
    console.log("Server started : http://localhost:5000");
});

app.get('/',(req,res) => {
    const query = "SELECT * FROM plants";
    
    db.all(query,(err,rows) =>{
        if(err){
            res.status(500).json({error : err.message});
            return;
        }

        res.render('pages/main.ejs',{rows : rows});
    });
});

app.get('/plants',(req,res) => {
    

    const query = "SELECT * FROM plants";
    
    db.all(query,(err,rows) =>{
        if(err){
            res.status(500).json({error : err.message});
            return;
        }

        res.render('pages/listing.ejs',{rows : rows});
    });

    
});

app.get('/plant/:name',(req,res) => {
    const query = "SELECT * FROM plants WHERE name = (?)";
    db.all(query,req.params.name,(err,rows) => {
        if(err){
            res.status(500).json({error : err.message});
        }
        res.render('pages/plant.ejs',{name :req.params.name,info : rows});

    })
});

app.get('/users/login',(req,res)=>{
    res.render('pages/login.ejs');
});

app.post('/users/login', (req, res) => {
    const { username, password } = req.body;

    // Query to find the user by email
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, user) => {
        if (err) {
            return res.status(500).send('Error querying the database');
        }

        if (!user) {
            return res.status(400).send('No user found with that email');
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }

        // Generate a JWT token
        const token = jwt.sign({ username: user.username, email: user.email }, SECRET_KEY, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        res.cookie("token",token,{
            httpOnly: true
        });

        res.redirect("/");

    });
});

function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/users/login');
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified; // Store user data from token in request
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(400).send('Invalid token');
    }
}

app.get('/users/register',(req,res) => {
    res.render('pages/register.ejs');
});

app.post('/users/register',(req,res) => {
    const {email,username,password} = req.body;
    const hash = bcrypt.hashSync(password,saltRounds);
   
    let query = "INSERT INTO users(username,email,password) VALUES (?, ? ,?)";
    db.run(query,[username,email,hash],(e)=>{
        if(e){
            res.status(200).json({error : e});
            return;
        }
        res.redirect('/')
        return;
        })
});

app.get('/forum',(req,res) => {
    let logged = false;
    if(req.cookies.token && jwt.verify(req.cookies.token,SECRET_KEY)){
        logged = true;
    }
    res.render("pages/forum.ejs",{loggedIn : logged});
});

app.get('/forum/new',authenticateToken,(req,res)=>{
    res.render("new_post.ejs",{name : req.user.username});
});


app.get('/garden',(req,res) =>{ 
    res.render('pages/garden.ejs');
});
