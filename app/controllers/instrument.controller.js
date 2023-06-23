const db = require("../models");
const Instrument  = db.instruments;


// Retrieve all instruments from the database.
exports.findAll = (req, res) => {
    Instrument.findAll()
        .then((data) => {
            res.send(data);
        }).catch((error) => {
            res.status(500).json({ message: 'Tidak berhasil menampilkan data instrument' });
        });
};

// Find a single instrument with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Instrument.findByPk(id)
        .then((instruments) => {
        res.json({status: 'success', data: instruments });
        }).catch((err) => {
            res.status(500).json({
                message: "Tidak berhasil menampilkan data instrument dengan id => " + id
            });
        });
};

// Create and Save a new instrument
exports.create = (req, res) => {
    const instrument = {
        nama_instrument: req.body.nama_instrument
    };
    // Save instrument in the database
    Instrument.create(instrument)
        .then((instruments) => {
            res.json({message: 'Record instrument berhasil ditambahkan', data: instruments });
        }).catch((err) => {
            res.status(500).json({ message: 'Tidak berhasil menambah data instrument' });
        });
};

// Update a instrument by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Instrument.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.json({message: 'Berhasil edit record instrument'});
        } else {
            res.status(500).json({ message: 'Tidak berhasil update instrument dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil update instrument dengan id => ' + id });
    });
};

// Delete a instrument with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Instrument.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.json({message: 'Berhasil hapus record instrument' });
        } else {
            res.status(500).json({ message: 'Tidak berhasil hapus instrument dengan id => ' + id });
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Tidak berhasil hapus instrument dengan id => ' + id });
    });
};




