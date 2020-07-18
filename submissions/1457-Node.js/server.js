const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;

process.env['PORT'] = "3000";
process.env['MANGODB_URL'] = "mongodb+srv://chatbot:chatbot@chatbot-nodejs-wts3i.azure.mongodb.net/test?retryWrites=true&w=majority"
process.env['MANGODB_DATABASE'] = "app-partiel"
process.env['MANGODB_COLLECTION'] = "noms"


const client = new MongoClient(process.env.MANGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

(async () =>{
  try{

    await client.connect();
    const db = client.db(process.env.MANGODB_DATABASE);
    const colName = db.collection(process.env.MANGODB_COLLECTION)

    app.use(bodyParser.urlencoded({
      extended: true
    }));
    
    app.get('/', async function (req, res) {
      try{
        const name = await colName.find({}).toArray();
        if(name.length > 0){
          res.send("La dernière personne que j'ai rencontrée est: "+ name[0].nom +".")
        } else {
          res.send("Je n'ai rencontré personne pour l'instant")
        }
      }catch(err){
        res.send("J'ai perdu la mémoire...")
      }
    })
    
    app.post('/', async function (req, res) {
      if(req.body.nom === undefined){
        res.send('Il manque votre nom.')
      } else {
        const name = await colName.find({}).toArray();
        if(name.length > 0){
          const addName = await colName.findOneAndUpdate({_id: name[0]._id},  {$set: {nom: req.body.nom}})
        } else {
          const addName = await colName.insertOne({nom: req.body.nom})
        }
        res.send('Bienvenue, ' + req.body.nom + '.')
      }
    })
    
    app.listen(process.env.PORT, function () {
      console.log('Example app listening on port ' + process.env.PORT + '!')
    })

  } catch (err) {
    console.log(err.stack);
  }

})()

