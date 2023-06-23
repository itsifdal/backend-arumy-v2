const db = require("../models");
const User = db.users;
const Room = db.rooms;
const Booking = db.bookings;
const Post    = db.posts;
const Op = db.Sequelize.Op;

// Count Room
exports.countBooking = (req, res) => {

    Booking.count({
        where: {
            id: {
              // Not Null
              [Op.ne]: null      
            }
        }
        })
        .then((data) => {
            res.send({
                data : data
            });
        })
};

// Count User
exports.countUser = (req, res) => {

    User.count({
        where: {
            id: {
              // Not Null
              [Op.ne]: null      
            }
        }
        })
        .then((data) => {
            res.send({
                data : data
            });
        });
};

// Count Room
exports.countRoom = (req, res) => {

    Room.count({
        where: {
            id: {
              // Not Null
              [Op.ne]: null      
            }
        }
        })
        .then((data) => {
            res.send({
                data : data
            });
        })
};

// Count Post
exports.countPost = (req, res) => {

    Post.count({
        where: {
            id: {
              // Not Null
              [Op.ne]: null      
            }
        }
        })
        .then((data) => {
            res.send({
                data : data
            });
        })
};
