const { PrismaClient } = require("../../generated/prisma");
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient({}).$extends(hashPasswordExtension)

// get : pour afficher le formulaire d'enregistrement du boss
exports.getRegisterBoss = async (req, res) => {
  // Test :
  // const bosses = await prisma.boss.findMany();
  // console.log(bosses);
  // res.render("pages/registerBoss.twig", { boss: bosses[0] });
  res.render("pages/registerBoss.twig", { boss: req.session.boss }); // on passe la session du boss pour afficher le bon header
};

// post : pour traiter les données du formulaire d'enregistrement du boss
exports.postRegisterBoss = async (req, res) => {
  try {
    // destructuration des données du formulaire
    const {
      companyName,
      siretNumber,
      directorName,
      password,
      confirmPassword,
    } = req.body;
    const errors = {}; // objet pour stocker les erreurs de validation

    // Vérifications

    if (!companyName || companyName.trim() === "") {
      errors.companyName = "La raison sociale est requise.";
    }

    if (!siretNumber || !/^\d{14}$/.test(siretNumber)) {
      errors.siretNumber =
        "Le numéro SIRET doit contenir exactement 14 chiffres.";
    }

    if (!password || password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    // Si des erreurs sont détectées, on les "jette" dans le catch
    if (Object.keys(errors).length > 0) {
      throw errors;
    }

    // Si tout est bon, on crée le boss
    await prisma.boss.create({
      data: {
        companyName,
        siretNumber,
        directorName: directorName || null,
        password,
        // = à ça sans la destructuration :
        // companyName: req.body.companyName,
        // siretNumber: req.body.siretNumber,
        // directorName: req.body.directorName,
        // password: req.body.password,
      },
    });
    res.redirect("/login");
  } catch (error) {
    // ici error === errors, c’est-à-dire l’objet d’erreurs envoyé dans le throw
    res.render("pages/registerBoss.twig", {
      error,
      old: req.body, // pour préremplir le formulaire
      boss: req.session.boss, // utile pour afficher le bon header
    });
  }
};

exports.getLoginBoss = async (req, res) => {
  res.render("pages/loginBoss.twig", { boss: req.session.boss }); // on passe la session du boss pour afficher le bon header
};

exports.postLoginBoss = async (req, res) => {
    try{    
        const boss = await prisma.boss.findUnique({
            where: {
                siretNumber: req.body.siretNumber
            }
        })
        if(boss){
            if(await bcrypt.compare(req.body.password, boss.password)){
                req.session.boss = boss
                res.redirect("/")
            }
            else throw {password : "Mot de passe incorrect"}
        }
        else throw {siretNumber: "Numéro SIRET incorrect"}
    }
    catch (error) {
        res.render("pages/loginBoss.twig", {
            error,
            boss: req.session.boss // utile pour afficher le bon header
        });
    }    
}

exports.getLogoutBoss = (req, res) => {
    req.session.destroy();
    res.redirect("/login")
}