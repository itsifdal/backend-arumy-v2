module.exports = (sequelize, Sequelize) => {
    const Room = sequelize.define("room", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nama_ruang: {
            type: Sequelize.STRING(50)
        },
        lokasi_cabang: {
            type: Sequelize.STRING(50)
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Room;
}