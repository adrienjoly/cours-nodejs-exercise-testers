## Installer

```sh
$ npm install
```

## Configurer

```sh
$ export DB_PORT="27017"
$ export MONGODB_URL="mongodb://localhost:${DB_PORT}"
$ export MONGODB_DATABASE="partiel-db"
$ export MONGODB_COLLECTION="visitor"
```

## Lancer base de données

```sh
$ echo "MongoDB connection URL: ${MONGODB_URL}"
$ echo "Press Ctrl-C to shut down MongoDB and delete the Docker container."
$ docker run --rm --name "partiel-db" --publish ${DB_PORT}:27017 mongo:4
```

## Lancer serveur HTTP

```sh
$ PORT="3000" npm start
```

## Tester application

```sh
$ curl localhost:3000 # → Je n'ai rencontré personne pour l'instant
$ curl -X POST localhost:3000 # → Il manque votre nom.
$ curl -X POST --data nom=adrien localhost:3000 # → Bienvenue, adrien.
$ curl localhost:3000 # → La dernière personne que j'ai rencontrée est: adrien2.
```
