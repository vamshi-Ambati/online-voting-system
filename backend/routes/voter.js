const { handleRegister,handleLogin } = require("../controllers/voterController");

const router = require("express").Router();

router.post("/register",handleRegister);
router.post("/login",handleLogin)


module.exports = router;