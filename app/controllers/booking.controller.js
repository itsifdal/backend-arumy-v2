const db = require("../models");
const Booking = db.bookings;
const User    = db.users;
const Room    = db.rooms;
const Teacher = db.teachers;
const Instrument = db.instruments;
const { Sequelize, Op } = require("sequelize");
const cron = require('node-cron');


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

const updateExpiredBookings = () => {
    const currentDate = new Date();
  
    // Query untuk memperbarui status booking yang sudah kadaluarsa
    // Sesuaikan dengan aturan bisnis dan struktur tabel Anda
    const query = `
      UPDATE bookings
      SET status = 'kadaluarsa'
      WHERE tgl_kelas < ? OR (tgl_kelas = ? AND jam_booking < ?)
      AND status IN ('pending')
    `;
  
    // Eksekusi query dengan parameter tanggal dan waktu sekarang
    // Anda perlu menyesuaikan ini dengan cara Anda berinteraksi dengan database
    db.query(query, [currentDate, currentDate, currentDate], (err, result) => {
      if (err) {
        console.error('Gagal memperbarui status booking kadaluarsa:', err);
      } else {
        console.log(`Berhasil memperbarui ${result.affectedRows} booking menjadi kadaluarsa.`);
      }
    });
};

// Menjalankan fungsi updateExpiredBookings setiap jam 1
cron.schedule('0 * * * *', () => {
    console.log('Menjalankan pengecekan status booking kadaluarsa...');
    updateExpiredBookings();
});


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

