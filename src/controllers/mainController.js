const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

exports.getWelcomePage = (req, res) => {
  res.render("pages/welcome"); // twig lira welcome.twig dans ton dossier templates/views
};

exports.getHomeBoss = async (req, res) => {
  try {
    // const boss = await prisma.boss.findUnique({
    //   where: {
    //     id: req.session.boss.id,
    //   },
    //   include: {
    //     employees: true, // Inclure les employés du boss
    //     computers: true, // Inclure les ordinateurs du boss
    //   },
    // });
    const boss = await prisma.boss.findUnique({
      where: {
        id: req.session.boss.id,
      },
      include: {
        employees: true, // les employés du boss
        computers: {
          include: {
            employee: true,  // pour inclure l'employé associé à chaque ordinateur
          }
        }
      }
    });
    

    // ✅ Récupérer le message flash depuis la session
    const message = req.session.message;
    delete req.session.message; // on l'efface juste après l’avoir lu

    res.render("pages/bossHome.twig", {
      boss: req.session.boss, // on passe le boss à la vue
      employees: boss.employees, // on passe les employés à la vue
      computers: boss.computers, // on passe les ordinateurs à la vue
      message, // on passe le message à la vue
    });

  } catch (error) {
    res.render("pages/bossHome.twig", {
      boss: req.session.boss,
      error: "Une erreur est survenue lors du chargement des employés.",
    });
  }
};

