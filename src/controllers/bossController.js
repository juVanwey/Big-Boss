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
  res.render("pages/registerBoss.twig", { boss: req.session.boss, currentUrl: req.originalUrl }); // on passe la session du boss pour afficher le bon header
};

// post : pour traiter les données du formulaire d'enregistrement du boss
exports.postRegisterBoss = async (req, res) => {
  try {
    // destructuration des données du formulaire
    const {
      companyName,
      siretNumber,
      directorName,
      email,
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

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Veuillez saisir une adresse email valide.";
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
        email,
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
      old: req.body,
      boss: req.session.boss,
      currentUrl: req.originalUrl
    });    
  }
};

exports.getLoginBoss = async (req, res) => {
  res.render("pages/loginBoss.twig", {
    boss: req.session.boss,
    currentUrl: req.originalUrl
  });
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
        boss: req.session.boss,
        currentUrl: req.originalUrl
      });      
    }    
}

exports.getLogoutBoss = (req, res) => {
    req.session.destroy();
    res.redirect("/welcome")
}

// Gérer les mdp oubliés :

const crypto = require("crypto");
const { sendResetEmail, sendConfirmationEmail } = require("../services/mailer");


// Affiche le formulaire
exports.getForgotPassword = (req, res) => {
  res.render("pages/forgotPassword.twig", {
    error: null,
    message: null,
  });
};

// Traite l'email envoyé

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  const errors = {};

  const boss = await prisma.boss.findUnique({ where: { email } });

  if (!boss) {
    errors.email = "Aucun compte trouvé avec cette adresse e-mail.";
    return res.render("pages/forgotPassword.twig", { error: errors, message: null });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.boss.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });

  const resetUrl = `http://localhost:2020/reset-password?token=${token}`;
  await sendResetEmail(email, resetUrl); // 👈 Envoi de l'e-mail

  res.render("pages/forgotPassword.twig", {
    error: null,
    message: "Un lien de réinitialisation vous a été envoyé par e-mail.",
  });
};

// exports.postForgotPassword = async (req, res) => {
//   const { email } = req.body;
//   const errors = {};

//   if (!email || !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email)) {
//     errors.email = "Adresse email invalide.";
//     return res.render("pages/forgotPassword.twig", { error: errors });
//   }

//   const boss = await prisma.boss.findUnique({ where: { email } });

//   if (!boss) {
//     errors.email = "Aucun compte associé à cette adresse.";
//     return res.render("pages/forgotPassword.twig", { error: errors });
//   }

//   // Génère un token aléatoire
//   const token = crypto.randomBytes(32).toString("hex");
//   const expiry = new Date(Date.now() + 3600000); // expire dans 1h

//   await prisma.boss.update({
//     where: { email },
//     data: {
//       resetToken: token,
//       resetTokenExpiry: expiry,
//     },
//   });

//   // À ce stade, on pourrait envoyer un email avec le lien réel
//   // Mais pour l’instant, on va juste l’afficher sur la page :
//   const message = `Un lien de réinitialisation a été généré :
//   http://localhost:2020/reset-password?token=${token}`;

//   res.render("pages/forgotPassword.twig", { message, error: null });
// };

// GET /reset-password?token=abc123
exports.getResetPassword = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.send("Lien invalide.");
  }

  const boss = await prisma.boss.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(), // token non expiré
      },
    },
  });

  if (!boss) {
    return res.send("Lien invalide ou expiré.");
  }

  res.render("pages/resetPassword.twig", {
    token,
    error: null,
    message: null,
  });
};

// POST /reset-password
exports.postResetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  const errors = {};

  if (!password || password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }

  if (Object.keys(errors).length > 0) {
    return res.render("pages/resetPassword.twig", {
      token,
      error: errors,
      message: null,
    });
  }

  const boss = await prisma.boss.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!boss) {
    return res.send("Lien invalide ou expiré.");
  }

  // Hash du nouveau mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Met à jour le mot de passe hashé et supprime le token
  await prisma.boss.update({
    where: { id: boss.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // Envoi d'un e-mail de confirmation
  await sendConfirmationEmail(boss.email);

  res.render("pages/resetPassword.twig", {
    token: null,
    error: null,
    message: "Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter.",
  });
};


// // POST /reset-password
// exports.postResetPassword = async (req, res) => {
//   const { token, password, confirmPassword } = req.body;
//   const errors = {};

//   if (!password || password.length < 8) {
//     errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
//   }

//   if (password !== confirmPassword) {
//     errors.confirmPassword = "Les mots de passe ne correspondent pas.";
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.render("pages/resetPassword.twig", {
//       token,
//       error: errors,
//       message: null,
//     });
//   }

//   const boss = await prisma.boss.findFirst({
//     where: {
//       resetToken: token,
//       resetTokenExpiry: {
//         gte: new Date(),
//       },
//     },
//   });

//   if (!boss) {
//     return res.send("Lien invalide ou expiré.");
//   }

//   // Met à jour le mot de passe et supprime le token
//   await prisma.boss.update({
//     where: { id: boss.id },
//     data: {
//       password,
//       resetToken: null,
//       resetTokenExpiry: null,
//     },
//   });

//   res.render("pages/resetPassword.twig", {
//     token: null,
//     error: null,
//     message: "Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter.",
//   });
// };

