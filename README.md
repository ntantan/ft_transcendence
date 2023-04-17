# ft_transcendence

0 - Introduction

Dans ce projet, nous allons devoir réaliser une wepapp monopage pour mettre en service un jeu de pong en multijoueur sur navigateur. En plus de cela, le projet devra offrir différentes fonctionnalités, comme un chat en direct ou de la double authentification.

Dans ce projet nous utiliserons les technologies suivantes :

NODEJS (https://nodejs.org)
"Node.js est un environnement d’exécution single-thread, open-source et multi-plateforme permettant de créer des applications rapides et évolutives côté serveur et en réseau. Il fonctionne avec le moteur d’exécution JavaScript V8 et utilise une architecture d’E / S non bloquante et pilotée par les événements, ce qui le rend efficace et adapté aux applications en temps réel." (https://kinsta.com/fr/base-de-connaissances/qu-est-ce-que-node-js/)

NESTJS (https://nestjs.com)
- Nestjs est un framework opensource pour nodejs. il utilise les languages javascript et typescript. Il permet de gérer la partie serveur de notre projet, aussi appelé "backend".
- https://www.youtube.com/watch?v=0M8AYU_hPas&ab_channel=Fireship

POSTEGRESQL (https://www.postgresql.org)
"PostgreSQL is a powerful, open source object-relational database system that uses and extends the SQL language combined with many features that safely store and scale the most complicated data workloads. The origins of PostgreSQL date back to 1986 as part of the POSTGRES project at the University of California at Berkeley and has more than 35 years of active development on the core platform."

DOCKER (https://www.docker.com/)
"Docker est une plate-forme logicielle qui vous permet de concevoir, tester et déployer des applications rapidement. Docker intègre les logiciels dans des unités normalisées appelées conteneurs, qui rassemblent tous les éléments nécessaires à leur fonctionnement, dont les bibliothèques, les outils système, le code et l'environnement d'exécution."

1 - Installation et configuration

NESTJS

git clone https://github.com/nestjs/typescript-starter.git server
cd server
npm install
npm start

! CORS ISSUES -> ajouter cors:true dans la gateway

VUEJS

npm init vue@(version num => 'vue@3')

VUETIFY https://vuetifyjs.com/en/getting-started/installation/

install vue cli : sudo npm install -g @vue/cli
install vuetify : vue add vuetify (vuetify 3 vite)
or
npm add vuetify@^3.1.4

+

npm i vue-cli-plugin-webfontloader
npm add @mdi/font

SOCKETIO 

npm i --save @nestjs/websockets @nestjs/platform-socket.io

TYPEORM POSTEGRES

cd server
npm i @nestjs/typeorm typeorm pg

Ressources:

authentification jwt session nestjs
https://www.youtube.com/watch?v=_L225zpUK0M&ab_channel=MariusEspejo

vueJS tutorial
https://vuejs.org/tutorial/#step-1

create room with nestjs vue and socketio
https://lucaball.doesweb.dev/socket-io-rooms-and-nestjs-how-to

nestjs playlist
https://youtu.be/1ORHdFtJqmA

Pong in vue
https://github.com/dylanjwu/Pong/blob/master/src/App.vue

html canvas
https://www.digitalocean.com/community/tutorials/vuejs-vue-html5-canvas

2d multiplayer game in vue + socketio
https://www.youtube.com/watch?v=JEYEpledOxs&ab_channel=LogRocket

Socket io + nest js chat
https://www.youtube.com/watch?v=7xpLYk4q0Sg&ab_channel=MichaelGuay

create a simple gateway
https://www.youtube.com/watch?v=iObzX8-Y5xg&ab_channel=AnsontheDeveloper

test gateway with postman on wsl
https://stackoverflow.com/questions/73372406/postman-wont-connect-to-nestjs-websocket/75200872#75200872