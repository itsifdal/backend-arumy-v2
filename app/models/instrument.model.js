module.exports = (sequelize, Sequelize) => {
    const Instrument = sequelize.define("instrument", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nama_instrument: {
            type: Sequelize.STRING(50)
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Instrument;
}