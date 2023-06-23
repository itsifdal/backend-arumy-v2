module.exports = (sequelize, Sequelize) => {
    const Paket = sequelize.define("paket", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nama_paket: {
            type: Sequelize.STRING(50)
        },
        harga: {
            type: Sequelize.STRING(50)
        },
        quota_privat: {
            type: Sequelize.STRING(50)
        },
        quota_group: {
            type: Sequelize.STRING(50)
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Paket;
}