const db = require("../models");
const Booking = db.bookings;
const User    = db.users;
const Room    = db.rooms;
const Teacher = db.teachers;
const Instrument = db.instruments;
const { Op } = require("sequelize");

//-- Relationships
Room.hasMany(Booking);
Booking.belongsTo(Room);

User.hasMany(Booking);
Booking.belongsTo(User);

Teacher.hasMany(Booking);
Booking.belongsTo(Teacher);

Instrument.hasMany(Booking);
Booking.belongsTo(Instrument);
//-- End

// Return Booking Page.
exports.list = (req, res) => {
    Booking.findAll({
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ]
    }).then((data) => {
        res.send({
            data : data
        });
    });
    
};

// Find a single Booking by Status
exports.findByNewFilter = (req, res) => {
    const teacherId  = req.body.teacherId;
    const roomId = req.body.roomId;

    Booking.findAll({
        where:{
            [Op.or]: [
                { teacherId : teacherId },
                { roomId : roomId },
            ],
        },
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ]
    }).then((data) => {
            res.send({data:data});
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Booking data with status=" + err
            });
        });
};

// Find a single Booking by Status
exports.findByTeacher = (req, res) => {
    const teacherId = req.params.teacherId;

    Booking.findAll({
        where:{
            teacherId: teacherId
        },
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ],
        raw:true,
        nest:true,
    }).then((data) => {
            res.send({data:data});
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Booking data with status=" + status
            });
        });
};

// Find a single Booking by Status
exports.findByRoom = (req, res) => {
    const roomId = req.params.roomId;

    Booking.findAll({
        where:{
            roomId: roomId
        },
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ],
        raw:true,
        nest:true,
    }).then((data) => {
            res.send({data:data});
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Booking data with status=" + status
            });
        });
};

//Find a single Booking with an id
exports.findById = (req, res) => {
    const id = req.params.id;

    Booking.findAll({
        where:{
            id: id
        },
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ]
        }).then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Booking data with id=" + id
            });
        });
};

// Find a single Booking by Status
exports.findByStatus = (req, res) => {
    const status = req.params.status;

    Booking.findAll({
        where:{
            status: status
        },
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ],
        raw:true,
        nest:true,
    }).then((data) => {
            res.send({data:data});
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Booking data with status=" + status
            });
        });
};

// Find a single Booking by Status
exports.findByDate = (req, res) => {
    const rangeAwal  = req.params.rangeAwal;
    const rangeAkhir = req.params.rangeAkhir;

    Booking.findAll({
        where:{
            tgl_kelas: {
                [Op.between]: [rangeAwal, rangeAkhir],
            }
        },
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ]
    }).then((data) => {
            res.send({data:data});
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Booking data with status=" + err
            });
        });
};

// Find a single Booking by Status
exports.findByFilter = (req, res) => {
    const rangeAwal  = req.body.rangeAwal;
    const rangeAkhir = req.body.rangeAkhir;
    const status     = req.body.status;

    Booking.findAll({
        where:{
            [Op.or]: [
                {
                    tgl_kelas: {
                        [Op.between]: [rangeAwal, rangeAkhir],
                    }
                },
                { status : status },
            ],
        },
        include: [
            {
                model: User,
                attributes: ['name']
            },
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            },
            {
                model: Instrument,
                attributes: ['nama_instrument']
            }
        ]
    }).then((data) => {
            res.send({data:data});
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving Booking data with status=" + err
            });
        });
};

// Create and Save a new Booking
exports.create = (req, res) => {

    //intialize session
    const booking = {
        tgl_kelas : req.body.tgl_kelas,
        cabang : req.body.cabang,
        jam_booking : req.body.jam_booking,
        jenis_kelas : req.body.jenis_kelas,
        durasi : req.body.durasi,
        status : req.body.status,
        roomId: req.body.roomId,
        userId: req.body.userId,
        teacherId: req.body.teacherId,
        instrumentId: req.body.instrumentId,
    };

    Booking.findAll({
        where:{
            roomId: req.body.roomId,
            tgl_kelas : req.body.tgl_kelas,
            [Op.or]: [
                { jam_booking: req.body.jam_booking }
            ],
            [Op.or]: [
                {jam_booking: {
                    [Op.lt] : req.body.jam_booking
                }}
            ]
        },
        attributes: ['roomId', 'tgl_kelas','jam_booking']
    }).then((data) => {
        if (data.length > 0) {
            res.status(200).send({
                message: "Invalid Request, Schedule Same",
            });
        }
        else if (data === null || data.length === 0) {
            Booking.create(booking)
            .then((data) => {
                res.send(data);
            })
        }
    })
    //Save Booking in the database
    
};

// Update Booking Data
exports.update = (req, res) => {
    const id = req.params.id;

    Booking.update(req.body, {
        where: { id: id }
    }).then((data) => {
        if ( data > 0 ) {
            res.send({
                message: "Data booking berhasil diupdate!"
            });
        } else {
            res.send({
                message: `Tidak dapat update booking dengan Id = ${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Error update booking dengan Id =" + id
        })
    });
};


// Update Booking Data
exports.updateStatus = (req, res) => {
    const id = req.params.id;

    Booking.update(req.body, {
        where: { id: id }
    }).then((data) => {
        if ( data > 0 ) {
            res.send({
                message: "Status berhasil diupdate!"
            });
        } else {
            res.send({
                message: `Cannot update status = ${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Error updating status with id=" + id
        })
    });
};

// Update Booking Data
exports.updateSchedule = (req, res) => {
    const id = req.params.id;

    Booking.update(req.body, {
        where: { id: id }
    }).then((data) => {
        if ( data > 0 ) {
            res.send({
                message: "Your booking data updated succesfully!"
            });
        } else {
            res.send({
                message: `Cannot update booking data with id = ${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Error updating booking data with id=" + id
        })
    });
};

// // Delete a Room with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Booking.destroy({
        where: { id: id }
    }).then((data) => {
        if ( data > 0 ) {
            res.send({
                message: "1 Booking berhasil dihapus"
            })
        } else {
            res.send({
                message: `Cannot delete booking data with id = ${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: `Error deleting booking data with id = ${id}.`
        })
    });
};  
