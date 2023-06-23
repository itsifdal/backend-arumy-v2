module.exports = (sequelize, Sequelize) => {
    const Student = sequelize.define("student", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nama_murid: {
            type: Sequelize.STRING(50),
        },
        nama_wali: {
            type: Sequelize.STRING(50),
        },
        nomor_va: {
            type: Sequelize.STRING(30),
        },
        telepon : {
            type : Sequelize.STRING(15)
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Student;
}