const db = require("../models");
const Payment = db.payments;
const Paket  = db.pakets;
const { Op } = require("sequelize");

Paket.hasMany(Payment);
Payment.belongsTo(Paket);

// Retrieve all Payments from the database.
exports.findAll = (req, res) => {
    Payment.findAll()
        .then((payments) => {
            res.send({status: 'success', data: payments });
        }).catch((error) => {
            res.status(500).json({ message: 'Tidak berhasil menampilkan data Payment' });
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

// Create and Save a new Payment
exports.create = (req, res) => {
    const payment = {
        paketId : req.body.paketId,
        studentId : req.body.studentId,
        tgl_tagihan : req.body.tgl_tagihan,
        tgl_bayar : req.body.tgl_bayar,
        jumlah_bayar : req.body.jumlah_bayar,
        bayar_via : req.body.bayar_via,
        quota_privat : req.body.quota_privat,
        quota_group : req.body.quota_group
    };
    // Save Payment in the database
    Payment.create(payment)
        .then((payments) => {
            res.json({message: 'Record Payment berhasil ditambahkan', data: payments });
        }).catch((err) => {
            res.status(500).json({ message: 'Tidak berhasil menambah data payment' });
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


