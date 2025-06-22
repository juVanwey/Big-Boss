module.exports = function employeeGuard(req, res, next) {
    if (req.session && req.session.employee) return next();
    return res.redirect("/login-employee");
  };
  