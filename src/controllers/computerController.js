const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient({});

exports.getAddComputer = async (req, res) => {
  try {
    const bossId = req.session.boss.id;

    const availableEmployees = await prisma.employee.findMany({
      where: {
        bossId,
        computer: null, // Pas d'ordi associé
      },
      orderBy: { lastName: "asc" },
    });

    res.render("pages/addOrUpdateComputer.twig", {
      boss: req.session.boss,
      availableEmployees, // on envoie la liste à la vue
      computer: null, // Pas d'ordi pré-rempli ici
    });
  } catch (error) {
    console.error("❌ Erreur chargement formulaire :", error);
    res.redirect("/");
  }
};

exports.postAddComputer = async (req, res) => {
  try {
    const errors = {};
    const bossId = req.session.boss.id;
    const { macAddress, employeeId } = req.body;

    const existingComputer = await prisma.computer.findUnique({
      where: { macAddress },
    });
    if (existingComputer) {
      req.session.message = "❌ Cette adresse MAC existe déjà.";
      return res.redirect("/add-computer");
    }

    if (
      !macAddress ||
      !/^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/.test(macAddress)
    ) {
      errors.macAddress =
        "L'adresse MAC doit contenir 12 caractères hexadécimaux, au format XX:XX:XX:XX:XX:XX.";
    }

    if (Object.keys(errors).length > 0) {
      // gérer l'erreur (render ou json)
      return res.render("pages/addOrUpdateComputer.twig", {
        error: errors,
        old: req.body,
      });
    }

    console.log("Création ordinateur :", { macAddress, employeeId, bossId });


    await prisma.computer.create({
      data: {
        macAddress,
        boss: { connect: { id: bossId } },
        employee: employeeId
          ? { connect: { id: parseInt(employeeId) } }
          : undefined,
      },
    });

    req.session.message = "✅ Ordinateur ajouté avec succès !";
    res.redirect("/");
  } catch (error) {
    console.error("❌ Erreur enregistrement ordinateur :", error);
    req.session.message =
      "❌ Une erreur est survenue lors de l'enregistrement.";
    res.redirect("/add-computer");
  }
};

exports.deleteComputer = async (req, res) => {
  try {
    const computer = await prisma.computer.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    req.session.message = "Ordinateur supprimé avec succès !";
    res.redirect("/");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'ordinateur :", error);
    res.redirect("/");
  }
};

exports.getUpdateComputer = async (req, res) => {
  try {
    const bossId = req.session.boss.id;
    const computerId = parseInt(req.params.id);

    // Récupérer l'ordi à modifier
    const computer = await prisma.computer.findUnique({
      where: { id: computerId },
      include: { employee: true },
    });

    // Récupérer employés disponibles OU l'employé déjà lié à cet ordinateur (pour ne pas le retirer de la liste)
    let availableEmployees = await prisma.employee.findMany({
      where: {
        bossId,
        AND: [
          {
            OR: [
              { computer: null },
              { id: computer.employee?.id }, // Inclure l'employé lié à cet ordi
            ],
          },
        ],
      },
      orderBy: { lastName: "asc" },
    });

    res.render("pages/addOrUpdateComputer.twig", {
      boss: req.session.boss,
      computer,
      availableEmployees,
    });
  } catch (error) {
    console.error("❌ Erreur récupération ordinateur :", error);
    res.redirect("/");
  }
};

exports.postUpdateComputer = async (req, res) => {
  try {
    const computerId = parseInt(req.params.id);
    const { macAddress, employeeId } = req.body;

    // On veut modifier l'ordi, potentiellement lier/délier un employé
    const updateData = {
      macAddress,
      employee: employeeId
        ? { connect: { id: parseInt(employeeId) } }
        : { disconnect: true }, // Si aucun employé choisi, on délie l'actuel
    };

    await prisma.computer.update({
      where: { id: computerId },
      data: updateData,
    });

    req.session.message = "Ordinateur modifié avec succès !";
    res.redirect("/");
  } catch (error) {
    console.error("❌ Erreur mise à jour ordinateur :", error);

    // Recharger la liste employés et réafficher le formulaire avec erreur
    const bossId = req.session.boss.id;
    const computerId = parseInt(req.params.id);

    const computer = await prisma.computer.findUnique({
      where: { id: computerId },
      include: { employee: true },
    });

    const availableEmployees = await prisma.employee.findMany({
      where: {
        bossId,
        AND: [
          {
            OR: [{ computer: null }, { id: computer.employee?.id }],
          },
        ],
      },
      orderBy: { lastName: "asc" },
    });

    res.render("pages/addOrUpdateComputer.twig", {
      computer,
      boss: req.session.boss,
      availableEmployees,
      error: "Impossible de mettre à jour l'ordinateur.",
    });
  }
};

// const { PrismaClient } = require("../../generated/prisma");
// const prisma = new PrismaClient({});

// exports.getAddComputer = async (req, res) => {
//   res.render("pages/addOrUpdateComputer.twig", { boss: req.session.boss });
// };

// exports.postAddComputer = async (req, res) => {
//     try {
//       console.log("Formulaire reçu >>>", req.body);

//       const existingComputer = await prisma.computer.findUnique({
//         where: { macAddress: req.body.macAddress },
//       });

//       if (existingComputer) {
//         req.session.message = "❌ Cette adresse MAC existe déjà.";
//         return res.redirect("/add-computer");
//       }

//       const computer = await prisma.computer.create({
//         data: {
//           macAddress: req.body.macAddress,
//           boss: {
//             connect: { id: req.session.boss.id },
//           },
//         },
//       });

//       req.session.message = "✅ Ordinateur ajouté avec succès !";
//       res.redirect("/");
//     } catch (error) {
//       console.error("❌ Erreur enregistrement ordinateur :", error);
//       req.session.message = "❌ Une erreur est survenue lors de l'enregistrement.";
//       res.redirect("/add-computer");
//     }
//   };

// exports.deleteComputer = async (req, res) => {
//   try {
//     const computer = await prisma.computer.delete({
//       where: {
//         id: parseInt(req.params.id),
//       },
//     });
//     req.session.message = "Ordinateur supprimé avec succès !";
//     res.redirect("/");
//   } catch (error) {
//     console.error("❌ Erreur lors de la suppression de l'ordinateur :", error);
//     res.redirect("/");
//   }
// };

// exports.getUpdateComputer = async (req, res) => {
//   try {
//     const computer = await prisma.computer.findUnique({
//       where: {
//         id: parseInt(req.params.id),
//       },
//     });
//     res.render("pages/addOrUpdateComputer.twig", { computer, boss: req.session.boss });
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération de l'ordinateur :", error);
//     res.redirect("/");
//   }
// };

// exports.postUpdateComputer = async (req, res) => {
//   try {
//     const updatedComputer = await prisma.computer.update({
//       where: {
//         id: parseInt(req.params.id),
//       },
//       data: {
//         macAddress: req.body.macAddress,
//       },
//     });
//     req.session.message = "Ordinateur modifié avec succès !";
//     res.redirect("/");
//   } catch (error) {
//     console.error("❌ Erreur lors de la mise à jour de l'ordinateur :", error);

//     // Besoin des infos pour re-afficher le formulaire avec les données :
//     const computer = await prisma.computer.findUnique({
//       where: {
//         id: parseInt(req.params.id),
//       },
//     });

//     res.render("pages/addOrUpdateComputer.twig", {
//       employee,
//       boss: req.session.boss,
//       error: "Impossible de mettre à jour l'ordinateur.",
//     });
//   }
// };
