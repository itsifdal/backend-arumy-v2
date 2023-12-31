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
        cabangId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Room;
}