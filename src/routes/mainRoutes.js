const express = require("express")
const router = express.Router()
const mainController = require("../controllers/mainController");
const authguard = require("../services/authguard");

router.get("/", authguard, mainController.getHomeBoss); // Route pour la page d'accueil du boss

module.exports = router;