module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define("booking", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tgl_kelas: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        },
        cabang: {
            type: Sequelize.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        jam_booking: {
            type: Sequelize.TIME,
            allowNull: true,
            defaultValue: null
        },
        jenis_kelas: {
            type: Sequelize.ENUM('privat', 'group'),
            allowNull: true,
            defaultValue: 'privat'
        },
        durasi: {
            type: Sequelize.STRING(30),
            allowNull: true,
            defaultValue: null
        },
        status: {
            type: Sequelize.ENUM('confirmed', 'pending', 'cancel'),
            allowNull: false,
            defaultValue: 'pending' // Set the default value to 'pending'
        },
        roomId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        teacherId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        instrumentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    });

    return Booking;
}