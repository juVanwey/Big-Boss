const authguard = (req, res, next) => {
  try {
    // console.log("AUTH GUARD >>>", req.session.boss);
    if (req.session.boss) {
      return next(); // Si l'utilisateur est authentifié, on passe à la suite
    } else throw "Utilisateur non authentifié";
  } catch (error) {
    res.redirect("/login");
  }
};

module.exports = authguard;

// Ce middleware vérifie si l'utilisateur est authentifié
// Si oui, il passe à la suite du traitement de la requête
// Si non, il redirige vers la page de connexion
// Il est utilisé pour protéger les routes qui nécessitent une authentification
// Exemple d'utilisation : app.get('/protected', authguard, (req, res) => {
//   res.send('This is a protected route');
// });