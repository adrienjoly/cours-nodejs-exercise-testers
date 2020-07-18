# Application permetant de repondre a des requêtes http

## Fonctionnalité :
- `POST /` récupère un champ `nom` depuis le contenu de la requête, transmis au format URL-Encoded, et répond:
    - soit "Bienvenue, XXX." (XXX étant la valeur passée dans le champ `nom`);
    - soit "Il manque votre nom.", si aucun `nom` n'a été reçu.
- `GET /` répond:
    - soit "La dernière personne que j'ai rencontrée est: XXX." (XXX étant le dernier `nom` transmis à `POST /`);
    - soit "Je n'ai rencontré personne pour l'instant", si aucun nom n'a été transmis à `POST /` pour l'instant;
    - soit "J'ai perdu la mémoire...", si un problème technique empêche la récupération du nom.

## Commande pour l'installation:
```sh
$ npm install
```

## Commande pour lancer le serveur
```sh
$ node server.js
```

## Commande pour tester:
- POST: 
```sh
$ curl -i -X POST http://localhost:3000 -d "nom=test" -H "Content-Type: application/x-www-form-urlencoded"
```
- GET: 
```sh
$ curl -X GET http://localhost:3000
```