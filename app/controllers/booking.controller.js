const db = require("../models");
const Booking = db.bookings;
const User = db.users;
const Room = db.rooms;
const Teacher = db.teachers;
const Instrument = db.instruments;
const Paket = db.pakets;
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../config/db.config");
const cron = require("node-cron");

const moment = require("moment");

//-- Relationships
Room.hasMany(Booking);
Booking.belongsTo(Room);

User.hasMany(Booking);
Booking.belongsTo(User);

Teacher.hasMany(Booking);
Booking.belongsTo(Teacher);

Instrument.hasMany(Booking);
Booking.belongsTo(Instrument);

Paket.hasMany(Booking);
Booking.belongsTo(Paket);
//-- End

const updateExpiredBookings = () => {
  // Mengatur zona waktu ke WITA
  const currentDate = moment().tz("Asia/Makassar"); // 'Asia/Makassar' adalah zona waktu WITA
  const formattedDate = currentDate.format("YYYY-MM-DD");

  // Query untuk memperbarui status booking yang sudah kadaluarsa
  const query = `
        UPDATE bookings
        SET status = 'kadaluarsa'
        WHERE status = 'pending' AND tgl_kelas < :formattedDate 
    `;

  sequelize
    .query(query, {
      replacements: {
        formattedDate: formattedDate,
      },
      type: sequelize.QueryTypes.UPDATE,
    })
    .then((result) => {
      console.log(
        `Berhasil memperbarui ${result[1]} booking menjadi kadaluarsa.`
      );
    })
    .catch((err) => {
      console.error("Gagal memperbarui status booking kadaluarsa:", err);
    });
};

