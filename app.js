var cookieParser = require('cookie-parser');
var express = require('express');

// need this module for session cookies 
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


// how we setup our seesion library -- just once 
app.use(session({
    name: 'userdeet',
    secret: 'secret',
    resave: true, // have to do with saving session under various conditions
    saveUninitialized: true,
    cookie: {
        maxAge: (30 * 24 * 60 * 1000) //30Days
    }
}));

app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 1234);
app.use(cookieParser());
// ---------------------------------------

// add the database 
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hw3', { useNewUrlParser: true, useUnifiedTopology: true });
// we create a scheme first 
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// we create a collection called WifiQ with the wifiSchema
const User = mongoose.model("User", userSchema);

//------------------------------------------------
app.get('/', function (req, res) {

    if (req.session.page_views) {
        req.session.page_views++;
        res.send("You visited this page " + req.session.page_views + " times");
    } else {
        // first HTTP when page_views is not defined. 
        req.session.page_views = 1;
        res.send("Welcome to this page for the first time!");
    }
});

//ADD NEW USER
app.post("/add_user", async function (req, res) {
    var new_user = {
        username: req.body.username,
        password: req.body.password
    };
    console.log(new_user);
    new User(new_user).save();
    res.redirect("/login.html")
});

//LOGIN

//This was the not post route
// app.post("/login", function (req, res) {
//     res.clearCookie("userdeet");
//     var login_user = {
//         username: req.body.username,
//         password: req.body.password
//     };
//     console.log(login_user);

//     User.findOne({ username: login_user.username }, function (err, got_user) {
//         if (err) {
//             console.log("no user");
//             res.redirect("/login.html")
//         } else {
//             if (got_user.password == login_user.password) {
//                 req.session.validUser = true;
//                 req.session.username = login_user.username;
//                 res.redirect("/map.html");
//             }else{
//                 res.redirect("/login.html")
//             }
//         }
//     }
//     );

// });
app.post("/login", function (req, res) {
    res.clearCookie("userdeet");
    var login_user = {
        username: req.body.username,
        password: req.body.password
    };
    console.log(login_user);

    User.findOne({ username: login_user.username }, function (err, got_user) {
        if (err) {

        } else {
            if (got_user == null) {
                res.json({ msg: "Could not find Username! Please register!" });
            }
            else if (got_user.password == login_user.password) {
                req.session.validUser = true;
                req.session.username = login_user.username;
                res.json({ msg: "Success" });
            } else {
                res.json({ msg: "Wrong Password/Username combination. Please Try Again" });
            }
        }
    }
    );

});

//validate from map
app.get("/validate", function (req, res) {

    responseObj = {
        valid: false,
        username: "",
        last_access: ""
    };
    if (req.session.validUser) {
        responseObj.valid = true;
        responseObj.username = req.session.username;
        //If not first time
        if (req.session.last_access) {
            responseObj.last_access = req.session.last_access;
        }
        req.session.last_access = Date.now();
    }
    res.send(responseObj);
}
);
app.get("/logout", function (req, res) {
    res.clearCookie("userdeet");
    // req.session.destroy()
    res.redirect("/login.html")
});

// launch 
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
