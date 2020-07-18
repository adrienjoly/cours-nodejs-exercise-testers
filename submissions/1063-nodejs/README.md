### Partiel Node.JS 

Projet qui a pour but de répondre bonjour à une personne avec une mise en mémoire des noms.

Dépendances : 
-  "body-parser": "^1.19.0",
-  "dotenv": "^8.2.0",
-  "express": "^4.17.1",
-  "mongodb": "^3.5.9"

Pour l'installer :

- ```npm install```

Pour le lancer : 
- ```npm start```

## Setup

Pour pouvoir setup le projet il y a 3 variables d'environnement :

```MONGODB_URL``` : Url de la base de donnée mongo db
```MONGODB_COLLECTION```: Nom de la collection qu'on veut exploité
```MONGODB_DATABASE```: Nom de la base de donnée mongo db

## POST /
- Prend un champ ```nom``` au format URL-Encoded

Répond :
- Soit ```Bienvenu, XXX```(XXX étant la valeur passée dans le champ ```nom```)
- Soit ```Ìl manque votre nom.```, si aucun ```nom```n'a été reçu

## GET /
- Prend un champ ```nom``` au format URL-Encoded

Répond :
- Soit ```La dernière personne que j'ai rencontrée est: XXX.```(XXX étant le dernier ```nom``` transmis à ```POST /```)
- Soit ```Je n'ai rencontré personne pour l'instant```, si aucun ```nom```n'a été transmis à ```POST /``` pour l'instant;
- Soit ```J'ai perdu la mémoire...```, si un problème technique empêche la récupération du nom.