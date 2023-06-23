/**
 * These columns will be generated automatically: 
 * id, title, description, published, createdAt, updatedAt.
 * create a new Post: create(object)
 * find a Post by id: findByPk(id)
 * get all Posts: findAll()
 * update a Post by id: update(data, where: { id: id })
 * remove a Post: destroy(where: { id: id })
 * remove all Posts: destroy(where: {})
 * find all Posts by title: findAll({ where: { title: ... } })
 * These functions will be used in our Controller.
 */
module.exports = (sequelize, Sequelize) => {
    const Post = sequelize.define("post", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        slug: {
            type: Sequelize.STRING,
            unique: true,
            isLowercase: true
        },
        title: {
            type: Sequelize.STRING,
        },
        konten: {
            type: Sequelize.STRING
        },
        created : {
            type : Sequelize.STRING
        }
    },{
        timestamps: false, // Disable automatic timestamps for this model
    });

    return Post;
}