module.exports = (sequelize, Sequelize) => {
    const Teacher = sequelize.define("teacher", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nama_pengajar: {
            type: Sequelize.STRING(50),
        },
        telepon : {
            type : Sequelize.STRING(15)
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Teacher;
}