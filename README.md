
# Transcendence
A full stack website that runs an online multiplayer pong, a real-time chat and a user management system
## Tech Stack

**Main Language**
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

**Client:**
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF)

**Server:**
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)

**Database:**
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

**Other**
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Deployment

To deploy this project, setup an .env file and run

```bash
  make
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file, at the root of the project

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=pass123
POSTGRES_NAME=postgres
POSTGRES_PORT= 5432
POSTGRES_HOST=database

API_UID={42_api_uid}
API_SECRET={42_api_secret}
API_REDIRECT_URL=http://localhost:3000/auth/42-redirect

JWT_SECRET=supersecuresecret
```

## Screenshots

<img src="https://github.com/ntantan/ft_transcendence/assets/78843500/3b050c51-d423-4752-8784-886d7f6bf2de" alt="c" width="320" height="240"/> <img src="https://github.com/ntantan/ft_transcendence/assets/78843500/76a0e54c-a9d3-400d-af7f-bb4ffcb5be86" alt="c" width="320" height="240"/>
