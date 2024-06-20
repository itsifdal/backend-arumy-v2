const db = require("../models");
const Teacher = db.teachers;
const Booking = db.bookings;
const Student = db.students;
const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('../config/db.config');


// Retrieve all teachers from the database.
exports.findAll = (req, res) => {

    const { page, perPage } = req.query;

    // Parse page and perPage parameters and provide default values if not present
    const pageNumber   = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber - 1) * itemsPerPage;
    const limit  = itemsPerPage;

    Teacher.findAndCountAll({
        offset,
        limit,
        order: [['nama_pengajar', 'ASC']] // Add ORDER BY nama_pengajar ASC clause here
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
    }).catch((err) => {
        res.status(500).send({
            message: `gagal menampilkan data teacher, ${err}`
        });
    });
};

exports.dashboard = (req, res) => {
    const id = req.params.id;
    const { tglAwal, tglAkhir, term } = req.query;
  
    const query = `
    SELECT
          JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].id')) AS studentId,
          SUM(CASE WHEN jenis_kelas = 'privat' AND status IN ('batal', 'konfirmasi') THEN durasi ELSE 0 END) AS privateDuration,
          SUM(CASE WHEN jenis_kelas = 'group' AND status IN ('batal', 'konfirmasi') THEN durasi ELSE 0 END) AS groupDuration,
          SUM(CASE WHEN jenis_kelas = 'privat' AND status = 'pending' THEN durasi ELSE 0 END) AS privatePendingDuration,
          SUM(CASE WHEN jenis_kelas = 'privat' AND status = 'kadaluarsa' THEN durasi ELSE 0 END) AS privateExpiredDuration,
          COUNT(CASE WHEN jenis_kelas = 'privat' AND status = 'pending' THEN 1 ELSE NULL END) AS privatePendingCount,
          COUNT(CASE WHEN jenis_kelas = 'privat' AND status = 'kadaluarsa' THEN 1 ELSE NULL END) AS privateExpiredCount,
          COUNT(CASE WHEN jenis_kelas = 'privat' AND status = 'ijin' THEN 1 ELSE NULL END) AS privateIjinCount,
          SUM(CASE WHEN jenis_kelas = 'group' AND status = 'pending' THEN durasi ELSE 0 END) AS groupPendingDuration,
          SUM(CASE WHEN jenis_kelas = 'group' AND status = 'kadaluarsa' THEN durasi ELSE 0 END) AS groupExpiredDuration,
          COUNT(CASE WHEN jenis_kelas = 'group' AND status = 'pending' THEN 1 ELSE NULL END) AS groupPendingCount,
          COUNT(CASE WHEN jenis_kelas = 'group' AND status = 'kadaluarsa' THEN 1 ELSE NULL END) AS groupExpiredCount,
          COUNT(CASE WHEN jenis_kelas = 'group' AND status = 'ijin' THEN 1 ELSE NULL END) AS groupIjinCount,
          GROUP_CONCAT(IF(jenis_kelas = 'group' AND status IN ('batal', 'konfirmasi'), '1', '0')) AS groupCounts,
          term
        FROM bookings
        WHERE teacherId = '${id}' 
          AND status IN ('batal', 'konfirmasi', 'pending', 'kadaluarsa', 'ijin')
          AND jenis_kelas IN ('privat', 'group')
          AND tgl_kelas BETWEEN '${tglAwal}' AND '${tglAkhir}'
          AND user_group NOT LIKE '[]'
    GROUP BY studentId;
    `;
  
    sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        // Memperbaiki nilai studentName dan mengonversi groupCount ke angka
        const resultData = {};
  
        data.forEach(item => {
          const studentIds = JSON.parse(item.studentId);
  
          studentIds.forEach(studentId => {
            if (!resultData[studentId]) {
              resultData[studentId] = {
                studentId: studentId,
                studentName: '',
                privateDuration: 0,
                groupDuration: 0,
                privatePendingDuration: 0,
                privateExpiredDuration: 0,
                privatePendingCount: 0, // Jumlah booking privat dengan status pending
                privateExpiredCount: 0, // Jumlah booking privat dengan status kadaluarsa
                privateIjinCount: 0, // Jumlah booking privat dengan status ijin
                groupCount: 0,
                groupPendingDuration: 0,
                groupExpiredDuration: 0,
                groupPendingCount: 0,
                groupExpiredCount: 0,
                groupIjinCount: 0,
                bookingTerm: 0
              };
            }
  
            // Memperbarui durasi berdasarkan jenis status
            resultData[studentId].privateDuration += item.privateDuration;
            resultData[studentId].groupDuration += item.groupDuration;

            resultData[studentId].privatePendingDuration += item.privatePendingDuration;
            resultData[studentId].privateExpiredDuration += item.privateExpiredDuration;

            resultData[studentId].groupCount += item.groupCounts
              .split(',')
              .map(Number)
              .reduce((a, b) => a + b, 0);

            // Memperbarui Jumlah booking Group 
            //resultData[studentId].groupCount += item.groupCounts;
  
            // Memperbarui jumlah booking privat berdasarkan jenis status
            resultData[studentId].privatePendingCount += item.privatePendingCount;
            resultData[studentId].privateExpiredCount += item.privateExpiredCount;
            resultData[studentId].privateIjinCount += item.privateIjinCount;
  
            // Memperbarui durasi dan jumlah booking grup berdasarkan jenis status
            resultData[studentId].groupPendingDuration += item.groupPendingDuration;
            resultData[studentId].groupExpiredDuration += item.groupExpiredDuration;
            resultData[studentId].groupPendingCount += item.groupPendingCount;
            resultData[studentId].groupExpiredCount += item.groupExpiredCount;
            resultData[studentId].groupIjinCount += item.groupIjinCount;
            resultData[studentId].bookingTerm = parseInt(item.term);
          });
        });
  
        // Mengambil nama murid dari tabel students
        const studentIdsArray = Object.keys(resultData);
        const studentPromises = studentIdsArray.map(studentId => {
          return Student.findByPk(studentId)
            .then(student => {
              if (student) {
                resultData[studentId].studentName = student.nama_murid;
              }
            });
        });
  
        // Menunggu semua promise selesai
        Promise.all(studentPromises)
          .then(() => {
            // Mengonversi groupCount ke angka
            const finalData = Object.values(resultData);

            let filteredData = finalData;

            // Filter based on term
            if (term) {
              filteredData = filteredData.filter(
                (item) => item.bookingTerm == parseInt(term)
              );
            }
  
            res.send({ data: filteredData });
          })
          .catch(err => {
            res.status(500).send({
              message: `Gagal menampilkan data durasi booking murid, ${err}`
            });
          });
      })
      .catch(err => {
        res.status(500).send({
          message: `Gagal menampilkan data durasi booking murid, ${err}`
        });
      });
  };
  
  
