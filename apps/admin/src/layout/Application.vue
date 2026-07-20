<template>
  <el-container class="layout-container">
    <el-header v-if="!isLoginPage" height="60px" class="layout-header">
      <Header />
    </el-header>
    <el-main :class="['layout-main', { 'login-main': isLoginPage }]">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './Header.vue';

const route = useRoute();
const isLoginPage = computed(() => route.path === '/login');
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #121212;
}
.layout-header {
  padding: 0;
  z-index: 100;
  border-bottom: 1px solid #2c2c2c;
}
.layout-main {
  padding: 20px;
  color: #e0e0e0;
}
.login-main {
  padding: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
