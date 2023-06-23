module.exports = app => {
    const user = require("../controllers/user.controller.js");

    let router = require("express").Router();

    // Retrieve all userss
    router.get("/", user.list);

    // Create a new user
    router.post("/", user.create);
    
    // Retrieve single user
    router.get("/:id", user.findOne);

    // Update user
    router.put("/:id", user.update);

    // Delete single user
    router.delete("/:id", user.delete);

    app.use("/api/user", router);
}