const db = require("../models");
const Paket  = db.pakets;
const Instrument = db.instruments;

Instrument.hasMany(Paket);
Paket.belongsTo(Instrument);

// Retrieve all packets from the database.
exports.findAll = (req, res) => {

    const { page, perPage } = req.query;

    // Parse page and perPage parameters and provide default values if not present
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Calculate offset and limit for pagination
    const offset = (pageNumber - 1) * itemsPerPage;
    const limit = itemsPerPage;

    Paket.findAndCountAll({
        offset,
        limit,
        include: [
            {
                model: Instrument,
                attributes: ['nama_instrument']
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
        res.status(500).json({ message: `Tidak berhasil menampilkan data packet, ${error.message} ` });
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
        instrumentId : req.body.instrumentId || null,
        packet_category : req.body.packet_category || null,
        nama_paket: req.body.nama_paket,
        description : req.body.description || null,
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




