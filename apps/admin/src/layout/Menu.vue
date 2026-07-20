<template>
  <el-menu
    :default-active="activePath"
    router
    mode="horizontal"
    class="header-menu"
  >
    <template v-for="item in menuRoutes" :key="item.path">
      <el-menu-item 
        v-if="!item.meta?.hidden && (!item.meta?.requiresAdmin || userInfo?.isAdmin)" 
        :index="item.path"
      >
        <Icon v-if="item.meta?.icon" :icon="item.meta.icon" class="mr-1" />
        {{ item.meta?.title || item.path }}
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../store/user';
import { storeToRefs } from 'pinia';
import { routes } from '../router';

const route = useRoute();
const activePath = computed(() => route.path);
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const menuRoutes = computed(() => routes);
</script>

<style scoped>
.header-menu {
  border-bottom: none;
  flex: 1;
  margin-left: 20px;
  background-color: transparent !important;
}
.mr-1 {
  margin-right: 4px;
  font-size: 18px;
}
</style>
