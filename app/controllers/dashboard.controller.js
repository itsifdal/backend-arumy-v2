const db = require("../models");
const User = db.users;
const Room = db.rooms;
const Teacher = db.teachers;
const Instrument = db.instruments;
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

exports.getBooking = async (req, res) => {
  const { tgl_kelas, page, perPage } = req.query;

  // If tgl_kelas is null or not provided, set it to today's date
  const today = new Date();
  const defaultTglKelas = tgl_kelas ? tgl_kelas : today.toISOString().split('T')[0];

  const filter = {
    tgl_kelas: defaultTglKelas,
  };

  // Parse page and perPage parameters and provide default values if not present
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;

  // Calculate offset and limit for pagination
  const offset = (pageNumber - 1) * itemsPerPage;
  const limit = itemsPerPage;

  Booking.findAll({
    where: filter,
    attributes: ['id', 'user_group', 'teacherId', 'roomId', 'instrumentId', 'status','jenis_kelas','tgl_kelas','jam_booking','durasi','selesai'],
    offset,
    limit,
    include: [
      {
        model: Room,
        attributes: ['nama_ruang'],
      },
      {
        model: Teacher,
        attributes: ['nama_pengajar'],
      },
      {
        model: Instrument,
        attributes: ['nama_instrument'],
      },
    ],
  })
  .then((bookings) => {
    // Group bookings by room names
    const groupedBookings = [];

    bookings.forEach((booking) => {
      const roomName = booking.room ? booking.room.nama_ruang : 'Unknown Room';

      // Extract the roomId from the booking object
      const roomId = booking.roomId;

      // Remove the roomId from the booking object
      const bookingData = booking.get();
      delete bookingData.roomId;

      // Check if the room already exists in groupedBookings
      const existingRoom = groupedBookings.find((room) => room.roomName === roomName);

      if (existingRoom) {
        existingRoom.booking.push(bookingData);
      } else {
        groupedBookings.push({
          roomName: roomName,
          roomId: roomId, // Add the roomId to the main level
          booking: [bookingData],
        });
      }
    });

    res.send({
      data: groupedBookings,
    });
  })
  .catch((err) => {
    res.status(500).json({ message: `Failed to fetch booking data: ${err.message}` });
  });
};


