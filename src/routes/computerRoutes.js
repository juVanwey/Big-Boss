const express = require("express")
const router = express.Router()
const computerController = require("../controllers/computerController");
const authguard = require("../services/authguard");

router.get("/add-computer", authguard, computerController.getAddComputer); // Route pour afficher le formulaire d'ajout d'un ordinateur
router.post("/add-computer", authguard, computerController.postAddComputer); // Route pour traiter les données du formulaire d'ajout d'un ordinateur

router.get("/delete-computer/:id", authguard, computerController.deleteComputer); // Route pour supprimer un ordinateur

router.get("/update-computer/:id", authguard, computerController.getUpdateComputer); // Route pour afficher le formulaire d'édition d'un ordinateur
router.post("/update-computer/:id", authguard, computerController.postUpdateComputer); // Route pour traiter les données du formulaire d'édition d'un ordinateur

module.exports = router;