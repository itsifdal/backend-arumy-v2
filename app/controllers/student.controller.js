const db = require("../models");
const Student = db.students;
const Payment = db.payments;
const Refund  = db.refunds;

const Booking = db.bookings;
const Op = db.Sequelize.Op;
const sequelize = require("../config/db.config");

//-- Relationships

// Return student
exports.list = (req, res) => {
  const { q, page, perPage } = req.query;

  // Parse page and perPage parameters and provide default values if not present
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;

  // Calculate offset and limit for pagination
  const offset = (pageNumber - 1) * itemsPerPage;
  const limit = itemsPerPage;

  let condition = {}; // Inisialisasi kondisi kosong

  // Periksa apakah 'q' tidak null atau undefined
  if (q !== null && q !== undefined) {
    condition = {
      nama_murid: {
        [Op.substring]: `${q}`,
      },
    };
  }

  Student.findAndCountAll({
    where: condition, // Gunakan kondisi hanya jika 'q' tidak null atau undefined
    offset,
    limit,
    order: [["nama_murid", "ASC"]],
  })
    .then((data) => {
      const totalRecords = data.count;
      const totalPages = Math.ceil(totalRecords / itemsPerPage);

      const pagination = {
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
        message: err.message || "Error occurred while finding student list",
      });
    });
};

