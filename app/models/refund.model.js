module.exports = (sequelize, Sequelize) => {
    const Refund = sequelize.define("refund", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId:{
            type: Sequelize.INTEGER,
            allowNull: true, 
            defaultValue: null
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: true, 
            defaultValue: null
        },
        paketId: {
            type: Sequelize.INTEGER
        },
        refund_amount : {
            type : Sequelize.STRING(15),
            allowNull: true, 
            defaultValue: null
        }, 
        quota_privat : {
            type : Sequelize.STRING(15),
            allowNull: true, 
            defaultValue: null
        },
        quota_group : {
            type : Sequelize.STRING(15),
            allowNull: true, 
            defaultValue: null
        },
        transfer_date : {
            type : Sequelize.DATEONLY,
            allowNull: true, 
            defaultValue: null
        },
        notes: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        timestamps: false // Disable automatic timestamps for this model
    });

    return Refund;
}