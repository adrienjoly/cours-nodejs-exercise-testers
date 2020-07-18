Pour installer ce projet il faut : 
- cloner le projet avec la commande suivante : 
	# git clone https://gitlab.com/manon.lebihan/chatbot.git
 - puis installer avec :
	# npm install
- et enfin le lancer avec :
	# npm start

    Ce programme a plusieurs points d'netrée qui font plusieurs choses différentes.

    La route get "/" retourne soit : 
    -"La dernière personne que j'ai rencontrée est:" suivi du nom du dernier nom entré.
    -"Je n'ai rencontré personne pour l'instant" si aucun nom n'a été rentré.
    -"J'ai perdu la mémoire..." s'il y a un problème pour récupérer les données.

    La route post "/" qui retourne "Bienvenue" et le nom entré par l'utilisateur soit "Il manque votre nom" s'il n'y a pas de nom rentré.