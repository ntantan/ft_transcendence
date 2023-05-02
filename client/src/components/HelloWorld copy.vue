<template>
  <div class="home">
    <header>
      <h1>Pong en ligne</h1>
      <p>Rejoignez la compétition et affrontez d'autres joueurs en temps réel !</p>
    </header>

    <section class="technologies">
      <h2>Technologies utilisées</h2>
      <div class="tech-container">
        <div class="tech">
          <a href="https://nestjs.com/" target="_blank" rel="noopener noreferrer">
            <img src="https://nestjs.com/img/logo_text.svg" alt="NestJS" />
          </a>
          <p>NestJS pour le backend</p>
        </div>
        <div class="tech">
          <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://vuejs.org/images/logo.png" alt="Vue.js" />
          </a>
          <p>Vue.js pour le frontend</p>
        </div>
        <div class="tech">
          <a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.postgresql.org/media/img/about/press/elephant.png" alt="PostgreSQL" />
          </a>
          <p>PostgreSQL pour la base de données</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  export default {
    name: "Home",
  };
</script>

<style scoped>
.home {
  text-align: center;
  font-family: Arial, sans-serif;
}

header {
  margin-top: 100px;
}

h1 {
  font-size: 48px;
  margin-bottom: 10px;
}

p {
  font-size: 24px;
  color: #777;
  margin-bottom: 40px;
}

.technologies {
  margin-top: 60px;
}

.tech-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.tech {
  flex: 0 0 calc(33.333% - 40px);
  margin: 20px;
}

.tech img {
  width: 150px;
  height: auto;
}

.tech p {
  font-size: 18px;
  color: #333;
  margin-top: 10px;
}
</style>