<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";

export default defineComponent({
  name: "Stats",

  data() {
    return {
      avatar: {
        size: "50",
      },
      userStore,
    };
  },
});
</script>

<template>
    
</template>