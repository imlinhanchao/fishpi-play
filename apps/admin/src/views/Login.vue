<template>
  <div class="login-page">
    <div class="login-wrapper">
      <div class="info-section">
        <div class="logo">
          <Icon icon="svg-icon:logo" class="logo-icon" />
          <span>鱼丸游戏平台</span>
        </div>
        <h1>构建你的游戏梦想</h1>
        <p class="desc">
          鱼丸是一个全方位的游戏集成平台，提供用户认证、云端存档、多端互动及数据统计等核心功能。
          让开发者专注于游戏创意，我们将处理所有繁琐的后端架构。<b>适用于纯前端单机游戏。</b>
        </p>
        <div class="features">
          <div class="feature-item">
            <Icon icon="mdi:shield-check-outline" />
            <span>安全可靠的身份验证</span>
          </div>
          <div class="feature-item">
            <Icon icon="mdi:cloud-sync-outline" />
            <span>实时云端数据同步</span>
          </div>
          <div class="feature-item">
            <Icon icon="mdi:devices" />
            <span>跨平台多端连接</span>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <el-card class="login-card" shadow="always">
          <template #header>
            <div class="card-header">
              <h3>管理端登录</h3>
            </div>
          </template>
          
          <div class="login-content">
            <div class="login-graphic">
              <Icon icon="mdi:account-circle-outline" class="user-icon" />
            </div>
            
            <p v-if="loading" class="status-msg">
              <Icon icon="mdi:loading" class="spin" />
              正在检查登录状态...
            </p>
            
            <div v-else class="action-wrapper">
              <p class="welcome-text">欢迎回来，请使用摸鱼派账号登录以继续管理您的游戏项目。</p>
              <div class="btn-center">
                <el-button color="#f39c12" @click="handleLogin" size="large" class="login-btn">
                  <Icon icon="mdi:login" class="mr-1" />
                  通过摸鱼派登录
                </el-button>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <span>还没有账号？请前往 <a href="https://fishpi.cn" target="_blank">摸鱼派</a> 注册</span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { GameSDK } from 'fishpi-play';

const sdk = new GameSDK('', '');
const loading = ref(true);

const handleLogin = async () => {
    await sdk.login();
};

onMounted(async () => {
    const authed = await sdk.initAuth();
    if (authed) {
        window.location.href = '/';
        return;
    }

    const isLogin = await sdk.isAuthenticated();
    if (isLogin) {
        window.location.href = '/';
    } else {
        loading.value = false;
    }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #121212;
  padding: 20px;
}

.login-wrapper {
  display: flex;
  width: 1000px;
  max-width: 100%;
  background: #1a1a1a;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.info-section {
  flex: 1;
  padding: 60px;
  background-color: #f39c12;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-section .logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
}

.logo-icon {
  font-size: 40px;
  margin-right: 12px;
}

.info-section h1 {
  font-size: 36px;
  margin-bottom: 20px;
  line-height: 1.2;
}

.info-section .desc {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 40px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.feature-item svg {
  font-size: 24px;
}

.form-section {
  flex: 1;
  padding: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

:deep(.el-card__header) {
  border-bottom: none;
  padding-bottom: 0;
}

.card-header h3 {
  margin: 0;
  font-size: 24px;
  color: #f39c12;
  text-align: center;
}

.login-content {
  padding: 20px 0;
}

.login-graphic {
  text-align: center;
  margin-bottom: 30px;
}

.user-icon {
  font-size: 80px;
  color: #333;
}

.status-msg {
  text-align: center;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.welcome-text {
  text-align: center;
  color: #bdc3c7;
  margin-bottom: 30px;
  line-height: 1.5;
}

.btn-center {
  display: flex;
  justify-content: center;
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  border-radius: 25px;
  color: white !important;
}

.card-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 14px;
  color: #7f8c8d;
}

.card-footer a {
  color: #f39c12;
  text-decoration: none;
}

.mr-1 {
  margin-right: 8px;
}

@media (max-width: 800px) {
  .login-wrapper {
    flex-direction: column;
    width: 100%;
  }
  .info-section {
    padding: 40px;
  }
  .form-section {
    padding: 40px;
  }
}
</style>
