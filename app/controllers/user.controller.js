const db = require("../models");
const User = db.users;
const Teacher = db.teachers;
const Op = db.Sequelize.Op;

//-- Relationships
Teacher.hasOne(User);

// Return User
exports.list = (req, res) => {

    User.findAll({
        attributes : ['id','name', 'role','email']
    })
    .then((data) => {
        res.send(data);
    }).catch((err) => {
        res.status(500).send({
            message:
                err.message || "Error occured while find User List"
        });
    });
};

// Create and Save a new User
exports.create = (req, res) => {
    // Validate request
    if (!req.body.email) {
    res.status(400).send({
    message: "Content can not be empty!"
    });
    return;
    }
    
    const email = req.body.email;
    
    var bcrypt = require('bcryptjs');
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    
    // Check if email already exists
    User.findOne({ 
        where: { email: email }
     })
    .then((user) => {
        if (user) {
            // Email already exists
            res.status(409).send({
                message: "Email ini sudah terdaftar!"
            });
        } else {
            // Email does not exist, create a new user
            const user = {
                teacherId: req.body.teacherId,
                role: req.body.role,
                name: req.body.name,
                email: email,
                password: hash
            };

            // Save User in the database
            User.create(user)
                .then((data) => {
                    res.send({
                        message: "User berhasil ditambahkan",
                        data: data // Include the created user data in the response
                    });
                }).catch((err) => {
                    res.status(500).send({
                        message: `Some error occurred while creating the User, ${err.message}`
                    });
                });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: `Some error occurred while checking if email already exists, ${err.message}`
        });
    });
};


// Find a single User with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    User.findByPk(id)
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message: `Error retrieving User with id ${id}, ${err.message}`
            });
        });
};

// Find a single User with an id
exports.findByEmail = (req, res) => {
    const email = req.body.email;
    let condition = email ? { email: { [Op.like]: `%${email}%` } } : null;

    User.findAll({where : condition})
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving User with id=" + email
            });
        });
};

// Update a User by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    // Check if a new password is provided
    if (req.body.password) {
        var bcrypt = require('bcryptjs');
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);

        // Update User with hashed password
        req.body.password = hash;
    }

    User.update(req.body, {
        where: { id: id }
    }).then((user) => {
        if (user) {
            res.send({
                message: "User was updated successfully"
            });
        } else {
            res.send({
                message: `Cannot update User with id=${id}`
            });
        }
    }).catch((err) => {
        res.status(500).send({
            message: `Error updating User with id=${id}, ${err.message}`
        });
    });
};


// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    User.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.send({
                message: "User was deleted successfully"
            })
        } else {
            res.send({
                message: `Cannot delete User with id=${id}`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Could not delete User with id=" + id
        })
    });
};
