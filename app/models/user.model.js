module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        teacherId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        name: {
            type: Sequelize.STRING(100),
            unique: true
        },
        email: {
            type: Sequelize.STRING(30),
            unique: true
        },
        password: {
            type: Sequelize.STRING(100),
            unique: false
        },
        role: {
            type: Sequelize.ENUM('Admin', 'Reguler', 'Guru'),
            allowNull: false,
            defaultValue: 'Reguler' // Set the default value to 'reguler user'
        },
        token: {
            type: Sequelize.TEXT
        },
        last_login: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return User;
}