# Hypertube


## Lancer sans docker 

### Côté front :
il faut node version 22.13.1 (LTS)
npm run start (si erreur c’est qu’il faut télécharger angular aussi : npm install -g @angular/cli17)

### Côté back :

il faut lancer le docker (avec docker-compose) dans core-api/Docker
soit lancer ensuite via un ide (intellij) et java 21
soit télécharger java (21) et maven puis lancer la commande : mvn spring-boot:run

## Lancer avec docker compose

faire la commande:

docker-compose up --build
(optionnel -d pour le detacher du terminal)