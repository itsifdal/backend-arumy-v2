const db = require("../models");
const Post = db.posts;
const Op = db.Sequelize.Op;
const randomstring = require("randomstring");
const date = require('date-and-time');

// Return post Page.
exports.list = (req, res) => {
    Post.findAll()
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Error occured while find post List"
            });
        });
};

// Find a single post with an id
exports.findOneByDate = (req, res) => {
    const dateStart = req.params.dateStart;
    const dateEnd   = req.params.dateEnd;

    Post.findAll({where: {
        created: {
            [Op.between]: [dateStart,dateEnd]
        }
    }   
    })
    .then((data) => {
        res.send(data)
    }).catch((err) => {
        res.status(500).send({
            message: "Error retrieving post with slug=" + slug
        });
    });
};

// Create and Save a new post
exports.create = (req, res) => {

    slug = randomstring.generate({
        length: 8,
        charset: 'alphanumeric'
    });

    const now = new Date();
    dateNow   = date.format(now, 'YYYY-MM-DD');

    titleLower = req.body.title.toLowerCase(); //
    titleSplit = titleLower.split(" ");
    titleCount = titleSplit.filter(word => word !== '').length;
    if (titleCount == 1) {
        titleCombine = titleSplit[0];
    } else if(titleCount == 2) {
        titleCombine = titleSplit[0] + "-" + titleSplit[1];
    }else if(titleCount == 3){
        titleCombine = titleSplit[0] + "-" + titleSplit[1] + "-" + titleSplit[2];
    }else{
        titleCombine = titleSplit[0] + "-" + titleSplit[1] + "-" + titleSplit[2];
    }

    const post = {
        slug : titleCombine + slug,
        title: req.body.title,
        konten: req.body.konten,
        created : dateNow
    };

    // Save post in the database
    // console.log(post);
    Post.create(post)
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the post."
            })
        });
};


// Find a single post with an id
exports.findOne = (req, res) => {
    const slug = req.params.slug;

    Post.findAll({where:{slug : slug}})
        .then((response) => {
            res.send(response);
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving post with slug=" + slug
            });
        });
};

// Find a single post with an id
exports.findOneById = (req, res) => {
    const id = req.params.id;

    Post.findAll({where:{id: id}})
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving post with id=" + id
            });
        });
};

// Update a post by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Post.update(req.body, {
        where: { id: id }
    }).then((result) => {
        if ( result == 1 ) {
            res.send({
                message: "post was updated successfully"
            });
        } else {
            res.send({
                message: `Cannot update post with id=${id}.`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Error updating post with id=" + id
        })
    });
};

// Delete a post with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Post.destroy({
        where: { id: id }
    }).then((result) => {
        if (result == 1) {
            res.send({
                message: "post was deleted successfully"
            })
            //res.redirect('http://localhost:8080/api/post');
        } else {
            res.send({
                message: `Cannot delete post with id=${id}`
            })
        }
    }).catch((err) => {
        res.status(500).send({
            message: "Could not delete post with id=" + id
        })
    });
};



// Create and Save a new post
// exports.create = (req, res) => {
//     if(req.files === null) return res.status(400).json({msg: "No File Uploaded"});
//     const slug = req.body.slug;
//     const title = req.body.title;
//     const konten = req.body.konten;
//     const file = req.files.file;
//     const fileSize = file.data.length;
//     const ext = path.extname(file.name);
//     const fileName = file.md5 + ext;
//     const url = `${req.protocol}://${req.get("host")}/posts_images/${fileName}`;
//     const allowedType = ['.png','.jpg','.jpeg'];

//     if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
//     if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

//     file.mv(`./public/posts_images/${fileName}`, async(err)=>{
//         if(err) return res.status(500).json({msg: err.message});
//         try {
//             await Post.create({slug: slug, title: title, image: fileName, url: url, konten: konten});
//             res.status(201).json({msg: "Post Created Successfuly"});
//         } catch (error) {
//             console.log(error.message);
//         }
//     })
// };

// Update a post by the id in the request
// exports.update = async(req, res) => {
//     const post = await Post.findOne({
//         where:{
//             id : req.params.id
//         }
//     });
//     if(!post) return res.status(404).json({msg: "No Data Found"});
    
//     let fileName = "";
//     if(req.files === null){
//         fileName = post.image;
//     }else{
//         const file = req.files.file;
//         const fileSize = file.data.length;
//         const ext = path.extname(file.name);
//         fileName = file.md5 + ext;
//         const allowedType = ['.png','.jpg','.jpeg'];

//         if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
//         if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

//         // Remove old Pic 
//         const filepath = `./public/posts_images/${post.image}`;
//         fs.unlinkSync(filepath);

//         // Insert New Pic
//         file.mv(`./public/posts_images/${fileName}`, (err)=>{
//             if(err) return res.status(500).json({msg: err.message});
//         });
//     }
//     // Data to update
//     const slug = req.body.slug;
//     const title = req.body.title;
//     const konten = req.body.konten;
//     const url = `${req.protocol}://${req.get("host")}/posts_images/${fileName}`;
    
//     try {
//         await Post.update({slug: slug, title: title, image: fileName, url: url, konten: konten},{
//             where:{
//                 id: req.params.id
//             }
//         });
//         res.status(200).json({msg: "post Updated Successfuly"});
//     } catch (error) {
//         console.log(error.message);
//     }
// };

// // Delete a post with the specified id in the request
// exports.delete = async(req, res) => {
//     const post = await Post.findOne({
//         where:{
//             id : req.params.id
//         }
//     });
//     if(!post) return res.status(404).json({msg: "No Data Found"});

//     try {
//         const filepath = `./public/posts_images/${post.image}`;
//         fs.unlinkSync(filepath);
//         await Post.destroy({
//             where:{
//                 id : req.params.id
//             }
//         });
//         res.status(200).json({msg: "Post Deleted Successfuly"});
//     } catch (error) {
//         console.log(error.message);
//     }
// };