exports.quotaDetails = async (req, res) => {
  try {
    const { page, perPage, dateFrom, dateTo, q, term, termYear, teacherId } = req.query;

    let bookingWhereCondition;
    let paymentWhereCondition;

    // If term assigned then do not apply date range
    if (term) {

      bookingWhereCondition = ``;
      paymentWhereCondition = ``;

    } else {

      // Apply date range
      bookingWhereCondition = {
        tgl_kelas: {
          [Op.between]: [dateFrom, dateTo],
        },
      };

      paymentWhereCondition = {
        [Op.and]: [
          sequelize.literal(`DATE(tgl_bayar) BETWEEN '${dateFrom}' AND '${dateTo}'`),
        ],
      }

    }

    // Booking filter objects
    const bookingFilter = {
        status: ["konfirmasi", "batal"],
        jenis_kelas: ["privat", "group"],
        user_group: { [Op.ne]: "[]" },
        teacherId: teacherId || { [Op.ne]: null },
        ...bookingWhereCondition,
    };

    // Check term
    if(term){
      bookingFilter.term = term;
    }

    // Check termYear
    if(termYear){
      bookingFilter.termYear = termYear;
    }

    const bookings = await Booking.findAll({
      where: bookingFilter,
      attributes: [
        "id",
        [
          sequelize.literal(
            "JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].id'))"
          ),
          "studentId",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              "CASE WHEN jenis_kelas = 'privat' AND status IN ('batal', 'konfirmasi') THEN durasi ELSE 0 END"
            )
          ),
          "privateQuotaUsed",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(
              "CASE WHEN jenis_kelas = 'group' AND status IN ('batal', 'konfirmasi') THEN 1 ELSE NULL END"
            )
          ),
          "groupQuotaUsed",
        ],
        "term",
      ],
      group: ["studentId"],
      raw: true,
    });


    // Query Student
    const studentIds = bookings.map((booking) => JSON.parse(booking.studentId));
    const uniqueStudentIds = [...new Set(studentIds.flat())];

    const students = await Student.findAll({
      where: { id: uniqueStudentIds },
      attributes: ["id", "nama_murid"],
      raw: true,
    });

    const resultData = {};
    students.forEach((student) => {

      resultData[student.id] = {
        id: "",
        studentId: student.id,
        studentName: student.nama_murid,
        privateQuotaUsed: 0,
        privateQuotaTotal: 0,
        privateQuotaLeft: 0,
        groupQuotaUsed: 0,
        groupQuotaTotal: 0,
        groupQuotaLeft: 0,
        bookingTerm: null,
        paymentTerm: null,
      };
    });

    // Payment filter objects
    const paymentFilter = {
        studentId: uniqueStudentIds,
        ...paymentWhereCondition,
    };

    // Check term
    if(term){
      paymentFilter.term = term;
    }

    // Check termYear
    if(termYear){
      paymentFilter.termYear = termYear;
    }

    // Construct the dynamic WHERE clause
    const whereConditions = Object.entries(paymentFilter).map(([key, value]) => {
        if (Array.isArray(value)) {
            return `payment.${key} IN (${value.join(', ')})`;
        } else {
            return `payment.${key} = ${typeof value === 'string' ? `'${value}'` : value}`;
        }
    });

    // Join all conditions with 'AND'
    const whereClause = whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Query Payment
    const queryPayment = `
      SELECT 
          payment.studentId, 
          payment.quota_privat, 
          payment.quota_group, 
          payment.term, payment.id, 
          payment.paketId, 
          payment.jumlah_bayar
      FROM payments AS payment
      ${whereClause}
    `;

    // Execute Query Payments
    const payments = await sequelize.query(queryPayment, {
      type: sequelize.QueryTypes.SELECT
    });

    
    // Loop Booking
    bookings.forEach((booking) => {

      const studentIds = JSON.parse(booking.studentId);
      studentIds.forEach((studentId) => {
      
      if (!resultData[studentId]) {
        console.log(`Undefined studentId: ${studentId}`);
      }
      
      resultData[studentId] = resultData[studentId] || {}; // Initialize if undefined
      resultData[studentId].bookingTerm = parseInt(booking.term);
      resultData[studentId].id = parseInt(booking.id);
      resultData[studentId].privateQuotaUsed += parseInt(booking.privateQuotaUsed);
      resultData[studentId].groupQuotaUsed += parseInt(booking.groupQuotaUsed);

      });
    });

    // Calculate Payment details
    const paymentPromises = payments.map(async (payment) => {

      const studentId = payment.studentId;

      if (resultData[studentId]) {
        resultData[studentId].paymentTerm       = parseInt(payment.term) || payment.term;
        resultData[studentId].privateQuotaTotal += parseInt(payment.quota_privat) || 0;
        resultData[studentId].groupQuotaTotal   += parseInt(payment.quota_group) || 0;
        resultData[studentId].paketId           = payment.paketId || 0;
      }

    });

    await Promise.all(paymentPromises);

    // Calculate QuotaLeft
    for (const studentId in resultData) {
      const student = resultData[studentId];
      student.privateQuotaLeft  = student.privateQuotaTotal - student.privateQuotaUsed;
      student.groupQuotaLeft    = student.groupQuotaTotal - student.groupQuotaUsed;
    }

    // Get Refunds
    const refunds = await Refund.findAll({
      where: { 
        studentId: uniqueStudentIds, 
        term: term || null,
      },
      attributes: ['studentId', 'paketId', 'quota_group', 'quota_privat', 'term', 'termYear'],
    });

    // Calculate Refund details
    refunds.map(async (refund) => {

      const studentId = refund.studentId;

      if (resultData[studentId]) {
        resultData[studentId].groupQuotaTotal     = resultData[studentId].groupQuotaTotal   - parseInt(refund.quota_group) || 0;
        resultData[studentId].privateQuotaTotal   = resultData[studentId].privateQuotaTotal - parseInt(refund.quota_privat) || 0;
      }

    });
    

    const originalData = Object.values(resultData);
    let filteredData   = originalData.slice();

    // Filter based on searchStudent
    if (q) {
      filteredData = filteredData.filter((item) =>
        item.studentName && item.studentName
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    }

    // Filter based on term
    // if (term) {
    //   filteredData = filteredData.filter(
    //     (item) => item.paymentTerm == parseInt(term) || item.bookingTerm == parseInt(term)
    //   );
    // }
    
    ////////////////////////// Data Sorting Logics
    let sortedData = filteredData;
    if (req.query.sort_by && req.query.sort) {

      const { sort_by, sort } = req.query;
      sortedData = filteredData.sort((a, b) => {
        if (sort_by === "privateQuotaLeft") {
          return sort === "ASC" ? a.privateQuotaLeft - b.privateQuotaLeft : b.privateQuotaLeft - a.privateQuotaLeft;
        } else if (sort_by === "groupQuotaLeft") {
          return sort === "ASC" ? a.groupQuotaLeft - b.groupQuotaLeft : b.groupQuotaLeft - a.groupQuotaLeft;
        }
      });
    }

    ////////////////////////// Data Paginating Logics
    const pageNumber    = parseInt(page) || 1;
    const itemsPerPage  = parseInt(perPage) || 10;
    const offset        = (pageNumber - 1) * itemsPerPage;
    const limit         = itemsPerPage;

    const paginatedData = sortedData.slice(offset, offset + limit);
    const total_records = sortedData.length;
    const total_pages   = Math.ceil(total_records / itemsPerPage);

    res.send({
      data: paginatedData,
      pagination: {
        total_records,
        current_page: pageNumber,
        total_pages,
        next_page: pageNumber < total_pages ? pageNumber + 1 : null,
        prev_page: pageNumber > 1 ? pageNumber - 1 : null,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: `Failed to fetch quota details: ${error.message}`,
    });
  }
};

// Return student quota details
// exports.quotaDetails = (req, res) => {
//   const { page, perPage, dateFrom, dateTo, q, term } = req.query;

