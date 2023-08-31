const db = require("../models");
const Teacher = db.teachers;
const Booking = db.bookings;
const { Sequelize } = require('sequelize');


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


