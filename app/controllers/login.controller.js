const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const db = require("../models");
//const session = require('express-session');
const User = db.users;
const Op   = db.Sequelize.Op;

var session;

// Process login
exports.process = (req, res) => {
    User.findOne({
        where: {
        email: req.body.email,
        },
    })
    .then((data) => {

    if (!data) {
        res.status(401).send({
            message: 'Email or password is incorrect!',
        });
        return;
    }
    
    bcrypt.compare(req.body.password, data.password, (bErr, bResult) => {
        if (bErr) {
            throw bErr;
        }
        if (bResult) {
            const token = jwt.sign({ id: data.id }, 'the-super-strong-secrect', {
                expiresIn: '120',
            });

            User.update({ token: token }, { where: { id: data.id } }).then(() => {
                req.session.loggedin = true;
                req.session.username = data.name;
                const userdata = {
                id: data.id,
                name: data.name,
                teacherId : data.teacherId,
                role: data.role,
                loggedin: req.session.loggedin,
                };
                res.status(200).send(userdata);
            });

        } else {
            res.status(500).send({
                message: 'Email or password is incorrect!',
            });
        }
        });
    })
    .catch((err) => {
    console.log(err);
    res.status(500).send({
        message: err.message,
    });
    });
};
  

// Process login 
exports.logout = (req, res) => {
    req.session.destroy();
    res.send({message: 'Log out succesfully!'});
};

// Check Active Session 
exports.active_session = (req, res) => {
    //console.log(userdata)
    if (req.session.loggedin == true){
        res.status(200).send({session:req.session});
    }else{
        res.status(200).send({message: "no session logged in!"});
    }
    
};

  



