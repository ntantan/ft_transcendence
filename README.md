
# Transcendence
A full stack website that runs an online multiplayer pong, a real-time chat and a user management system
## Tech Stack

**Client:**
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF)

**Server:**
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)

**Database:**
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)


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
```

## Screenshots

