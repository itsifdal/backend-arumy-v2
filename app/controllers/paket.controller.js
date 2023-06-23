const db = require("../models");
const Paket  = db.pakets;


// Retrieve all packets from the database.
exports.findAll = (req, res) => {
    Paket.findAll()
        .then((packets) => {
            res.json({status: 'success', data: packets });
        }).catch((error) => {
            res.status(500).json({ message: 'Tidak berhasil menampilkan data packet' });
        });
};

// Find a single packet with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Paket.findByPk(id)
        .then((packets) => {
        res.json({status: 'success', data: packets });
        }).catch((err) => {
            res.status(500).json({
                message: "Tidak berhasil menampilkan data packet dengan id => " + id
            });
        });
};

// Create and Save a new packet
exports.create = (req, res) => {
    const packet = {
        nama_paket: req.body.nama_paket,
        harga: req.body.harga,
        quota_privat: req.body.quota_privat,
        quota_group: req.body.quota_group
    };
    // Save packet in the database
    Paket.create(packet)
        .then((packets) => {
            res.json({message: 'Record packet berhasil ditambahkan', data: packets });
        }).catch((err) => {
            res.status(500).json({ message: 'Tidak berhasil menambah data packet' });
        });
};

// Update a packet by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Paket.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.json({message: 'Berhasil edit record packet'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil update packet dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil update packet dengan id => ' + id });
    });
};

// Delete a packet with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Paket.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.json({message: 'Berhasil hapus record packet'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil hapus packet dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil hapus packet dengan id => ' + id });
    });
};




