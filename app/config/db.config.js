module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "",
    DB: "",
    dialect: "mysql",
    pool: {
        max: 5, // maximum number of connection in pool
        min: 0, // minimum number of connection in pool
        acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being released
        // USER: "n1604823_ifdalroam",
        // PASSWORD: "7oKD!yn8=m(=",
        // DB: "n1604823_arumy",
    }
};
