module.exports = app => {
    const post = require("../controllers/post.controller.js");

    let router = require("express").Router();
    
    // Retrieve all post
    router.get("/", post.list);
    
    // Create a new post
    router.post("/", post.create);

    // Retrieve single post by slug
    router.get("/:slug", post.findOne);

    // Retrieve single post id
    router.get("/:id", post.findOneById);
    
    // Retrieve single post by date
    router.get("/:dateStart/:dateEnd", post.findOneByDate);

    // Update post
    router.put("/:id", post.update);

    // Delete single post
    router.delete("/:id", post.delete);


    app.use("/api/post", router);
}