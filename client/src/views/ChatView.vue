<script lang="ts">
import { defineComponent } from "vue";
import ChatBox from "../components/ChatBox.vue";
import ChatLists from "../components/ChatLists.vue";

export default defineComponent({
  components: {
      ChatBox,
      ChatLists,
  },
});
</script>

<template>
  <ChatBox />
</template>
