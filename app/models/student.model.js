module.exports = (sequelize, Sequelize) => {
    const Student = sequelize.define("student", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nama_murid: {
            type: Sequelize.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        nama_wali: {
            type: Sequelize.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        nomor_va: {
            type: Sequelize.STRING(30),
            allowNull: true,
            defaultValue: null
        },
        telepon : {
            type : Sequelize.STRING(15),
            allowNull: true,
            defaultValue: null
        },
        tgl_lahir : {
            type : Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Student;
}