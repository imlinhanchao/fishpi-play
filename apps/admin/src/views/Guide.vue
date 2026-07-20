<template>
  <div class="guide-container">
    <el-scrollbar height="calc(100vh - 100px)">
      <div class="content-wrapper">
        <h1 class="page-title">游戏接入指南</h1>
        <p class="subtitle">欢迎使用鱼丸游戏平台，通过以下步骤，您可以快速将您的游戏接入我们的平台。</p>

        <el-steps :active="4" finish-status="success" simple style="margin-top: 20px">
          <el-step title="注册游戏" />
          <el-step title="安装 SDK" />
          <el-step title="集成功能" />
          <el-step title="运维管理" />
        </el-steps>

        <section class="guide-section">
          <h2>1. 注册游戏</h2>
          <el-card>
            <p>首先，前往 <router-link to="/register">游戏注册</router-link> 页面，填写您的游戏基本信息。</p>
            <ul>
              <li><strong>游戏名称</strong>：展示给玩家的名称。</li>
              <li><strong>游戏 Key</strong>：用于 SDK 初始化的唯一标识。</li>
              <li><strong>回调路径</strong>：登录成功后跳转回您游戏的相对路径（例如 <code>/auth/callback</code>）。</li>
              <li><strong>域名白名单</strong>：允许调用 API 的域名列表（默认支持 localhost）。</li>
            </ul>
            <el-alert title="注意" type="info" description="提交注册后需要超级管理员审批通过方可使用。" show-icon :closable="false" />
          </el-card>
        </section>

        <section class="guide-section">
          <h2>2. 安装 SDK</h2>
          <el-card>
            <p>在您的游戏项目中安装 <code>fishpi-play</code>：</p>
            <div class="code-block">
              <pre><code class="language-bash">npm install fishpi-play</code></pre>
            </div>
          </el-card>
        </section>

        <section class="guide-section">
          <h2>3. 快速开始</h2>
          <el-card>
            <h3 class="section-sub-title">初始化</h3>
            <div class="code-block">
              <pre><code class="language-typescript">import { GameSDK } from 'fishpi-play';

const sdk = new GameSDK('YOUR_GAME_KEY');</code></pre>
            </div>

            <h3 class="section-sub-title">身份认证</h3>
            <div class="code-block">
              <pre><code class="language-typescript">// 1. 处理回调中的登录信息
await sdk.initAuth();

// 2. 检查并跳转登录
if (!await sdk.isAuthenticated()) {
    sdk.login(window.location.href);
}

// 3. 获取用户信息
const user = await sdk.getUserProfile();
console.log('欢迎, ' + user.nickname);</code></pre>
            </div>

            <h3 class="section-sub-title">存档管理</h3>
            <div class="code-block">
              <pre><code class="language-typescript">// 上传存档
await sdk.saveArchive(JSON.stringify({ score: 100 }));

// 获取存档
const archive = await sdk.getArchive();
if (archive) {
    const data = JSON.parse(archive.content);
}</code></pre>
            </div>
          </el-card>
        </section>

        <section class="guide-section">
          <h2>4. 游戏管理</h2>
          <el-card>
            <p>在 <router-link to="/admin">游戏管理</router-link> 页面，您可以对自己开发的游戏进行实时监控和配置更新：</p>
            <ul>
              <li><strong>配置更新</strong>：无需重新发布游戏，即可修改域名白名单和回调路径。</li>
              <li><strong>玩家监控</strong>：查看当前在线玩家列表，监控其实时属性（如关卡、状态等）。</li>
              <li><strong>存档状态</strong>：了解各玩家最后一次同步数据的时间。</li>
            </ul>
            <div class="tip-box">
              <Icon icon="mdi:lightbulb-on-outline" style="color: #e6a23c; margin-right: 8px" />
              <span>提示：通过 SDK 的 <code>setAttributes</code> 方法同步的属性，会实时显示在管理后台的玩家列表中。</span>
            </div>
          </el-card>
        </section>

        <section class="guide-section">
          <h2>5. API 参考</h2>
          <el-table :data="apiRef" border style="width: 100%">
            <el-table-column prop="method" label="方法" width="220" />
            <el-table-column prop="description" label="说明" />
          </el-table>
        </section>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

onMounted(() => {
  hljs.highlightAll();
});

const apiRef = [
  { method: 'initAuth()', description: '从当前 URL 解析验证信息。' },
  { method: 'isAuthenticated()', description: '检查当前 Token 是否有效。' },
  { method: 'login(redirectUri?)', description: '跳转至平台登录页面。' },
  { method: 'getUserProfile()', description: '获取当前登录用户信息。' },
  { method: 'saveArchive(content)', description: '保存存档数据到云端数据中心。' },
  { method: 'getArchive()', description: '从云端获取最新的存档记录。' },
  { method: 'connectRealtime(cb)', description: '通过 WebSocket 连接实时同步服务。' },
]
</script>

<style scoped>
.guide-container {
  max-width: 1000px;
  margin: 0 auto;
}
.content-wrapper {
  padding: 0 20px 50px;
}
.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #fff;
}
.subtitle {
  color: #999;
  margin-bottom: 2rem;
}
.guide-section {
  margin-top: 40px;
}
.guide-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #409eff;
}
.section-sub-title {
  font-size: 1.1rem;
  margin: 1.5rem 0 1rem;
  color: #eee;
}
.code-block {
  background: #1e1e1e;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #333;
}
.code-block pre {
  margin: 0;
}
.code-block code {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
}
ul {
  padding-left: 20px;
}
li {
  margin-bottom: 10px;
  color: #cfd3dc;
}
p {
  color: #cfd3dc;
}
.tip-box {
  margin-top: 15px;
  padding: 12px 16px;
  background-color: #262626;
  border-left: 4px solid #e6a23c;
  display: flex;
  align-items: center;
  border-radius: 4px;
}
.tip-box span {
  font-size: 0.9rem;
  color: #e6a23c;
}
</style>
