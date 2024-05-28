const express = require("express")
const router = express.Router()
const {registerUser,authUser,getUsers} = require("../controllers/userController")
const {protect} = require("../middleware/authMiddleware")

router.route("/").post(registerUser).get(protect,getUsers);
router.route("/login").post(authUser)

module.exports=router;