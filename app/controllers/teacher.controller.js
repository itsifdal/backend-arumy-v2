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
    // Query untuk mengambil data dan mengurai JSON
    const id = req.params.id;

    const query = `
      SELECT
        JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].id')) AS studentId,
        IFNULL(SUM(CASE WHEN jenis_kelas = 'privat' THEN durasi ELSE 0 END), 0) AS privateDuration,
        GROUP_CONCAT(IF(jenis_kelas = 'group', '1', '0')) AS groupCounts
      FROM bookings
      WHERE teacherId = '${id}' 
        AND status IN ('batal', 'konfirmasi')
        AND jenis_kelas IN ('privat', 'group')
      GROUP BY studentId;
    `;
  
    sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
  .then(data => {
    // Memperbaiki nilai studentName dan mengonversi groupCount ke angka
    const resultData = {};

    data.forEach(item => {
      const studentIds = JSON.parse(item.studentId); // Mengurai studentId dari JSON
      studentIds.forEach(studentId => {
        if (!resultData[studentId]) {
          resultData[studentId] = {
            studentId: studentId,
            studentName: '', // Inisialisasi nama kosong
            privateDuration: 0,
            groupCount: 0,
          };
        }
        // Gabungkan privateDuration dan groupCount
        resultData[studentId].privateDuration += item.privateDuration;
        // Mengubah groupCounts menjadi angka dan menjumlahkannya
        resultData[studentId].groupCount += item.groupCounts
          .split(',')
          .map(Number)
          .reduce((a, b) => a + b, 0);
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

        res.send({ data: finalData });
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


// Retrieve students bookings hours
// exports.dashboard = (req, res) => {
//     // Query untuk mengambil data dan mengurai JSON
//     const query = `
//       SELECT
//         JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].id')) AS studentId,
//         JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].nama_murid')) AS studentNames,
//         IFNULL(SUM(CASE WHEN jenis_kelas = 'privat' THEN durasi ELSE 0 END), 0) AS privateDuration,
//         IFNULL(SUM(CASE WHEN jenis_kelas = 'group' THEN 1 ELSE 0 END), 0) AS groupCount
//       FROM bookings
//       WHERE teacherId = '3' 
//         AND status IN ('pending', 'konfirmasi')
//         AND jenis_kelas IN ('privat', 'group')
//       GROUP BY studentId, studentNames;
//     `;
  
//     sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
//       .then(data => {
//         // Manipulasi data untuk menggabungkan berdasarkan studentId dan studentNames
//         const groupedData = {};
//         data.forEach(item => {
//           const studentIds = JSON.parse(item.studentId); // Mengurai studentId dari JSON
//           const studentNames = JSON.parse(item.studentNames); // Mengurai nama murid dari JSON
  
//           studentIds.forEach(studentId => {
//             if (!groupedData[studentId]) {
//               groupedData[studentId] = {
//                 studentId: String(studentId), // Mengonversi ke string
//                 studentName: studentNames[0], // Mengambil nama pertama
//                 privateDuration: item.privateDuration,
//                 groupCount: item.groupCount,
//               };
//             } else {
//               // Gabungkan privateDuration jika studentId sama
//               groupedData[studentId].privateDuration += item.privateDuration;
//             }
//           });
//         });
  
//         // Konversi data yang telah digroup ke dalam array
//         const finalData = Object.values(groupedData);
  
//         res.send({ data: finalData });
//       })
//       .catch(err => {
//         res.status(500).send({
//           message: `Gagal menampilkan data durasi booking murid, ${err}`
//         });
//       });
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