// Get Booking List 
exports.getWithFilter = (req, res) => {
    const { status, bookingId, roomId, teacherId, studentId, tgl_kelas, jam_booking, page, perPage } = req.query;

    // Parse page and perPage parameters and provide default values if not present
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber -1) * itemsPerPage;
    const limit = itemsPerPage;

    // Build the filter object dynamically, ignoring null parameters
    const filter = {
        id: bookingId  || { [Op.ne]: null },
        status: status || { [Op.ne]: null },
        roomId: roomId || { [Op.ne]: null },
        teacherId: teacherId || { [Op.ne]: null },
        tgl_kelas: tgl_kelas || { [Op.ne]: null },
        jam_booking: jam_booking ? { [Op.gte]: jam_booking } : { [Op.ne]: null },
        user_group: { [Op.substring]: `"id":${studentId},` },
    };

    Booking.findAndCountAll({
        where: filter,
        attributes: ['id', 'user_group', 'teacherId', 'roomId', 'status', 'tgl_kelas', 'jam_booking', 'durasi', 'selesai'],
        offset,
        limit,
        order: [['id', 'DESC']],
        include: [
            {
                model: Room,
                attributes: ['nama_ruang']
            },
            {
                model: Teacher,
                attributes: ['nama_pengajar']
            }
        ]
    })
    .then((data) => {
        
        let totalRecords = data.count;
        let totalPages = Math.ceil(totalRecords / itemsPerPage);

        let pagination = {
            total_records: totalRecords,
            current_page: pageNumber,
            total_pages: totalPages,
            next_page: pageNumber < totalPages ? pageNumber + 1 : null,
            prev_page: pageNumber > 1 ? pageNumber - 1 : null
        };

        res.send({  
            data : data.rows,
            pagination: pagination
        });
    })
    .catch((err) => {
        res.status(500).send({
            message: `Terjadi kesalahan saat menampilkan data booking, ${err.message}`
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

    Booking.findByPk(id, {
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
    })
    .then((data) => {
        if (data) {
            // Parse the "user_group" field as JSON
            if (data.user_group) {
                data.user_group = JSON.parse(data.user_group);
            }
            res.send(data);
        } else {
            res.status(404).send({
                message: `Booking with id=${id} was not found.`
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: "Error retrieving Booking data with id=" + id
        });
    });
};


//Find a single Booking with an id
exports.findByEventTime = (req, res) => {
    const { roomId, teacherId, studentId } = req.query;
    const event = req.params.event;

    // Build the filter object dynamically, ignoring null parameters
    const filter = {
        roomId: roomId || { [Op.ne]: null },
        teacherId: teacherId || { [Op.ne]: null }
    };

    const currentDate = new Date().toISOString().slice(0, 10);
    // Get the current timestamp in milliseconds since January 1, 1970, UTC
    const timezoneOffset = 420; // GMT +8
    const currentTime = new Date(Date.now() + timezoneOffset * 60 * 1000).toISOString().slice(11, 19);


    if (event === 'upcoming') {
        filter.tgl_kelas = { [Op.gte]: currentDate };
        filter.jam_booking = { [Op.gt]: currentTime };
    } else if (event === 'past') {
        filter.tgl_kelas = { [Op.lte]: currentDate };
        filter.jam_booking = { [Op.lt]: currentTime };
    }

    Booking.findAll({
        where: filter,
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
    })
    .then((data) => {
        if (data) {

            const filteredData = data.filter((booking) => {
                if (booking.user_group) {

                    // Parse the user_group array
                    const userGroup = JSON.parse(booking.user_group);
            
                    // Check if any student's id matches studentId
                    return userGroup.some((student) => student.id === parseInt(studentId));

                }else{

                    return false;

                }
            });
        
            res.send(filteredData);

        } else {
            res.status(404).send({
                message: `Booking data not found.`
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: `Terjadi kesalahan saat menampilkan data booking, ${err.message}`
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
        user_group: JSON.stringify(req.body.user_group),
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
            status: { [Op.ne]: "batal" },
            cabang: { [Op.ne]: "Online" },
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
                }
            ],
        },
    })
    .then((existingBooking) => {
        if (existingBooking && req.body.cabang !== "Online") {
            res.status(409).send({
                message: 'Request tidak berhasil, ada jadwal yang konflik',
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
                    message: 'Berhasil booking!',
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({
                    message: `Gagal melakukan booking ruangan, ${err.message}`,
                });
            });
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send({
          message: `Terjadi kesalahan pada sisi server, ${err.message}`,
        });
    });
    
};

// Update Booking Data
exports.update = (req, res) => {
    const id = req.params.id;

    const updatedBooking = {
        tgl_kelas: req.body.tgl_kelas,
        cabang: req.body.cabang,
        jam_booking: req.body.jam_booking,
        jenis_kelas: req.body.jenis_kelas,
        user_group: JSON.stringify(req.body.user_group), // Convert to JSON string before updating
        durasi: req.body.durasi,
        status: req.body.status,
        roomId: req.body.roomId,
        userId: req.body.userId,
        teacherId: req.body.teacherId,
        instrumentId: req.body.instrumentId,
    };

    // Sum jam_booking with durasi into selesai
    const startMoment = moment(req.body.jam_booking, 'HH:mm:ss'); // Parse the booking time
    const endMoment = startMoment.clone().add(req.body.durasi, 'minutes'); // Calculate the end time by adding the duration

    updatedBooking.selesai = endMoment.format('HH:mm:ss'); // Assign the calculated end time to the 'selesai' field

    Booking.update(updatedBooking, {
        where: { id: id }
    }).then((data) => {
        if (data > 0) {
            res.send({
                message: "Data booking berhasil diupdate!"
            });
        } else {
            res.send({
                message: `Tidak dapat update booking dengan id ${id}`
            });
        }
    }).catch((err) => {
        res.status(500).send({
            message: `Error update booking dengan id ${id}, ${err.message}`,
        });
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
                message: `Gagal update status = ${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: `Error update status dengan id ${id}, ${err.message}`
        })
    });
};

// Update Booking Data
exports.updateSchedule = (req, res) => {
    const id = req.params.id;

    //intialize session
    const booking = {
        jam_booking : req.body.jam_booking,
        durasi : req.body.durasi
    };

    // Sum jam_booking with durasi into selesai
    const startMoment = moment(req.body.jam_booking, 'HH:mm:ss'); // Parse the booking time
    const endMoment = startMoment.clone().add(req.body.durasi, 'minutes'); // Calculate the end time by adding the duration

    booking.selesai = endMoment.format('HH:mm:ss'); // Assign the calculated end time to the 'selesai' field

    Booking.update(booking, {
        where: { id: id }
    }).then((data) => {
        if ( data > 0 ) {
            res.send({
                message: "Jadwal berhasil diupdate!"
            });
        } else {
            res.send({
                message: `Cannot update booking data with id = ${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: `Terjadi kesalahan saat update jadwal booking dengan id ${id}, ${err.message}`
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