//   // Parse page and perPage parameters and provide default values if not present
//   const pageNumber = parseInt(page) || 1;
//   const itemsPerPage = parseInt(perPage) || 10;

//   // Calculate offset and limit for pagination
//   const offset = (pageNumber - 1) * itemsPerPage;
//   const limit = itemsPerPage;

//   let conditionalQuery;
//   if (term !== null && term !== undefined) {
//     conditionalQuery = `AND term = '${term}'`;
//   } else {
//     conditionalQuery = `AND tgl_kelas BETWEEN '${dateFrom}' AND '${dateTo}'`;
//   }

//   const query = `
//     SELECT
//           id,
//           JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].id')) AS studentId,
//           SUM(CASE WHEN jenis_kelas = 'privat' AND status IN ('batal', 'konfirmasi') THEN durasi ELSE 0 END) AS privateQuotaUsed,
//           COUNT(CASE WHEN jenis_kelas = 'group' AND status IN ('batal', 'konfirmasi') THEN 1 ELSE NULL END) AS groupQuotaUsed,
//           term
//     FROM bookings
//     WHERE status IN ('konfirmasi','batal')
//       AND jenis_kelas IN ('privat','group')
//       ${conditionalQuery}
//     GROUP BY studentId
//     ORDER BY studentId DESC
//   `;
//   sequelize
//     .query(query, { type: sequelize.QueryTypes.SELECT })
//     .then((data) => {
//       const resultData = {};
//       data.forEach((item) => {
//         const studentIds = JSON.parse(item.studentId);

//         studentIds.forEach((studentId) => {
//           if (!resultData[studentId]) {
//             resultData[studentId] = {
//               id: "",
//               studentId: studentId,
//               studentName: "",
//               privateQuotaUsed: 0,
//               privateQuotaTotal: 0,
//               privateQuotaLeft: 0,
//               groupQuotaUsed: 0,
//               groupQuotaTotal: 0,
//               groupQuotaLeft: 0,
//               bookingTerm: 0,
//             };
//           }

//           // Memperbarui durasi berdasarkan jenis status
//           resultData[studentId].privateQuotaUsed += parseInt(
//             item.privateQuotaUsed
//           );
//           resultData[studentId].groupQuotaUsed += parseInt(item.groupQuotaUsed);

//           resultData[studentId].id = item.id;
//           resultData[studentId].bookingTerm = parseInt(item.term);
//         });
//       });

//       // Mengambil nama murid dari tabel students
//       const studentIdsArray = Object.keys(resultData);
//       const studentPromises = studentIdsArray.map((studentId) => {
//         // filter for student
//         const filterStudent = {
//           id: studentId,
//         };

//         return Student.findOne({
//           where: filterStudent,
//           attributes: ["nama_murid"],
//         }).then((student) => {
//           if (student) {
//             resultData[studentId].studentName = student.nama_murid;
//           }
//         });
//       });

//       // Mengambil quota_privat dari tabel payments
//       const paymentPromises = studentIdsArray.map((studentId) => {
//         // filter for payment
//         const filter = {
//           studentId: studentId,
//           tgl_bayar: {
//             [Op.between]: [
//               new Date(new Date(dateFrom) - 0 * 60 * 60 * 1000),
//               new Date(new Date(dateTo) - 0 * 60 * 60 * 1000 + 86399000),
//             ],
//           },
//         };

//         return Payment.findOne({
//           where: filter,
//           attributes: ["quota_privat", "quota_group", "term", "id"],
//         }).then((payment) => {
//           if (payment) {
//             resultData[studentId].paymentTerm = payment.term;

//             if (payment.quota_privat == null) {
//               resultData[studentId].privateQuotaTotal = 0;
//               resultData[studentId].privateQuotaLeft =
//                 resultData[studentId].privateQuotaTotal -
//                 resultData[studentId].privateQuotaUsed;
//             } else {
//               resultData[studentId].privateQuotaTotal += parseInt(
//                 payment.quota_privat
//               );
//               resultData[studentId].privateQuotaLeft =
//                 resultData[studentId].privateQuotaTotal -
//                 resultData[studentId].privateQuotaUsed;
//             }

//             if (payment.quota_group == null) {
//               resultData[studentId].groupQuotaTotal = 0;
//               resultData[studentId].groupQuotaLeft =
//                 resultData[studentId].groupQuotaTotal -
//                 resultData[studentId].groupQuotaUsed;
//             } else {
//               resultData[studentId].groupQuotaTotal += parseInt(
//                 payment.quota_group
//               );
//               resultData[studentId].groupQuotaLeft =
//                 resultData[studentId].groupQuotaTotal -
//                 resultData[studentId].groupQuotaUsed;
//             }
//           } else {
//             resultData[studentId].privateQuotaTotal = 0;
//             resultData[studentId].privateQuotaLeft =
//               resultData[studentId].privateQuotaTotal -
//               resultData[studentId].privateQuotaUsed;

