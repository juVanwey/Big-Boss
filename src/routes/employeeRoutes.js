const express = require("express")
const router = express.Router()
const employeeController = require("../controllers/employeeController");
const authguard = require("../services/authguard");

router.get("/add-employee", authguard, employeeController.getAddEmployee); // Route pour afficher le formulaire d'ajout d'un employé
router.post("/add-employee", authguard, employeeController.postAddEmployee); // Route pour traiter les données du formulaire d'ajout d'un employé

router.get("/delete-employee/:id", authguard, employeeController.deleteEmployee); // Route pour supprimer un employé

router.get("/update-employee/:id", authguard, employeeController.getUpdateEmployee); // Route pour afficher le formulaire d'édition d'un employé
router.post("/update-employee/:id", authguard, employeeController.postUpdateEmployee); // Route pour traiter les données du formulaire d'édition d'un employé

module.exports = router;