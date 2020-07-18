# 1033_PARTIEL_NODEJS

Bonjour,
J'espère que vous allez bien. Vous retrouverez au travers de ces fichiers, l'ensemble des élements nécessaires afin d'établir un programme Node.js capable de répondre à des requêtes HTTP sur deux points d'entrées.

## OUTILS

* [Curl](https://curl.haxx.se/docs/manpage.html) (Test avec ```$ curl --version```)
* [Node.js](https://nodejs.org/en/) (Test avec ```$ node --version```)

## INSTALLATION

Pour lancer le serveur, installer les dépendances avec :

```shell
$ npm install
```

```shell
$ npm install express --save
```

```shell
$ npm install dotenv
```

```shell
$ npm install body-parser
```

## LANCEMENT

Pour lancer l'application il faut éxécuter : 

```shell
$ npm start
```

OU

```shell
$ node server.js
```

## EXPLICATION METHODE

L'objectif était d'afficher le dernier utilisateur présent en base de donnée.

Lorsque on fait une requête POST sur '/' on peut ajouter un nouvel utilisateur.


## TEST

```shell
$ curl -X POST --header "Content-Type: application/json" --data "{\"name\":\"testname\"}" http://localhost:3000
```