//             resultData[studentId].groupQuotaTotal += 0;
//             resultData[studentId].groupQuotaLeft =
//               resultData[studentId].groupQuotaTotal -
//               resultData[studentId].groupQuotaUsed;

//             resultData[studentId].paymentTerm = null;
//           }
//         });
//       });

//       // Menunggu semua promise selesai
//       Promise.all(paymentPromises, studentPromises)
//         .then(() => {
//           const originalData = Object.values(resultData);

//           let sortOrder = req.query.sort;
//           let sortBy = req.query.sort_by;

//           const finalData = originalData.sort((a, b) => {
//             if (sortBy == "privateQuotaLeft") {
//               if (sortOrder == "DESC") {
//                 return b.privateQuotaLeft - a.privateQuotaLeft;
//               } else {
//                 return a.privateQuotaLeft - b.privateQuotaLeft;
//               }
//             }

//             if (sortBy == "groupQuotaLeft") {
//               if (sortOrder == "DESC") {
//                 return b.groupQuotaLeft - a.groupQuotaLeft;
//               } else {
//                 return a.groupQuotaLeft - b.groupQuotaLeft;
//               }
//             }
//           });

//           const searchStudent = q;
//           const termInt = parseInt(term);

//           // Initialize filteredData as a copy of finalData
//           let filteredData = finalData.slice();

//           // Filter based on searchStudent
//           if (searchStudent !== null && searchStudent !== undefined) {
//             filteredData = filteredData.filter((item) =>
//               item.studentName
//                 .toLowerCase()
//                 .includes(searchStudent.toLowerCase())
//             );
//           }

//           // Filter based on term
//           if (term !== null && term !== undefined) {
//             filteredData = filteredData.filter(
//               (item) => item.bookingTerm === termInt
//             );
//           }

//           // Apply pagination
//           const paginatedData = filteredData.slice(offset, offset + limit);

//           const pagination = {
//             total_records: filteredData.length,
//             current_page: pageNumber,
//             total_pages: Math.ceil(filteredData.length / itemsPerPage),
//             next_page:
//               pageNumber < Math.ceil(filteredData.length / itemsPerPage)
//                 ? pageNumber + 1
//                 : null,
//             prev_page: pageNumber > 1 ? pageNumber - 1 : null,
//           };

//           res.send({
//             data: paginatedData,
//             pagination: pagination,
//           });
//         })
//         .catch((err) => {
//           res.status(500).send({
//             message: `Gagal menampilkan data durasi booking murid, ${err}`,
//           });
//         });
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: `Gagal menampilkan data durasi booking murid, ${err}`,
//       });
//     });
// };

// Create and Save a new student
exports.create = (req, res) => {
  // Check if email already exists
  Student.findOne({
    where: { nama_murid: req.body.nama_murid },
  })
    .then((student) => {
      if (student) {
        // nama murid already exists
        res.status(409).send({
          message: "Murid sudah terdaftar!",
        });
      } else {
        // nama murid does not exist, create a new student
        const student = {
          nama_murid: req.body.nama_murid,
          nama_wali: req.body.nama_wali,
          nomor_va: req.body.nomor_va,
          telepon: req.body.telepon,
          tgl_lahir: req.body.tgl_lahir,
        };

        // Save User in the database
        Student.create(student)
          .then((data) => {
            res.send({
              message: "Murid berhasil ditambahkan",
              data: data, // Include the created student data in the response
            });
          })
          .catch((err) => {
            res.status(500).send({
              message: `Terjadi kesalahan saat create student, ${err.message}`,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Kesalahan di sisi server, ${err.message}`,
      });
    });
};

// Find a single student with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Student.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving student with id=" + id,
      });
    });
};

// Update a student by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Student.update(req.body, {
    where: { id: id },
  })
    .then((result) => {
      if (result == 1) {
        res.send({
          message: "student was updated successfully",
        });
      } else {
        res.send({
          message: `Cannot update student with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating student with id=" + id,
      });
    });
};

// Delete a student with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Student.destroy({
    where: { id: id },
  })
    .then((result) => {
      if (result == 1) {
        res.send({
          message: "Student was deleted successfully",
        });
      } else {
        res.send({
          message: `Cannot delete student with id=${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete student with id=" + id,
      });
    });
};
