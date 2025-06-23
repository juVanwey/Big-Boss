const express = require('express');
const router = express.Router();
const bossController = require('../controllers/bossController');

router.get('/register', bossController.getRegisterBoss); // Route pour l'enregistrement du boss. Quand l'utilisateur tape cette route dans l'URL, il accède à la fonction register dans le bossController.
router.post('/register', bossController.postRegisterBoss); // Route pour traiter les données du formulaire d'enregistrement du boss
router.get('/login', bossController.getLoginBoss); // Route pour la connexion du boss
router.post('/login', bossController.postLoginBoss); // Route pour traiter les données du formulaire de connexion du boss
router.get('/logout', bossController.getLogoutBoss); // Route pour la déconnexion du boss  
router.get("/forgot-password", bossController.getForgotPassword); // Route pour afficher le formulaire de mot de passe oublié
router.post("/forgot-password", bossController.postForgotPassword); // Route pour traiter l'email envoyé pour le mot de passe oublié
router.get("/reset-password", bossController.getResetPassword); // Route pour afficher le formulaire de réinitialisation du mot de passe
router.post("/reset-password", bossController.postResetPassword); // Route pour traiter le formulaire de réinitialisation du mot de passe



module.exports = router;
// Exportation du routeur pour l'utiliser dans app.js

