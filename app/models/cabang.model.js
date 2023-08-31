module.exports = (sequelize, Sequelize) => {
    const Cabang = sequelize.define("cabang", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nama_cabang: {
            type: Sequelize.STRING(50)
        },
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Cabang;
}