const db = require("../models");
const User = db.users;
const Op   = db.Sequelize.Op;

// Process login 
exports.updatepassword = (req, res) => {
	var bcrypt = require('bcryptjs');
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
	User.update(
		{
			password: hash,
		},
		{
			where: { token: req.params.token },
		}
	).then((data) => {
        if ( data > 0 ) {
			res.send({
                message: `Success updating password`
            })
        }else{
            res.status(500).send({
                message: `Error updating password`
            })
        }
    })
    
};

