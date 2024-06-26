module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("payment", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        paketId: {
            type: Sequelize.INTEGER
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: true, 
            defaultValue: null
        },
        userId: {
            type: Sequelize.INTEGER
        },
        tgl_tagihan: {
            type: Sequelize.DATE,
            allowNull: true, 
            defaultValue: null
        },
        tgl_bayar: {
            type: Sequelize.DATE,
            allowNull: true, 
            defaultValue: null
        },
        jumlah_bayar : {
            type : Sequelize.STRING(15),
            allowNull: true, 
            defaultValue: null
        },
        bayar_via : {
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
        confirmed_status : {
            type : Sequelize.BOOLEAN,
            allowNull: false, 
            defaultValue: false
        },
        receipt_number : {
            type : Sequelize.STRING(30),
            allowNull: true, 
            defaultValue: null
        },
        term: {
            type: Sequelize.STRING(10),
            allowNull: true,
            defaultValue: null
        }
    },{
        timestamps: false // Disable automatic timestamps for this model
    });

    return Payment;
}