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
