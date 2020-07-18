# Save Name Server

===============

## Setup

```
$ git clone https://gitlab.eemi.tech/corentin.ravet/node-app.git
$ cd 1577-nodejs
$ npm install
$ npm run start
```

# What it is, what it does

Server that displays name on a single page.
On : `http://localhost:3000/`

# Usage

============

```
$ curl -X POST --header "Content-Type: application/x-www-form-urlencoded" --data "nom=John" http://localhost:3000/
$ curl -X POST --header "Content-Type: application/x-www-form-urlencoded" --data "nom=" http://localhost:3000/
```
