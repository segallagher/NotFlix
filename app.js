const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();


// register view engine
app.set('view engine', 'ejs');

// middleware and static files (look at this tutorial https://www.youtube.com/watch?v=_GJKAs7A0_4&list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU&index=8)
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: true}));
//app.use(morgan('dev'));

app.listen(8080);

// ejs allows javascript code inside html
// all internal code lines must start with <% and end with %>
// any code to output something to the screen must start with <%= and end with %>
// to include another ejs file start with <%- and end with %>
app.get('/', (req, res) =>{
    res.render('nfLogin',{remainingAttempts: 3,response: "start"});
});

process.stdin.on('data', function(){
    console.log("You did a thing");
    console.log(Date.now());
    process.exit();
});

app.post('/goHome', (req,res)=>{
    res.redirect('/');
});

app.post('/login', (req,res)=>{
    // read file for now and save username and password
    const data = fs.readFileSync("credentials.json");
    const json = JSON.parse(data);
    const currUser = json.find(obj => obj['username'] === req.body.username);

    var remainingAttempts = req.body.remainingAttempts;
    
    if(currUser){
        console.log("Logged in");
        res.redirect('/loginSuccess');
    }else{
        remainingAttempts--;
        console.log("Username or password incorrect\n " + remainingAttempts + " attempts remaining");
        res.render('nfLogin',{remainingAttempts: remainingAttempts, response: "loginFail"});
    }
});

app.get('/loginSuccess',(req,res) =>{
    res.render('loginSuccess');
});

app.get('/signup', (req, res) =>{
    res.render('signup');
});

app.post('/createUser', (req,res)=>{
    // write to saved file a new user
    var data = fs.readFileSync("credentials.json");
    var json = JSON.parse(data);
    const currUser = json.find(obj => obj['username'].toUpperCase() === req.body.username.toUpperCase());

    if(currUser){
        console.log("username taken");
        res.render('signup',{response: "usernameTaken"});
    }else if(req.body.password.includes(req.body.username)){
        console.log("Password cannot contain username");
        res.render('signup',{response: "passwordUsername"});
    }else{
        var obj = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            security: {
                "Mothers maiden name": req.body.question1,
                "City of birth": req.body.question2
            },
            accountType: "user"
        };
        json.push(obj);
        const newObj = JSON.stringify(json,null,"\t");
        fs.writeFileSync("credentials.json",newObj,"utf-8");
        console.log("Account Created");
        res.render("nfLogin",{remainingAttempts:3, response:"createdAccount"});
    }
});

app.get('/sign-up',(req,res) =>{
    res.redirect('signup');
});

app.use((req,res) =>{
    res.status(404).render('404');
});
