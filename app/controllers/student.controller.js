const db = require("../models");
const Student = db.students;
const Op = db.Sequelize.Op;

// Return student
exports.list = (req, res) => {

    const { page, perPage } = req.query;

    // Parse page and perPage parameters and provide default values if not present
    const pageNumber   = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber - 1) * itemsPerPage;
    const limit  = itemsPerPage;

    Student.findAndCountAll({
        offset,
        limit,
        order: [['nama_murid', 'ASC']]
    })
    .then((data) => {
        const totalRecords = data.count;
        const totalPages = Math.ceil(totalRecords / itemsPerPage);

        const pagination = {
            total_records: totalRecords,
            current_page: pageNumber,
            total_pages: totalPages,
            next_page: pageNumber < totalPages ? pageNumber + 1 : null,
            prev_page: pageNumber > 1 ? pageNumber - 1 : null
        };

        res.send({
            data: data.rows,
            pagination: pagination
        });
    })
    .catch((err) => {
        res.status(500).send({
            message:
                err.message || "Error occured while find student List"
        });
    });
};

// Create and Save a new student
exports.create = (req, res) => {

    // Check if email already exists
    Student.findOne({ 
        where: { nama_murid: req.body.nama_murid }
     })
    .then((student) => {
        if (student) {
            // nama murid already exists
            res.status(409).send({
                message: "Murid sudah terdaftar!"
            });
        } else {
            // nama murid does not exist, create a new student
            const student = {
                nama_murid: req.body.nama_murid,
                nama_wali: req.body.nama_wali,
                nomor_va: req.body.nomor_va,
                telepon: req.body.telepon,
                tgl_lahir: req.body.tgl_lahir
            };

            // Save User in the database
            Student.create(student)
                .then((data) => {
                    res.send({
                        message: "Murid berhasil ditambahkan",
                        data: data // Include the created student data in the response
                    });
                }).catch((err) => {
                    res.status(500).send({
                        message: `Terjadi kesalahan saat create student, ${err.message}`
                    });
                });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: `Kesalahan di sisi server, ${err.message}`
        });
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
