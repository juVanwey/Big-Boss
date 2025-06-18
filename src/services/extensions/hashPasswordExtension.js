const { Prisma } = require("../../../generated/prisma");
const bcrypt = require("bcrypt");

module.exports = Prisma.defineExtension({
  name: "hashPassword",
  query: {
    boss: {
      create: async ({ args, query }) => {
        try {
          // 1. Récupération du mot de passe en clair dans args.data.password
          const hash = await bcrypt.hash(args.data.password, 10);  // Hashage

          // 2. Remplacement du mot de passe en clair par son hash
          args.data.password = hash;

          // 3. Appel de la requête Prisma originale avec le mot de passe hashé
          return query(args);
        } catch (error) {
          throw error;
        }
      },
    },
  },
});

// module.exports est la façon standard en Node.js d’exporter quelque chose (une fonction, un objet, une classe...) depuis un fichier pour pouvoir l'importer ailleurs avec require().
// Prisma.defineExtension est une méthode spéciale offerte par le client Prisma (depuis Prisma 4.x) qui permet de créer une extension personnalisée au client Prisma.
// Que fait Prisma.defineExtension ?
// Elle permet d'ajouter ou de modifier le comportement du client Prisma, par exemple :
// Intercepter ou modifier les requêtes avant qu'elles soient envoyées à la base,
// Ajouter des middlewares spécifiques à certains modèles (ici, boss),
// Modifier le comportement des méthodes comme create, update, etc.

// Cette extension ne gère que la création d'un boss.
// Pour gérer aussi les update du mot de passe, il faudra ajouter la même logique sur update.

// En résumé :
// Prisma.defineExtension crée une extension (= un objet avec une logique personnalisée).
// On exporte cette extension dans un fichier (hashPasswordExtension.js).
// On la require dans le controller : const hashPasswordExtension = require("../services/extensions/hashPasswordExtension");
// On pass cette extension à Prisma avec $extends : const prisma = new PrismaClient().$extends(hashPasswordExtension);
// Ensuite, Prisma applique automatiquement la logique personnalisée (hashage).




