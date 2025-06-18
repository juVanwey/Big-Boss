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