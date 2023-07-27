const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

// Return User
exports.list = (req, res) => {
    const id = req.query.id;
    let condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

    User.findAll({where : condition})
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
        return ;
    }

    var bcrypt = require('bcryptjs');
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    // Create a User
    const user = {
        role: req.body.role,
        name: req.body.name,
        email: req.body.email,
        password: hash
    };

    // Save User in the database
    User.create(user)
        .then((data) => {
            res.send({
                data,
                message: "User berhasil ditambahkan"
            });
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User."
            })
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
                message: "Error retrieving User with id=" + id
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

    User.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.send({
                message: "User was updated successfully"
            });
        } else {
            res.send({
                message: `Cannot update User with id=${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Error updating User with id=" + id
        })
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
