# Script d'évaluation d'exércices de cours Node.js

Ce programme permet de tester et évaluer une solution des exercices 1 à 3 de la première partie de mon cours Node.js. (cf [énoncé](https://adrienjoly.com/cours-nodejs/01-chatbot/))

Il utilise Docker pour exécuter le serveur de chaque étudiant dans un contexte isolé. (sandbox)

Pour récupérer la liste des dépôts `git` rendus par les étudiants sur Google Classroom, utiliser [adrienjoly/classroom-assignments-cli: a CLI to download assignements submitted by students on Google Classroom](https://github.com/adrienjoly/classroom-assignments-cli) en amont.

## Usage

```sh
$ npm install # installer les dépendances du script d'évaluation (test.js)
$ TESTER=test-ex-1-3.js ./test-in-docker-from-git.sh https://gitlab.eemi.tech/xxx/express-chatbot.git
```
