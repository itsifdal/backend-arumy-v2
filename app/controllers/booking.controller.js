const db = require("../models");
const Booking = db.bookings;
const User    = db.users;
const Room    = db.rooms;
const Teacher = db.teachers;
const Instrument = db.instruments;
const { Sequelize, Op } = require("sequelize");

const moment = require('moment');

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

// Find a single Booking by teacher id or room id.
exports.getWithFilter = (req, res) => {
    
    const { status, roomId, teacherId, tgl_kelas, jam_booking, page, perPage } = req.query;

    // Parse page and perPage parameters and provide default values if not present
    const pageNumber   = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber - 1) * itemsPerPage;
    const limit  = itemsPerPage;

    // Build the filter object dynamically, ignoring null parameters
    const filter = {
      status: status || { [Op.ne]: null },
      roomId: roomId || { [Op.ne]: null },
      teacherId: teacherId || { [Op.ne]: null },
      tgl_kelas: tgl_kelas || { [Op.ne]: null },
      jam_booking: jam_booking ? { [Op.gte]: jam_booking } : { [Op.ne]: null }
    };

    Booking.findAll({
        where:filter,
        attributes: ['id', 'user_group', 'teacherId', 'roomId', 'status', 'tgl_kelas','jam_booking','durasi','selesai'],
        offset,
        limit,
        include: [
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            }
            //,
            // {
            //     model: Instrument,
            //     attributes: ['nama_instrument']
            // }
        ]
    }).then((data) => {
            res.send({data:data});
        }).catch((err) => {
            res.status(500).send({
                message: `gagal menampilkan data booking, ${err}`
            });
        });
};

// Find a single Booking by Date Range or status
exports.findByDateRange = (req, res) => {
    const rangeAwal  = req.query.dateFrom;
    const rangeAkhir = req.query.dateTo;

    Booking.findAll({
        where:{
            [Op.or]: [
                {
                    tgl_kelas: {
                        [Op.between]: [rangeAwal, rangeAkhir],
                    }
                }
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


// Create and Save a new Booking
exports.create = (req, res) => {

    //intialize session
    const booking = {
        tgl_kelas : req.body.tgl_kelas,
        cabang : req.body.cabang,
        jam_booking : req.body.jam_booking,
        jenis_kelas : req.body.jenis_kelas,
        user_group : req.body.user_group,
        durasi : req.body.durasi,
        status : req.body.status,
        roomId: req.body.roomId,
        userId: req.body.userId,
        teacherId: req.body.teacherId,
        instrumentId: req.body.instrumentId,
    };

    Booking.findOne({
        where: {
            roomId: req.body.roomId,
            tgl_kelas: req.body.tgl_kelas,
            [Op.or]: [
                {
                    [Op.and]: [
                    { jam_booking: { [Op.lte]: req.body.jam_booking } },
                    { selesai: { [Op.gt]: req.body.jam_booking } },
                    ],
                },
                {
                    [Op.and]: [
                    { jam_booking: { [Op.lt]: req.body.selesai } },
                    { selesai: { [Op.gt]: req.body.jam_booking } },
                    ],
                },
                {
                    [Op.and]: [
                    { jam_booking: { [Op.gte]: req.body.jam_booking } },
                    { selesai: { [Op.lte]: req.body.selesai } },
                    ],
                },
            ],
        },
    })
    .then((existingBooking) => {
        if (existingBooking) {
            res.status(200).send({
                message: 'Invalid Request, Schedule Conflict',
            });
        } else {
            // Sum jam_booking with durasi into selesai
            const startMoment = moment(req.body.jam_booking, 'HH:mm:ss'); // Parse the booking time
            const endMoment = startMoment.clone().add(req.body.durasi, 'minutes'); // Calculate the end time by adding the duration
    
            booking.selesai = endMoment.format('HH:mm:ss'); // Assign the calculated end time to the 'selesai' field

            Booking.create(booking)
            .then((data) => {
                res.send({
                    data : data,
                    message: 'Successfully booked!',
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({
                    message: 'Error creating booking',
                });
            });
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send({
          message: 'Error creating booking',
        });
    });
    
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
