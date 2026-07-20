<template>
  <div class="config-page">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <h3>系统初始化配置</h3>
        </div>
      </template>
      <el-form :model="form" label-width="100px">
        <el-divider content-position="left">MongoDB 配置</el-divider>
        <el-form-item label="Host">
          <el-input v-model="form.mongodb.host" placeholder="localhost" />
        </el-form-item>
        <el-form-item label="Port">
          <el-input-number v-model="form.mongodb.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="Database">
          <el-input v-model="form.mongodb.database" placeholder="game-platform" />
        </el-form-item>
        <el-form-item label="Username">
          <el-input v-model="form.mongodb.user" placeholder="可选" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="form.mongodb.password" type="password" placeholder="可选" show-password />
        </el-form-item>
        
        <el-divider content-position="left">安全配置</el-divider>
        <el-form-item label="JWT Secret">
          <el-input v-model="form.jwtSecret" placeholder="用于签发 Token 的密钥" />
        </el-form-item>
        
        <div class="submit-btn" style="text-align: center; margin-top: 20px;">
          <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
            保存并重启后端
          </el-button>
        </div>
      </el-form>
      <div class="tip">
        <p>注意：点击保存后后端将生成 config.json 并尝试重启。请确保后端由 nodemon 或 pm2 等进程管理工具运行，以便自动恢复。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const form = ref({
  mongodb: {
    host: 'localhost',
    port: 27017,
    database: 'game-platform',
    user: '',
    password: ''
  },
  jwtSecret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
});

const submitting = ref(false);

const handleSubmit = async () => {
    submitting.value = true;
    try {
        // 使用原始 axios 以避免 http.ts 中的拦截器处理
        const { data } = await axios.post('/api/setup', form.value);
        if (data.code === 0) {
            ElMessage.success('配置成功，系统正在重启...');
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } else {
            ElMessage.error(data.msg || '保存失败');
        }
    } catch (e: any) {
        ElMessage.error(e.response?.data?.msg || '请求失败');
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
.config-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.config-card {
  width: 500px;
  border-radius: 12px;
}
.card-header h3 {
  margin: 0;
  text-align: center;
}
.tip {
  margin-top: 20px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
