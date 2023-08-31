const db = require("../models");
const Cabang  = db.cabangs;


// Retrieve all cabang from the database.
exports.findAll = (req, res) => {
    Cabang.findAll()
        .then((cabang) => {
            res.json({status: 'success', data: cabang });
        }).catch((error) => {
            res.status(500).json({ message: 'Tidak berhasil menampilkan data cabang' });
        });
};

// Find a single packet with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Cabang.findByPk(id)
        .then((cabang) => {
        res.json({status: 'success', data: cabang });
        }).catch((err) => {
            res.status(500).json({
                message: "Tidak berhasil menampilkan data cabang dengan id => " + id
            });
        });
};

// Create and Save a new packet
exports.create = (req, res) => {
    const packet = {
        nama_cabang: req.body.nama_cabang,
    };
    // Save packet in the database
    Cabang.create(packet)
        .then((cabang) => {
            res.json({message: 'Record cabang berhasil ditambahkan', data: cabang });
        }).catch((err) => {
            res.status(500).json({ message: 'Tidak berhasil menambah data cabang' });
        });
};

// Update a packet by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Cabang.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.json({message: 'Berhasil edit record cabang'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil update cabang dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil update cabang dengan id => ' + id });
    });
};

// Delete a packet with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Cabang.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.json({message: 'Berhasil hapus record cabang'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil hapus cabang dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil hapus cabang dengan id => ' + id });
    });
};




