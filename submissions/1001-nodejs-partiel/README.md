# Partiel NodeJS Identifiant 1001

Identifiant : 1001

## Installation

```
$ npm i

```

Pour lancer le server

```
node server.js

```

### 1 - Requête POST

```
$ curl -X POST --header "Content-Type: application/json" --data "{\"nom\":\"Lucas\"}" http://localhost:3000/
```

Le serveur retourne "Bienvenue, Lucas."

```
$ curl -X POST --header "Content-Type: application/json" --data "{\"nom\":\"\"}" http://localhost:3000/

```

Le serveur retourne "Il manque votre nom."

### 2 - Requête GET

Naviguez sur l'url suivante

```
http://localhost:3000/

```

Le serveur vous retournera "La dernière personne que j'ai rencontrée est: LucasTestDernier"
