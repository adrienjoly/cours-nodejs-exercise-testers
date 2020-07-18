// import des dépendance
const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const { MongoClient } = require('mongodb');
const options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

// config constante
const port = process.env.port || 3000,
    MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'user',
    MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'apiNom',
    MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/apiNom';

// init mongodb
const client = new MongoClient(MONGODB_URL);
mongoose.connect(MONGODB_URL, options);

// create du schema user
const userSchema = mongoose.Schema({
    nom: String
})
const User = mongoose.model('User', userSchema)

// config express
const app = express();

app.use(bodyParser.urlencoded({extended: true}))

app.get('/', async (req, res) => {
    try {
        const lastUser = await User.findOne().sort({ field: 'asc', _id: -1 }).limit(1)
        if (lastUser) {
            res.send("La dernière personne que j'ai rencontrée est: " + lastUser.nom + ".");
        } else {
            res.send("Je n'ai rencontré personne pour l'instant")
        }
    } catch (err) {
        res.send("J'ai perdu la mémoire...");
    }
})

app.post('/', (req, res) => {
    console.log(MONGODB_URL)
    if (req.body.nom) {
        const user = new User();
        user.nom = req.body.nom;
        user.save();
        res.send("Bienvenue, " + user.nom + '.');
    } else {
        res.send('Il manque votre nom.')
    }
})

// lance le serv
app.listen(port, () => {
    console.log('app listen on http://localhost:' + port)
})