const db = require("../models");
const Refund  = db.refunds;
const Paket   = db.pakets;
const Student = db.students;
const User    = db.users;
const { Op }  = require("sequelize");

User.hasMany(Refund);
Refund.belongsTo(User);

Paket.hasMany(Refund);
Refund.belongsTo(Paket);

Student.hasMany(Refund);
Refund.belongsTo(Student);

// Retrieve all refunds from the database.
exports.findAll = (req, res) => {
    const { studentId, paketId, page, perPage, dateFrom, dateTo } = req.query;

    // Parse page and perPage parameters and provide default values if not present
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber - 1) * itemsPerPage;
    const limit = itemsPerPage;

    // Define default values for sort and sort_by
    let sort    = "DESC"; 
    let sort_by = "transfer_date"; 

    if(req.query.sort != undefined && req.query.sort != null) {
        sort = req.query.sort;
    }

    if(req.query.sort_by != undefined && req.query.sort_by != null) {
        sort_by = req.query.sort_by;
    }

    const filter = {
        studentId: studentId || { [Op.ne] : null },
        paketId: paketId || { [Op.ne] : null }
    }

    // if dateFrom & dateTo assigned
    if (dateFrom && dateTo) {

        filter.transfer_date = {
            [Op.between]: [dateFrom, dateTo]
        };
    }

    Refund.findAndCountAll({
        where: filter,
        offset,
        limit,
        order: [
            [sort_by, sort]
        ],
        include: [
            {
                model: Paket,
                attributes: ['nama_paket']
            },
            {
                model: Student,
                attributes: ['nama_murid']
            }
        ]
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
            status: 'success',
            data: data.rows,
            pagination: pagination
        });

    }).catch((error) => {
        res.status(500).json({ message: `Tidak berhasil menampilkan data refund, err : ${error.message}` });
    });
};

// Find a single refund with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Refund.findByPk(id)
        .then((refunds) => {
        res.json({status: 'success', data: refunds });
        }).catch((err) => {
            res.status(500).json({
                message: "Tidak berhasil menampilkan data refund dengan id => " + id
            });
        });
};

// Create and Save a new refund
exports.create = (req, res) => {
    const refund = {
        studentId: req.body.studentId,
        paketId: req.body.paketId,
        refund_amount: req.body.refund_amount,
        quota_privat: req.body.quota_privat,
        quota_group: req.body.quota_group,
        transfer_date: req.body.transfer_date,
        notes: req.body.notes
    };
    // Save refund in the database
    Refund.create(refund)
        .then((refunds) => {
            res.json({message: 'Record refund berhasil ditambahkan', data: refunds });
        }).catch((err) => {
            res.status(500).json({ message: 'Tidak berhasil menambah data refund' });
        });
};

// Update a refund by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Refund.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.json({message: 'Berhasil edit record refund'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil update refund dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil update refund dengan id => ' + id });
    });
};

// Delete a refund with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Refund.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.json({message: 'Berhasil hapus record refund'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil hapus refund dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil hapus refund dengan id => ' + id });
    });
};




