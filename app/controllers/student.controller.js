const db        = require("../models");
const Student   = db.students;
const Payment   = db.payments;
const Op        = db.Sequelize.Op;
const sequelize = require('../config/db.config');

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
                [Op.substring]: `${q}`
            }
        };
    }

    Student.findAndCountAll({
        where: condition, // Gunakan kondisi hanya jika 'q' tidak null atau undefined
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
                err.message || "Error occurred while finding student list"
        });
    });
};

// Return student quota details
exports.quotaDetails = (req, res) => {
    
    const { page, perPage, dateFrom, dateTo } = req.query;

    // Parse page and perPage parameters and provide default values if not present
    const pageNumber   = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber -1) * itemsPerPage;
    const limit  = itemsPerPage;

    const query = `
    SELECT
          JSON_UNQUOTE(JSON_EXTRACT(user_group, '$[*].id')) AS studentId,
          SUM(CASE WHEN jenis_kelas = 'privat' AND status IN ('batal', 'konfirmasi') THEN durasi ELSE 0 END) AS privateQuotaUsed,
          COUNT(CASE WHEN jenis_kelas = 'group' AND status IN ('batal', 'konfirmasi') THEN 1 ELSE NULL END) AS groupQuotaUsed
        FROM bookings
        WHERE status IN ('konfirmasi','batal')
          AND jenis_kelas IN ('privat','group')
          AND tgl_kelas BETWEEN '${dateFrom}' AND '${dateTo}'
    GROUP BY studentId
    ORDER BY studentId DESC;
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
                privateQuotaUsed: 0,
                privateQuotaTotal: 0,
                privateQuotaLeft: 0,
                groupQuotaUsed: 0,
                groupQuotaTotal: 0,
                groupQuotaLeft: 0
              };
            }
  
            // Memperbarui durasi berdasarkan jenis status
            resultData[studentId].privateQuotaUsed  += parseInt(item.privateQuotaUsed);
            resultData[studentId].groupQuotaUsed    += parseInt(item.groupQuotaUsed);
  
          });
        });
  
        // Mengambil nama murid dari tabel students
        const studentIdsArray = Object.keys(resultData);
        const studentPromises = studentIdsArray.map(studentId => {
          return Student.findOne({ 
                where: { 
                    id: studentId
                },
                attributes: ['nama_murid'] 
            })
            .then(student => {
              if (student) {
                resultData[studentId].studentName = student.nama_murid;
              }
            });
        });

        // Mengambil quota_privat dari tabel payments
        const paymentPromises = studentIdsArray.map(studentId => {
            return Payment.findOne({ 
                where: { 
                    studentId: studentId,
                    tgl_bayar: {
                        [Op.between]: [new Date(new Date(dateFrom) - 0 * 60 * 60 * 1000), new Date(new Date(dateTo) - 0 * 60 * 60 * 1000 + 86399000)]
                    }
                },
                attributes: ['quota_privat','quota_group'] 
            })
            .then(payment => {
                if (payment) {

                    if(payment.quota_privat == null) {
                        
                        resultData[studentId].privateQuotaTotal = 0;
                        resultData[studentId].privateQuotaLeft  = resultData[studentId].privateQuotaTotal - resultData[studentId].privateQuotaUsed;
                        
                    }else{

                        resultData[studentId].privateQuotaTotal += parseInt(payment.quota_privat);
                        resultData[studentId].privateQuotaLeft  =  resultData[studentId].privateQuotaTotal - resultData[studentId].privateQuotaUsed;
                    }

                    if(payment.quota_group == null) {

                        resultData[studentId].groupQuotaTotal =  0;
                        resultData[studentId].groupQuotaLeft  =  resultData[studentId].groupQuotaTotal - resultData[studentId].groupQuotaUsed;

                    }else{

                        resultData[studentId].groupQuotaTotal +=  parseInt(payment.quota_group);
                        resultData[studentId].groupQuotaLeft  =  resultData[studentId].groupQuotaTotal - resultData[studentId].groupQuotaUsed;
                    }
                    
                }else{
                    
                    resultData[studentId].privateQuotaTotal = 0;
                    resultData[studentId].privateQuotaLeft  = resultData[studentId].privateQuotaTotal - resultData[studentId].privateQuotaUsed;

                    resultData[studentId].groupQuotaTotal += 0;
                    resultData[studentId].groupQuotaLeft  =  resultData[studentId].groupQuotaTotal - resultData[studentId].groupQuotaUsed;
                }
            });
        });
  
        // Menunggu semua promise selesai
        Promise.all(paymentPromises, studentPromises)
          .then(() => {
            const originalData = Object.values(resultData);

            let sortOrder      = req.query.sort;
            let sortBy         = req.query.sort_by;

            const finalData = originalData.sort((a, b) => {

                if(sortBy == 'privateQuotaLeft'){
                    if (sortOrder == "DESC") {
                        return b.privateQuotaLeft - a.privateQuotaLeft;
                    } else {
                        return a.privateQuotaLeft - b.privateQuotaLeft;
                    }
                }

                if(sortBy == 'groupQuotaLeft'){
                    if (sortOrder == "DESC") {
                        return b.groupQuotaLeft - a.groupQuotaLeft;
                    } else {
                        return a.groupQuotaLeft - b.groupQuotaLeft;
                    }
                }

            });

            // Apply pagination after sorting
            const paginatedData = finalData.slice(offset, offset + limit);

            const pagination    = {

                total_records: finalData.length,
                current_page: pageNumber,
                total_pages: Math.ceil(finalData.length / itemsPerPage),
                next_page: pageNumber < Math.ceil(finalData.length / itemsPerPage) ? pageNumber + 1 : null,
                prev_page: pageNumber > 1 ? pageNumber - 1 : null
            }

            res.send({
                data: paginatedData,
                pagination: pagination
            });

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
