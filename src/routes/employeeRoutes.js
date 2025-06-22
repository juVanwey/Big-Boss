const express = require("express")
const router = express.Router()
const employeeController = require("../controllers/employeeController");
const authguard = require("../services/authguard");

router.get("/add-employee", authguard, employeeController.getAddEmployee); // Route pour afficher le formulaire d'ajout d'un employé
router.post("/add-employee", authguard, employeeController.postAddEmployee); // Route pour traiter les données du formulaire d'ajout d'un employé

router.get("/delete-employee/:id", authguard, employeeController.deleteEmployee); // Route pour supprimer un employé

router.get("/update-employee/:id", authguard, employeeController.getUpdateEmployee); // Route pour afficher le formulaire d'édition d'un employé
router.post("/update-employee/:id", authguard, employeeController.postUpdateEmployee); // Route pour traiter les données du formulaire d'édition d'un employé

// Ajout de la consigne suivante :
// Un utilisateur peut se connecter (pas s’inscrire) à l’aide des identifiants renseignés par le chef d’entreprise (mail, mot de passe). Il aura alors accès, sur sa page d’accueil, à ses informations personnelles et à l’adresse MAC de l’ordinateur auquel il est associé.

const employeeGuard = require("../services/employeeGuard");

router.get("/login-employee", employeeController.getLoginEmployee); // Route pour afficher le formulaire de connexion de l'employé
router.post("/login-employee", employeeController.postLoginEmployee); // Route pour traiter les données du formulaire de connexion de l'employé
router.get("/employee-home", employeeGuard, employeeController.getEmployeeHome); // Route pour afficher la page d'accueil de l'employé
router.get("/logout-employee", employeeGuard, employeeController.getLogoutEmployee); // Route pour déconnecter l'employé

module.exports = router;