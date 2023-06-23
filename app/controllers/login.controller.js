//const db  = require("../config/db.config");
const jwt = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const db = require("../models");
//const session = require('express-session');
const User = db.users;
const Op   = db.Sequelize.Op;

var session;

// Process login 
exports.process = (req, res) => {
    User.findAll({
        where:{
            email: req.body.email
        },
        raw:true,
        nest:true,
    }).then((data) => {
        bcrypt.compare( req.body.password, data[0].password,
            (bErr, bResult) => {
                // wrong password
                if (bErr) { 
                    throw bErr; 
                }
                if (bResult && data.length > 0) {
                    const token = jwt.sign({id:data[0].id},'the-super-strong-secrect',{ expiresIn: '120' });
                    User.update({ token : token },{ where : { id : data[0].id }});

                    
                    //db.query(`UPDATE users SET last_login = now() WHERE user_id = '${data[0].user_id}'`);
                    req.session.loggedin = true;
                    username = req.session.username = data[0].name;
                    session = req.session;

                    const userdata = {
                        id   : data[0].id,
                        name : data[0].name,
                        role : data[0].role,
                        loggedin : req.session.loggedin
                    }
                    
                    //console.log(userdata)
                    res.status(200).send(userdata);
                }else{
                    res.status(401).send({
                        message: 'Email or password is incorrect!'
                    });
                }
        
            }
        );
    }).catch((err) => {
        res.status(500).send({
            message: "Error bangsat nda ada"
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

  



