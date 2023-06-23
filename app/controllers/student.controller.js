const db = require("../models");
const Student = db.students;
const Op = db.Sequelize.Op;

// Return student
exports.list = (req, res) => {
    const id = req.query.id;
    let condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

    Student.findAll({where : condition})
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occured while find student List"
            });
        });
};

// Create and Save a new student
exports.create = (req, res) => {

    // Create a student
    const student = {
        nama_murid: req.body.nama_murid,
        nama_wali: req.body.nama_wali,
        nomor_va: req.body.nomor_va,
        telepon: req.body.telepon
    };

    // Save student in the database
    Student.create(student)
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the student."
            })
        });
};

// Find a single student with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Student.findByPk(id)
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving student with id=" + id
            });
        });
};

// Update a student by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Student.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.send({
                message: "student was updated successfully"
            });
        } else {
            res.send({
                message: `Cannot update student with id=${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Error updating student with id=" + id
        })
    });
};

// Delete a student with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Student.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.send({
                message: "Student was deleted successfully"
            })
        } else {
            res.send({
                message: `Cannot delete student with id=${id}`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Could not delete student with id=" + id
        })
    });
};
