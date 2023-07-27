const db = require("../models");
const Teacher = db.teachers;
const Booking = db.bookings;
const { Sequelize } = require('sequelize');


// Retrieve all teachers from the database.
exports.findAll = (req, res) => {
    Teacher.findAll()
        .then((data) => {
            res.send(data);
        }).catch((error) => {
            res.status(500).json({ message: 'Tidak berhasil menampilkan data teacher' });
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


