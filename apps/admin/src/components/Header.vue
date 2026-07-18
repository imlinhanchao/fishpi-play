<template>
  <div class="header-container">
    <div class="logo">
      <icon-iconify icon="mdi:gamepad-variant" class="logo-icon" />
      <span class="logo-text">鱼丸游戏平台</span>
    </div>

    <div v-if="isLoggedIn" class="menu-wrapper">
      <Menu />
    </div>

    <div class="user-info" v-if="isLoggedIn">
      <el-dropdown>
        <div class="avatar-wrapper">
          <el-avatar :size="32" :src="userInfo?.avatar || ''">
            <icon-iconify icon="mdi:account" />
          </el-avatar>
          <span class="username">{{ userInfo?.nickname || userInfo?.username }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">
              <icon-iconify icon="mdi:logout" class="mr-1" />
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Icon as IconIconify } from '@iconify/vue';
import Menu from './Menu.vue';
import { GameSDK } from 'fishpi-play';
import { useUserStore } from '../store/user';
import { storeToRefs } from 'pinia';

const sdk = new GameSDK('', '');
const userStore = useUserStore();
const { userInfo, isLoggedIn } = storeToRefs(userStore);

onMounted(async () => {
  const authed = await sdk.isAuthenticated();
  if (authed) {
    try {
      await userStore.fetchUserInfo();
    } catch (e) {
      console.error('Failed to get user profile', e);
    }
  }
});

const handleLogout = () => {
  userStore.logout();
};
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #f39c12;
}
.logo-icon {
  font-size: 28px;
  margin-right: 8px;
}
.menu-wrapper {
  flex: 1;
}
.user-info {
  margin-left: 20px;
}
.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
  color: #e0e0e0;
}
.username {
  margin-left: 8px;
  font-size: 14px;
}
.mr-1 {
  margin-right: 4px;
}
</style>
