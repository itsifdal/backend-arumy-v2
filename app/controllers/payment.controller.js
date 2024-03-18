const db        = require("../models");
const Payment   = db.payments;
const Paket     = db.pakets;
const Student   = db.students;
const User      = db.users;
const { Op }    = require("sequelize");

Paket.hasMany(Payment);
Payment.belongsTo(Paket);

Student.hasMany(Payment);
Payment.belongsTo(Student);

User.hasMany(Payment);
Payment.belongsTo(User);

// Retrieve all Payments from the database.
exports.findAll = (req, res) => {

    const { page, perPage, dateFrom, dateTo, receipt_number, confirmed_status, paketId, studentId, term } = req.query;

    // Parse page and perPage parameters
    const pageNumber   = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber -1) * itemsPerPage;
    const limit  = itemsPerPage;

    // Define default values for sort and sort_by
    let sort    = "DESC"; 
    let sort_by = "tgl_tagihan"; 
    
    if(req.query.sort != undefined && req.query.sort != null) {
        sort = req.query.sort;
    }

    if(req.query.sort_by != undefined && req.query.sort_by != null) {
        sort_by = req.query.sort_by;
    }

    // Build the filter object, ignoring null parameters
    const filter = {
        paketId: paketId || { [Op.ne] : null },
        studentId: studentId || { [Op.ne] : null },
        term: term || null,
        confirmed_status : confirmed_status == 'true' ? '1' : confirmed_status == 'false' ? '0' : { [Op.ne] : null }
    };

    // if receipt number assigned
    if (receipt_number == 'notempty') {
        filter.receipt_number = {
            [Op.ne]: null
        };
    }else if(receipt_number == 'empty'){
        filter.receipt_number = null
    }

    // if dateFrom & dateTo assigned
    if (dateFrom && dateTo) {

        const dateFromTrunc = new Date(new Date(dateFrom) - 0 * 0 * 0 * 1000)
        
        const dateToTrunc   = new Date(dateTo);
        dateToTrunc.setHours(30, 59, 59);

        filter.tgl_bayar = {
            [Op.between]: [dateFromTrunc, dateToTrunc]
        };
    }

    Payment.findAndCountAll({
        where: filter,
        offset,
        limit,
        order: [
            [sort_by, sort],
            [sort_by, sort]
        ],
        include: [
            {
                model: Student,
                attributes: ['nama_murid']
            },
            {
                model: Paket,
                attributes: ['nama_paket']
            }
        ]
    })
    .then((payments) => {

        let totalRecord = payments.count;
        let totalPages  = Math.ceil(totalRecord / itemsPerPage);

        let pagination  = {

            totalRecord : totalRecord,
            currentPage : pageNumber,
            totalPages  : totalPages,
            nextPage    : pageNumber < totalPages ? pageNumber + 1 : null,
            prevPage    : pageNumber > 1 ? pageNumber - 1 : null
            
        }

        res.send({
            status: 'success', 
            data: payments.rows,
            pagination: pagination
        });

    }).catch((error) => {
        res.status(500).json({ message: `Tidak berhasil menampilkan data Payment, ${error.message}` });
    });
};

// Find a single Payment with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Payment.findByPk(id)
        .then((payments) => {
        res.json({status: 'success', data: payments });
        }).catch((err) => {
            res.status(500).json({
                message: "Tidak berhasil menampilkan data Payment dengan id => " + id
            });
        });
};

// Find all packets of one student
exports.findStudentPacket = (req, res) => {
    const { studentIds } = req.query;

    // Split the studentIds string into an array of integers
    const idsArray = studentIds.split(',').map(String);

    Payment.findAll({
        where: {
            studentId: {
              [Op.in]: idsArray, 
            },
        },
        attributes: ['paketId','studentId'],
        include: [
            {
                model: Paket,
                attributes: ['nama_paket'],
            }
        ]
    })
    .then((packets) => {
        res.json({
            status: 'success',
            data: packets,
            idArray: idsArray
        });
    }).catch((err) => {
        res.status(500).json({
            message: "Tidak berhasil menampilkan data packet dengan studentId => " + studentIds
        });
    });
};

// Create and Save a new Payment
exports.create = (req, res) => {
    const payment = {
        paketId : req.body.paketId,
        studentId : req.body.studentId,
        userId : req.body.userId,
        tgl_tagihan : req.body.tgl_tagihan,
        tgl_bayar : req.body.tgl_bayar,
        jumlah_bayar : req.body.jumlah_bayar,
        bayar_via : req.body.bayar_via || null,
        quota_privat : req.body.quota_privat || null,
        quota_group : req.body.quota_group || null,
        confirmed_status : req.body.confirmed_status || false,
        receipt_number : req.body.receipt_number,
        term : req.body.term
    };
    // Save Payment in the database
    Payment.create(payment)
        .then((payments) => {
            res.json({message: 'Record Payment berhasil ditambahkan', data: payments });
        }).catch((err) => {
            res.status(500).json({ message: `Tidak berhasil menambah data payment, error : ${err.message}` });
        });
};

// Update a Payment by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Payment.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.json({message: 'Berhasil edit record payment'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil update payment dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil update payment dengan id => ' + id });
    });
};

// Delete a Payment with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Payment.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.json({message: 'Berhasil hapus record payment'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil hapus payment dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil hapus payment dengan id => ' + id });
    });
};