// exports.dashboard = (req, res) => {
//     // Query untuk mengambil data dan mengurai JSON
//     const id = req.params.id;
//     const { tglAwal, tglAkhir } = req.query;
  
//     const query = `
//     SELECT
//         JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].id')) AS studentId,
//         SUM(CASE WHEN jenis_kelas = 'privat' AND status IN ('batal', 'konfirmasi') THEN durasi ELSE 0 END) AS privateDuration,
//         SUM(CASE WHEN jenis_kelas = 'privat' AND status = 'pending' THEN durasi ELSE 0 END) AS privatePendingDuration,
//         SUM(CASE WHEN jenis_kelas = 'privat' AND status = 'kadaluarsa' THEN durasi ELSE 0 END) AS privateExpiredDuration,
//         SUM(CASE WHEN jenis_kelas = 'group' AND status = 'pending' THEN durasi ELSE 0 END) AS groupPendingDuration,
//         SUM(CASE WHEN jenis_kelas = 'group' AND status = 'kadaluarsa' THEN durasi ELSE 0 END) AS groupExpiredDuration,
//         GROUP_CONCAT(IF(jenis_kelas = 'group', '1', '0')) AS groupCounts
//       FROM bookings
//       WHERE teacherId = '${id}' 
//         AND status IN ('batal', 'konfirmasi', 'pending', 'kadaluarsa')
//         AND jenis_kelas IN ('privat', 'group')
//         AND tgl_kelas BETWEEN '${tglAwal}' AND '${tglAkhir}'
//       GROUP BY studentId;
//     `;
  
