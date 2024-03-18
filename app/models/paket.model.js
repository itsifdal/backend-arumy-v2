module.exports = (sequelize, Sequelize) => {
    const Paket = sequelize.define("paket", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        instrumentId:{
            type: Sequelize.INTEGER,
        },
        packet_category: {
            type: Sequelize.STRING(50)
        },
        nama_paket: {
            type: Sequelize.STRING(50)
        },
        description: {
            type: Sequelize.TEXT
        },
        harga: {
            type: Sequelize.STRING(40)
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