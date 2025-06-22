const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient({});
const bcrypt = require("bcrypt");

exports.getAddEmployee = async (req, res) => {
  res.render("pages/addOrUpdateEmployee.twig", { boss: req.session.boss });
};

exports.postAddEmployee = async (req, res) => {
  try {
    console.log("Formulaire reçu >>>", req.body);

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const employee = await prisma.employee.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        age: parseInt(req.body.age),
        gender: req.body.gender,
        bossId: req.session.boss.id,
      },
    });
    console.log("✅ Enregistré :", employee);
    req.session.message = "Employé ajouté avec succès !";
    res.redirect("/");
  } catch (error) {
    console.error("❌ Erreur enregistrement employé :", error);
    res.render("pages/addOrUpdateEmployee.twig", { boss: req.session.boss });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    req.session.message = "Employé supprimé avec succès !";
    res.redirect("/");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'employé :", error);
    res.redirect("/");
  }
};

exports.getUpdateEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    res.render("pages/addOrUpdateEmployee.twig", { employee, boss: req.session.boss });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'employé :", error);
    res.redirect("/");
  }
};

exports.postUpdateEmployee = async (req, res) => {
  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        age: parseInt(req.body.age),
        email: req.body.email,
        ...(req.body.password && {
          password: await bcrypt.hash(req.body.password, 10),
        }),
      },
    });
    req.session.message = "Employé modifié avec succès !";
    res.redirect("/");
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de l'employé :", error);

    // Besoin des infos pour re-afficher le formulaire avec les données :
    const employee = await prisma.employee.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    res.render("pages/addOrUpdateEmployee.twig", {
      employee,
      boss: req.session.boss,
      error: "Impossible de mettre à jour l'employé.",
    });
  }
};

// Ajout de la consigne suivante :
// Un utilisateur peut se connecter (pas s’inscrire) à l’aide des identifiants renseignés par le chef d’entreprise (mail, mot de passe). Il aura alors accès, sur sa page d’accueil, à ses informations personnelles et à l’adresse MAC de l’ordinateur auquel il est associé.

// GET /login-employee
exports.getLoginEmployee = (req, res) => {
  res.render("pages/loginEmployee.twig", {
    error: null,
    currentUrl: req.originalUrl,
  });
};

// POST /login-employee
exports.postLoginEmployee = async (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  const employee = await prisma.employee.findUnique({ where: { email } });

  if (!employee) {
    errors.email = "Adresse email inconnue";
    return res.render("pages/loginEmployee.twig", { error: errors }, { currentUrl: req.originalUrl });
  }

  const ok = await bcrypt.compare(password, employee.password);
  if (!ok) {
    errors.password = "Mot de passe incorrect";
    return res.render("pages/loginEmployee.twig", { error: errors }, { currentUrl: req.originalUrl });
  }

  // ✅ login réussi
  req.session.employee = employee;     // on stocke l'employé
  res.redirect("/employee-home");
};

// GET /employee-home
exports.getEmployeeHome = async (req, res) => {
  // on récupère l'employé en session
  const employeeId = req.session.employee.id;

  // inclure l'ordi associé
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { computer: true }, // computer contient la MAC
  });

  res.render("pages/employeeHome.twig", { employee });
};

// Déconnexion employé

exports.getLogoutEmployee = (req, res) => {
  req.session.destroy();
  res.redirect("/welcome")
}
