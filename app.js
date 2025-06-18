const express = require('express');
const bossRoutes = require('./src/routes/bossRoutes');
const mainRoutes = require('./src/routes/mainRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const computerRoutes = require('./src/routes/computerRoutes');
const session = require('express-session');

const app = express();
app.set('views', './src/views');
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true })); // rendre form accessible dans le controller
app.use(session({
secret: "hahaha", // secret pour signer le cookie de session
resave: true, // resave la session même si elle n'a pas été modifiée
saveUninitialized: true, // sauvegarder la session même si elle n'est pas initialisée
}))

app.use(bossRoutes); // les routes toujours après l'initialisation de l'application / en dernier
app.use(mainRoutes);
app.use(employeeRoutes);
app.use(computerRoutes);

app.listen(2020, () => {
//   console.log('Server is running on http://localhost:2020');
  console.log('Écoute sur le port 2020');
});
