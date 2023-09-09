const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config.js');

// Create a new Sequelize instance from the database configuration
const sequelize = new Sequelize('arumy_db', 'root', '31082023', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5, // maximum number of connections in the pool
        min: 0, // minimum number of connections in the pool
        acquire: 30000, // maximum time, in milliseconds, that the pool will try to get a connection before throwing an error
        idle: 10000, // maximum time, in milliseconds, that a connection can be idle before being released
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.users    = require("./user.model.js")(sequelize, Sequelize);
db.posts    = require("./post.model.js")(sequelize, Sequelize);

db.instruments  = require("./instrument.model.js")(sequelize, Sequelize);
db.rooms    = require("./room.model.js")(sequelize, Sequelize);
db.cabangs  = require("./cabang.model.js")(sequelize, Sequelize);
db.pakets   = require("./paket.model.js")(sequelize, Sequelize);
db.teachers = require("./teacher.model.js")(sequelize, Sequelize);
db.students = require("./student.model.js")(sequelize, Sequelize);
db.payments = require("./payment.model.js")(sequelize, Sequelize);
db.bookings = require("./booking.model.js")(sequelize, Sequelize);


module.exports = db;