# Scripts d'évaluation d'exercices de cours Node.js

Ce dépot permet de tester et évaluer une solution à un des exercices de [mon cours Node.js](https://adrienjoly.com/cours-nodejs/).

Il utilise Docker pour exécuter le serveur de chaque étudiant dans un contexte isolé. (sandbox)

Pour récupérer la liste des dépôts `git` rendus par les étudiants sur Google Classroom, utiliser [adrienjoly/classroom-assignments-cli: a CLI to download assignements submitted by students on Google Classroom](https://github.com/adrienjoly/classroom-assignments-cli) en amont.

## Usage

```sh
$ npm install # installer les dépendances du script d'évaluation (test.js)
$ TESTER=test-ex-1-3.js ./test-in-docker-from-git.sh https://gitlab.eemi.tech/xxx/express-chatbot.git
$ ./list-grades.sh
```

## Test des solutions

### Initialisation

```sh
$ source .env # définit la variable d'environnement GH_TOKEN pour accéder aux dépôts privés, générée depuis https://github.com/settings/tokens
```

### Première partie du cours Node.js: [Chat-bot avec Express](https://adrienjoly.com/cours-nodejs/01-chatbot/)

```sh
$ TESTER=test-ex-1-3.js GIT_BRANCH=ex-1-3 ./test-in-docker-from-git.sh https://adrienjoly:${GH_TOKEN}@github.com/adrienjoly/cours-nodejs-exercise-solutions.git # exercices 1 à 3 (support de paramètres `GET`)
$ TESTER=test-ex-1-5.js GIT_BRANCH=ex-1-5 ./test-in-docker-from-git.sh https://adrienjoly:${GH_TOKEN}@github.com/adrienjoly/cours-nodejs-exercise-solutions.git # exercices 4 (support de paramètres `POST`) et 5 (persistance dans `réponses.json`)
```