//     sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
//     .then(data => {
//       // Memperbaiki nilai studentName dan mengonversi groupCount ke angka
//       const resultData = {};
  
//       data.forEach(item => {
//         const studentIds = JSON.parse(item.studentId); // Mengurai studentId dari JSON
  
//         studentIds.forEach(studentId => {
//           if (!resultData[studentId]) {
//             resultData[studentId] = {
//               studentId: studentId,
//               studentName: '', // Inisialisasi nama kosong
//               privateDuration: 0,
//               privatePendingDuration: 0, // Inisialisasi durasi pending
//               privateExpiredDuration: 0, // Inisialisasi durasi kadaluarsa
//               groupCount: 0,
//               groupPendingDuration: 0, // Inisialisasi durasi pending untuk grup
//               groupExpiredDuration: 0, // Inisialisasi durasi kadaluarsa untuk grup
//             };
//           }
  
//           // Memperbarui durasi berdasarkan jenis status
//           resultData[studentId].privateDuration += item.privateDuration;
//           resultData[studentId].privatePendingDuration += item.privatePendingDuration;
//           resultData[studentId].privateExpiredDuration += item.privateExpiredDuration;
//           resultData[studentId].groupCount += item.groupCounts
//             .split(',')
//             .map(Number)
//             .reduce((a, b) => a + b, 0);
          
//           // Memperbarui durasi grup berdasarkan jenis status
//           resultData[studentId].groupPendingDuration += item.groupPendingDuration;
//           resultData[studentId].groupExpiredDuration += item.groupExpiredDuration;
//         });
//       });
  
//       // Mengambil nama murid dari tabel students
//       const studentIdsArray = Object.keys(resultData);
//       const studentPromises = studentIdsArray.map(studentId => {
//         return Student.findByPk(studentId)
//           .then(student => {
//             if (student) {
//               resultData[studentId].studentName = student.nama_murid;
//             }
//           });
//       });
  
//       // Menunggu semua promise selesai
//       Promise.all(studentPromises)
//         .then(() => {
//           // Mengonversi groupCount ke angka
//           const finalData = Object.values(resultData);
  
//           res.send({ data: finalData });
//         })
//         .catch(err => {
//           res.status(500).send({
//             message: `Gagal menampilkan data durasi booking murid, ${err}`
//           });
//         });
//     })
//     .catch(err => {
//       res.status(500).send({
//         message: `Gagal menampilkan data durasi booking murid, ${err}`
//       });
//     });
// };
  

// Find a single teacher with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Teacher.findByPk(id)
        .then((teachers) => {
        res.json({status: 'success', data: teachers });
        }).catch((err) => {
            res.status(500).json({
                message: "Tidak berhasil menampilkan data teacher dengan id => " + id
            });
        });
};

// Find a single teacher with an id
exports.countTeachHours = (req, res) => {
    const id = req.params.id;

    Booking.findAll({
        attributes: [
            'teacherId', 
            [Sequelize.fn('SUM', Sequelize.col('durasi')), 'total_hour'],
        ],
        where: { teacherId: id, status: 'pending', }
    })
    .then((data) => {
        res.send({data : data});
    })
    .catch((err) => {
        res.status(500).send({ message: err });
    });
};

// Create and Save a new teacher
exports.create = (req, res) => {
    const teacher = {
        nama_pengajar: req.body.nama_pengajar,
        telepon: req.body.telepon
    };
    // Save teacher in the database
    Teacher.create(teacher)
        .then((teachers) => {
            res.json({message: 'Record teacher berhasil ditambahkan', data: teachers });
        }).catch((err) => {
            res.status(500).json({ message: 'Tidak berhasil menambah data teacher' });
        });
};

// Update a teacher by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Teacher.update(req.body, {
        where: { id: id }
    }).then((teachers) => {
        if ( teachers == 1 ) {
            res.json({message: 'Berhasil edit record teacher' });
        } else {
            res.status(500).json({ message: 'Tidak berhasil update teacher dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil update teacher dengan id => ' + id });
    });
};

// Delete a teacher with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Teacher.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.json({message: 'Berhasil hapus record teacher' });
        } else {
            res.status(500).json({ message: 'Tidak berhasil hapus teacher dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil hapus teacher dengan id => ' + id });
    });
};


