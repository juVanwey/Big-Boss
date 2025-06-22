const express = require("express")
const router = express.Router()
const mainController = require("../controllers/mainController");
const authguard = require("../services/authguard");

router.get("/", authguard, mainController.getHomeBoss); // Route pour la page d'accueil du boss
router.get("/welcome", mainController.getWelcomePage); // Route pour la page d'accueil publique

module.exports = router;