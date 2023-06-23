const db = require("../models");
const Room = db.rooms;
const Op = db.Sequelize.Op;

// Return Room Page.
exports.list = (req, res) => {
    const id = req.query.id;
    let condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

    Room.findAll({where: condition})
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occured while find room List"
            });
        });
};

// Create and Save a new Room
exports.create = (req, res) => {
    const room = {
        nama_ruang: req.body.nama_ruang,
        lokasi_cabang: req.body.lokasi_cabang
    };
    // Save Room in the database
    Room.create(room)
        .then((data) => {
            res.send({
                data,
                message: "Ruangan berhasil ditambahkan" 
            });
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Room."
            })
        });
};

// Retrieve all Rooms from the database.
exports.findAll = (req, res) => {
    const room_code = req.query.room_code;
    let condition = room_code ? { room_code: { [Op.like]: `%${room_code}%` } } : null;

    Room.findAll({ where: condition })
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occured while find Room"
            });
        });
};

// Find a single Room with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Room.findByPk(id)
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Room with id=" + id
            });
        });
};

// Update a Room by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Room.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.send({
                message: "Room was updated successfully"
            });
        } else {
            res.send({
                message: `Cannot update Room with id=${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Error updating Room with id=" + id
        })
    });
};

// Delete a Room with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Room.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.send({
                message: "Room was deleted successfully"
            })
        } else {
            res.send({
                message: `Cannot delete Room with id=${id}`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Could not delete Room with id=" + id
        })
    });
};
