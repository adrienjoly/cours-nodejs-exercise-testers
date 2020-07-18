# Partiel NodeJS 1169

## Installation

```
$ npm install
```

### 1 - POST

```
$ curl -X POST --header "Content-Type: application/json" --data "{\"nom\":\"Mathieu\"}" http://localhost:3000/
```
renverra "Bienvenue, Mathieu."

```
$ curl -X POST --header "Content-Type: application/json" --data "{\"nom\":\"\"}" http://localhost:3000/
```

renverra "Il manque votre nom."

### 2 - GET

```
http://localhost:3000/
```
renverra "La dernière personne que j'ai rencontrée est: Mathieu." si la dernière personne à avoir été ajouté à la BDD est Mathieu.

renverra "La dernière personne que j'ai rencontrée est: Mathieu." si la BDD est vide.

renverra "La dernière personne que j'ai rencontrée est: Mathieu." si il y a une erreur.
