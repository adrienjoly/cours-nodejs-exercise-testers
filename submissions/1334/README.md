## Partiel NodeJs

# Installer le programme 

- installer le dossier sur sa machine 
- Dans le terminal : `cd partiel_node_1334`
- `npm init`
- `npm start` pour lancer le projet sur localhost:3000

# Tester le projet 

- $ curl -X POST --header "Content-Type: application/json" --data "{\"nom\":\"Sacha\"}" répond "Bienvenue Sacha"
- $ curl -X POST --header "Content-Type: application/json" --data "{\"nom\":\"\"}" répond "Il manque votre nom."