const checkAndRunCronJob = async () => {
  // Tambahkan logika kondisional untuk mengecek apakah ada booking pending yang harus diperbarui
  // Mengatur zona waktu ke WITA
  const currentDate = moment().tz("Asia/Makassar"); // 'Asia/Makassar' adalah zona waktu WITA
  const formattedDate = currentDate.format("YYYY-MM-DD");

  const pendingBookings = await sequelize.query(
    `
        SELECT COUNT(*) AS count
        FROM bookings
        WHERE status = 'pending' AND tgl_kelas < :formattedDate
    `,
    {
      replacements: {
        formattedDate: formattedDate,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  if (pendingBookings[0].count > 0) {
    console.log("Menjalankan pengecekan status booking kadaluarsa...");
    updateExpiredBookings();
  } else {
    console.log("Tidak ada booking pending yang perlu diperbarui.");
  }
};

// Menjalankan fungsi checkAndRunCronJob setiap 2 menit
const cronjob = cron.schedule("53 00 * * *", checkAndRunCronJob);

cronjob.start();

// Get Booking List
exports.getWithFilter = (req, res) => {
  const {
    bookingId,
    roomId,
    teacherId,
    studentId,
    instrumentId,
    tgl_kelas,
    jam_booking,
    page,
    perPage,
    eventTime,
    dateFrom,
    dateTo,
    class_type,
    term,
    termYear
  } = req.query;

  // Parse page and perPage parameters and provide default values if not present
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;

  // Calculate offset and limit for pagination
  const offset = (pageNumber - 1) * itemsPerPage;
  const limit = itemsPerPage;

  // Define default values for sort and sort_by
  let sort = "DESC"; // Default sorting direction
  let sort_by = "id"; // Default sorting column

  // Check if sort parameter is provided and not null
  if (req.query.sort !== undefined && req.query.sort !== null) {
    sort = req.query.sort; // Use the provided sort value
  }

  // Check if sort_by parameter is provided and not null
  if (req.query.sort_by !== undefined && req.query.sort_by !== null) {
    sort_by = req.query.sort_by; // Use the provided sort_by value
  }

  let status;

  // Split the studentIds string into an array of integers
  if (
    req.query.status == undefined ||
    req.query.status == null ||
    req.query.status == ""
  ) {
    status = "konfirmasi,pending,batal,ijin,kadaluarsa";
  } else {
    status = req.query.status;
  }

  const statusArray = status.split(",").map(String);

  // Build the filter object dynamically, ignoring null parameters
  const filter = {
    id: bookingId || { [Op.ne]: null },
    status: { [Op.in]: statusArray },
    roomId: roomId || { [Op.ne]: null },
    teacherId: teacherId || { [Op.ne]: null },
    instrumentId: instrumentId || { [Op.ne]: null },
    jenis_kelas: class_type || { [Op.ne]: null },
    tgl_kelas: tgl_kelas || { [Op.ne]: null },
    jam_booking: jam_booking ? { [Op.gte]: jam_booking } : { [Op.ne]: null },
  };

  const timezoneOffset = 8 * 60; // GMT +8 (dalam menit)
  const currentDate = new Date(
    new Date().getTime() + timezoneOffset * 60 * 1000
  )
    .toISOString()
    .slice(0, 10);
  const currentTime = new Date(
    new Date().getTime() + timezoneOffset * 60 * 1000
  )
    .toISOString()
    .slice(11, 19);

  if (req.query.eventTime === "upcoming") {
    filter[Op.or] = [
      { tgl_kelas: { [Op.gt]: currentDate } },
      {
        tgl_kelas: { [Op.eq]: currentDate },
        jam_booking: { [Op.gt]: currentTime },
      },
    ];
  } else if (req.query.eventTime === "past") {
    filter[Op.or] = [
      { tgl_kelas: { [Op.lt]: currentDate } },
      {
        tgl_kelas: { [Op.eq]: currentDate },
        jam_booking: { [Op.lt]: currentTime },
      },
    ];
  }
  
  // Check term
  if(term){
      filter.term = term;
  }

  // Check termYear
  if(termYear && termYear != 'empty'){
      filter.termYear = termYear;
  }
  
  if(dateFrom && dateTo && termYear && termYear == 'empty' && term == null){
      filter.termYear = null;
      filter.tgl_kelas = {
          [Op.between]: [dateFrom, dateTo]
      };
  }

  // Check dateFrom and dateTo
  if (dateFrom && dateTo && term == null && termYear == null) {
      filter.tgl_kelas = {
          [Op.between]: [dateFrom, dateTo]
      };
  }

  // Only add user_group filter if studentId is not null
  if (studentId !== null && studentId !== undefined && studentId !== "") {
    filter.user_group = { [Op.substring]: `"id":${studentId},` };
  }

  Booking.findAndCountAll({
    where: filter,
    attributes: [
      "id",
      "user_group",
      "teacherId",
      "roomId",
      "status",
      "tgl_kelas",
      "jam_booking",
      "durasi",
      "selesai",
      "term",
      "termYear",
      "notes",
    ],
    offset,
    limit,
    order: [
      [sort_by, sort],
      ["jam_booking", sort],
    ],
    include: [
      {
        model: Room,
        attributes: ["nama_ruang"],
      },
      {
        model: Teacher,
        attributes: ["nama_pengajar"],
      },
    ],
  })
    .then((data) => {
      let totalRecords = data.count;
      let totalPages = Math.ceil(totalRecords / itemsPerPage);

      let pagination = {
        total_records: totalRecords,
        current_page: pageNumber,
        total_pages: totalPages,
        next_page: pageNumber < totalPages ? pageNumber + 1 : null,
        prev_page: pageNumber > 1 ? pageNumber - 1 : null,
      };

      //console.log(studentId);

      res.send({
        data: data.rows,
        pagination: pagination,
        statusnya: req.query.status,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: `Terjadi kesalahan saat menampilkan data booking, ${err.message}`,
        query: req.query,
        filter: filter,
      });
    });
};

// Find a single Booking by Date Range or status
exports.findByDateRange = (req, res) => {
  const rangeAwal = req.query.dateFrom;
  const rangeAkhir = req.query.dateTo;

  Booking.findAll({
    where: {
      [Op.or]: [
        {
          tgl_kelas: {
            [Op.between]: [rangeAwal, rangeAkhir],
          },
        },
      ],
    },
    include: [
      {
        model: User,
        attributes: ["name"],
      },
      {
        model: Room,
        attributes: ["nama_ruang"],
      },
      {
        model: Teacher,
        attributes: ["nama_pengajar"],
      },
      {
        model: Instrument,
        attributes: ["nama_instrument"],
      },
    ],
  })
    .then((data) => {
      res.send({ data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Booking data with status=" + err,
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
        attributes: ["name"],
      },
      {
        model: Room,
        attributes: ["nama_ruang"],
      },
      {
        model: Teacher,
        attributes: ["nama_pengajar"],
      },
      {
        model: Instrument,
        attributes: ["nama_instrument"],
      },
    ],
  })
    .then((data) => {
      res.send({
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving Booking data with id ${id}, error: ${err}`,
      });
    });
};

//Find a single Booking with an id
exports.findByEventTime = (req, res) => {
  const { roomId, teacherId, studentId, page, perPage } = req.query;
  const event = req.params.event;

  // Parse page and perPage parameters and provide default values if not present
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;

  // Calculate offset and limit for pagination
  const offset = (pageNumber - 1) * itemsPerPage;
  const limit = itemsPerPage;

  // Build the filter object dynamically, ignoring null parameters
  const filter = {
    roomId: roomId || { [Op.ne]: null },
    teacherId: teacherId || { [Op.ne]: null },
  };

  const currentDate = new Date().toISOString().slice(0, 10);
  // Get the current timestamp in milliseconds since January 1, 1970, UTC
  const timezoneOffset = 420; // GMT +8
  const currentTime = new Date(Date.now() + timezoneOffset * 60 * 1000)
    .toISOString()
    .slice(11, 19);

  if (event === "upcoming") {
    filter.tgl_kelas = { [Op.gte]: currentDate };
    filter.jam_booking = { [Op.gt]: currentTime };
  } else if (event === "past") {
    filter.tgl_kelas = { [Op.lte]: currentDate };
    filter.jam_booking = { [Op.lt]: currentTime };
  }

  // Only add user_group filter if studentId is not null
  if (studentId !== null && studentId !== undefined && studentId !== "") {
    filter.user_group = { [Op.substring]: `"id":${studentId},` };
  }

  Booking.findAndCountAll({
    where: filter,
    offset,
    limit,
    include: [
      {
        model: User,
        attributes: ["name"],
      },
      {
        model: Room,
        attributes: ["nama_ruang"],
      },
      {
        model: Teacher,
        attributes: ["nama_pengajar"],
      },
      {
        model: Instrument,
        attributes: ["nama_instrument"],
      },
    ],
  })
    .then((data) => {
      let totalRecords = data.count;
      let totalPages = Math.ceil(totalRecords / itemsPerPage);

      let pagination = {
        total_records: totalRecords,
        current_page: pageNumber,
        total_pages: totalPages,
        next_page: pageNumber < totalPages ? pageNumber + 1 : null,
        prev_page: pageNumber > 1 ? pageNumber - 1 : null,
      };

      res.send({
        data: data.rows,
        pagination: pagination,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: `Terjadi kesalahan saat menampilkan data booking, ${err.message}`,
      });
    });
};

// Create and Save a new Booking
exports.create = (req, res) => {
  
  let startMoment;
  let endMoment;
  let finishTime;

  // Sum jam_booking with durasi into selesai
  startMoment = moment(req.body.jam_booking, "HH:mm:ss"); // Parse the booking time
  endMoment = startMoment.clone().add(req.body.durasi, "minutes"); // Calculate the end time by adding the duration

  finishTime = endMoment.format("HH:mm:ss");

  //intialize session
  const booking = {
    tgl_kelas: req.body.tgl_kelas,
    cabang: req.body.cabang,
    jam_booking: req.body.jam_booking,
    jenis_kelas: req.body.jenis_kelas,
    user_group: JSON.stringify(req.body.user_group),
    durasi: req.body.durasi,
    term: req.body.term,
    termYear: req.body.termYear,
    status: req.body.status,
    notes: req.body.notes,
    roomId: req.body.roomId,
    userId: req.body.userId,
    teacherId: req.body.teacherId,
    instrumentId: req.body.instrumentId,
    paketId: req.body.paketId || null,
  };

  // Validate for scheduling conflicts
  // Query nya seperti ini

  // SELECT `id`, `tgl_kelas`, `cabang`, `jam_booking`, `durasi`, `selesai`, `jenis_kelas`, `user_group`, `status`, `notes`, `roomId`, `userId`, `teacherId`, `instrumentId`, `paketId`, `term`, `termYear`, `createdAt`, `updatedAt` 
  // FROM `bookings` AS `booking` 
  // WHERE 
  //   (
  //     (
  //       (
  //           (
  //              (`booking`.`jam_booking` <= '15:50:00' AND `booking`.`selesai` > '15:50:00') OR 
  //              (`booking`.`jam_booking` < '16:35:00' AND `booking`.`selesai` > '15:50:00') OR 
  //              (`booking`.`jam_booking` >= '15:50:00' AND `booking`.`selesai` <= '16:35:00')
  //           ) 
  //           AND `booking`.`tgl_kelas` = '2024-05-05' 
  //           AND `booking`.`status` != 'batal' 
  //           AND `booking`.`roomId` = 26 
  //           AND `booking`.`cabang` != 'Online'
  //       )
  //     ) 
  //     OR 
  //     (
  //       (
  //           (
  //              (`booking`.`jam_booking` <= '15:50:00' AND `booking`.`selesai` > '15:50:00') OR 
  //              (`booking`.`jam_booking` < '16:35:00' AND `booking`.`selesai` > '15:50:00') OR 
  //              (`booking`.`jam_booking` >= '15:50:00' AND `booking`.`selesai` <= '16:35:00')
  //           ) 
  //           AND `booking`.`tgl_kelas` = '2024-05-05' 
  //           AND `booking`.`teacherId` = 35 
  //           AND `booking`.`status` != 'batal'
  //       )
  //     )
  //     ) 
  // LIMIT 1

  Booking.findOne({
    where: {
      [Op.or]:[
        {
          [Op.and]: [{
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
                  { jam_booking: { [Op.lt]: finishTime } },
                  { selesai: { [Op.gt]: req.body.jam_booking } },
                ],
              },
              {
                [Op.and]: [
                  { jam_booking: { [Op.gte]: req.body.jam_booking } },
                  { selesai: { [Op.lte]: finishTime } },
                ],
              },
            ],
          }]
        },
        {
          [Op.and]: [{
            tgl_kelas: req.body.tgl_kelas,
            teacherId: req.body.teacherId,
            status: { [Op.ne]: "batal" },
            [Op.or]: [
              {
                [Op.and]: [
                  { jam_booking: { [Op.lte]: req.body.jam_booking } },
                  { selesai: { [Op.gt]: req.body.jam_booking } },
                ],
              },
              {
                [Op.and]: [
                  { jam_booking: { [Op.lt]: finishTime } },
                  { selesai: { [Op.gt]: req.body.jam_booking } },
                ],
              },
              {
                [Op.and]: [
                  { jam_booking: { [Op.gte]: req.body.jam_booking } },
                  { selesai: { [Op.lte]: finishTime } },
                ],
              },
            ],
          }]
        }
      ],
    },
  })
    .then((existingBooking) => {
      //throw new Error(existingBooking.teacherId);
      if (
          existingBooking &&
          req.body.cabang !== "Online" &&
          req.body.cabang !== "Home Service" 
      ) {
          res.status(409).send({
            message: "Request tidak berhasil, ada jadwal yang konflik",
          });
      } else if (
          existingBooking &&
          req.body.cabang == "Online" &&
          req.body.teacherId == existingBooking.teacherId
      ) {
          res.status(409).send({
            message: "Request tidak berhasil, ada jadwal yang konflik karena teacherId sama",
          });
      } else { 
        // Assign the calculated end time to the 'selesai' field
        booking.selesai = endMoment.format("HH:mm:ss");

        Booking.create(booking)
          .then((data) => {
            res.send({
              data: data,
              message: "Berhasil booking!",
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
    user_group: JSON.stringify(req.body.user_group),
    durasi: req.body.durasi,
    term: req.body.term,
    termYear: req.body.termYear,
    status: req.body.status,
    notes: req.body.notes,
    roomId: req.body.roomId,
    userId: req.body.userId,
    teacherId: req.body.teacherId,
    instrumentId: req.body.instrumentId,
    paketId: req.body.paketId || null,
  };

  // Calculate end time as you did in the CREATE function
  const startMoment = moment(req.body.jam_booking, "HH:mm:ss");
  const endMoment = startMoment.clone().add(req.body.durasi, "minutes");
  updatedBooking.selesai = endMoment.format("HH:mm:ss");

  // Validate for scheduling conflicts
  Booking.findOne({
    where: {
      id: { [Op.ne]: id }, // Exclude the current booking
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
        },
      ],
    },
  })
    .then((existingBooking) => {
      if (
        existingBooking &&
        req.body.cabang !== "Online" &&
        req.body.cabang !== "Home Service"
      ) {
        res.status(409).send({
          message: "Request tidak berhasil, ada jadwal yang konflik",
        });
      } else {
        // If there are no conflicts, proceed with the update
        Booking.update(updatedBooking, {
          where: { id: id },
        })
          .then((data) => {
            if (data > 0) {
              res.send({
                message: "Data booking berhasil diupdate!",
              });
            } else {
              res.send({
                message: `Tidak dapat update booking dengan ID ${id}`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message: `Error update booking dengan ID ${id}, ${err.message}`,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Terjadi kesalahan pada sisi server, ${err.message}`,
      });
    });
};

// Update Booking Data
exports.updateStatus = (req, res) => {
  const id = req.params.id;

  Booking.update(req.body, {
    where: { id: id },
  })
    .then((data) => {
      if (data > 0) {
        res.send({
          message: "Status berhasil diupdate!",
        });
      } else {
        res.send({
          message: `Gagal update status = ${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error update status dengan id ${id}, ${err.message}`,
      });
    });
};

// Update Booking Data
exports.updateSchedule = (req, res) => {
  const id = req.params.id;

  //intialize session
  const booking = {
    jam_booking: req.body.jam_booking,
    durasi: req.body.durasi,
  };

  // Sum jam_booking with durasi into selesai
  const startMoment = moment(req.body.jam_booking, "HH:mm:ss"); // Parse the booking time
  const endMoment = startMoment.clone().add(req.body.durasi, "minutes"); // Calculate the end time by adding the duration

  booking.selesai = endMoment.format("HH:mm:ss"); // Assign the calculated end time to the 'selesai' field

  Booking.update(booking, {
    where: { id: id },
  })
    .then((data) => {
      if (data > 0) {
        res.send({
          message: "Jadwal berhasil diupdate!",
        });
      } else {
        res.send({
          message: `Cannot update booking data with id = ${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Terjadi kesalahan saat update jadwal booking dengan id ${id}, ${err.message}`,
      });
    });
};

// // Delete a Room with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Booking.destroy({
    where: { id: id },
  })
    .then((data) => {
      if (data > 0) {
        res.send({
          message: "1 Booking berhasil dihapus",
        });
      } else {
        res.send({
          message: `Cannot delete booking data with id = ${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error deleting booking data with id = ${id}.`,
      });
    });
};
