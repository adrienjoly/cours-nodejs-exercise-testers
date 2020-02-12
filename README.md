# Exercices de cours Node.js

Ce programme permet de tester et évaluer une solution des exercices 1 à 3 de la première partie de mon cours Node.js. (cf [énoncé](https://adrienjoly.com/cours-nodejs/01-chatbot/))

## Usage

1. Télécharger et exécuter le rendu depuis un premier terminal:

```sh
$ ./run-in-docker-from-git.sh https://gitlab.eemi.tech/alison.genin/chatbotexpress.git
```

2. Dans un autre terminal, exécuter les tests:

```sh
$ npm install
$ npm test
```

3. Arrêter puis détruire le container docker en cours d'exécution

```sh
$ docker stop my-running-app
```
