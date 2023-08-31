const db    = require("../models");
const Room  = db.rooms;
const Cabang = db.cabangs;
const Op    = db.Sequelize.Op;

//-- Relationships
Cabang.hasMany(Room);
Room.belongsTo(Cabang);

// Return Room Page.
exports.list = (req, res) => {

    Room.findAll({
        order: [['nama_ruang', 'ASC']],
        include: [
            {
                model: Cabang,
                attributes: ['nama_cabang']
            }
        ]
    })
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
    const { nama_ruang, cabangId } = req.body;

    // Validate if room name is provided
    if (!nama_ruang) {
        res.status(400).send({
            message: "nama_ruang tidak boleh kosong!"
        });
        return;
    }

    // Check if the room name already exists in the database
    Room.findOne({ where: { nama_ruang: nama_ruang } })
        .then(existingRoom => {
            if (existingRoom) {
                // Room name already exists, return an error
                return res.status(409).send({
                    message: "Ruangan sudah ada!"
                });
            }

            const room = {
                nama_ruang: nama_ruang,
                cabangId: cabangId
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
                        message: `Terjadi error saat menambah ruangan, ${err.message}`
                    });
                });
        })
        .catch((err) => {
            res.status(500).send({
                message: `Terjadi kesalahan di sisi server, ${err.message}`
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
