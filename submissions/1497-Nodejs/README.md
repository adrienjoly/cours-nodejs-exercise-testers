# 1497 Partiel

Le but de notre programme est de pouvoir stocker un nom d'utilisateur et de lui souhaiter la bienvenue lorsqu'il arrive sur l'application.
L'application doit "se souvenir" du dernier utilisateur, c'est pourquoi nous utilisons mongodb Atlas comme base de données distantes pour "mémoriser" le dernier utilisateur.

On donne le nom du dernier utilisateur (le seul enregistré dans la collection de la base de données!) lorsque 
l'utilisateur va sur la route "/" en GET.

Si la collection est vide (première fois) alors le programme lui dit qu'il ne connait personne, et s'il y a une erreur quelconque de lecture de 
base de données alors le programme va dire qu'il a perdu la mémoire.

Ensuite, on peut ajouter le dernier utilisateur avec la méthode POST (toujours sur racine "/")
en passant un nom en paramètre; on utilise le curl avec le bodyParser par exemple.
On vide la collection et on enregistre le nouvel utilisateur.