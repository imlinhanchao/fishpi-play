<template>
  <div class="admin-container">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <Icon icon="mdi:controller-classic" class="mr-1" />
            <span>游戏管理中心</span>
          </div>
          <el-select
            v-model="selectedGameKey"
            placeholder="请选择要管理的游戏"
            @change="fetchGameData"
            style="width: 240px"
          >
            <el-option
              v-for="item in games"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </div>
      </template>

      <div v-if="selectedGame" class="game-info">
        <el-descriptions title="游戏配置" :column="2" border>
          <el-descriptions-item label="游戏名称">{{
            selectedGame.name
          }}</el-descriptions-item>
          <el-descriptions-item label="游戏 Key">{{
            selectedGame.key
          }}</el-descriptions-item>
          <el-descriptions-item label="回调路径" :span="2">
            <el-input
              v-model="configForm.loginCallbackPath"
              placeholder="登录授权后的回调地址"
            />
          </el-descriptions-item>
          <el-descriptions-item label="域名白名单" :span="2">
            <el-input
              v-model="configForm.domainWhitelist"
              placeholder="允许访问的域名，多个用逗号分隔"
            />
          </el-descriptions-item>
        </el-descriptions>
        <div class="mt-4 text-right">
          <el-button type="primary" @click="saveConfig">
            <Icon icon="mdi:content-save-outline" class="mr-1" />
            保存配置
          </el-button>
        </div>
      </div>
      <el-empty v-else description="请先选择一个游戏" />
    </el-card>

    <el-card v-if="selectedGameKey" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>玩家数据与在线状态</span>
          <el-button link @click="fetchGameData">
            <Icon icon="mdi:refresh" class="mr-1" />
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="gameUsers" style="width: 100%">
        <el-table-column
          prop="userId"
          label="用户 ID"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="nickname"
          label="昵称"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column label="在线状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isOnline ? 'success' : 'info'" effect="dark">
              {{ row.isOnline ? "在线" : "离线" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="用户属性"
          :formatter="(row) => JSON.stringify(row.attributes)"
          show-overflow-tooltip
        />
        <el-table-column
          prop="lastLoginAt"
          label="最后活跃"
          width="180"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ formatTime(row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewArchive(row.userId)">
              <Icon icon="mdi:database-search-outline" class="mr-1" />
              查看存档
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 存档查看对话框 -->
    <el-dialog
      v-model="archiveDialogVisible"
      title="玩家存档详情"
      width="700px"
      custom-class="dark-dialog"
    >
      <div v-if="currentArchive" class="archive-content">
        <div class="archive-meta">
          <div class="meta-left">
            <span>用户: {{ currentArchive.userId }}</span>
            <span class="ml-4"
              >更新时间: {{ formatTime(currentArchive.updatedAt) }}</span
            >
          </div>
          <el-button size="small" type="primary" link @click="copyArchive">
            <Icon icon="mdi:content-copy" class="mr-1" />
            复制内容
          </el-button>
        </div>
        <div class="code-editor">
          <pre><code>{{ formattedArchive }}</code></pre>
        </div>
      </div>
      <el-empty v-else description="该玩家尚未创建存档" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  getGames,
  getGameUsers,
  updateGameConfig,
  getGameUserArchive,
} from "../api/game";
import { ElMessage } from "element-plus";

const games = ref<any[]>([]);
const selectedGameKey = ref("");
const selectedGame = computed(() =>
  games.value.find((g) => g.key === selectedGameKey.value),
);
const gameUsers = ref<any[]>([]);
const configForm = ref({
  loginCallbackPath: "",
  domainWhitelist: "",
});

const archiveDialogVisible = ref(false);
const currentArchive = ref<any>(null);

const formattedArchive = computed(() => {
  if (!currentArchive.value) return "";
  try {
    return JSON.stringify(JSON.parse(currentArchive.value.content), null, 2);
  } catch (e) {
    return currentArchive.value.content;
  }
});

onMounted(fetchGames);

async function fetchGames() {
  try {
    const res = await getGames({
      status: "approved", // 只获取已批准的游戏
    });
    games.value = res;
  } catch (err) {}
}

async function fetchGameData() {
  if (!selectedGameKey.value) return;

  try {
    const users = await getGameUsers(selectedGameKey.value);
    gameUsers.value = users;

    if (selectedGame.value) {
      configForm.value.loginCallbackPath =
        selectedGame.value.loginCallbackPath || "";
      configForm.value.domainWhitelist = (
        selectedGame.value.domainWhitelist || []
      ).join(", ");
    }
  } catch (err) {}
}

async function saveConfig() {
  try {
    await updateGameConfig(selectedGameKey.value, {
      loginCallbackPath: configForm.value.loginCallbackPath,
      domainWhitelist: configForm.value.domainWhitelist
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    ElMessage.success("配置已保存");
    await fetchGames(); // 刷新游戏列表数据
  } catch (err) {}
}

async function viewArchive(userId: string) {
  try {
    const res = await getGameUserArchive(selectedGameKey.value, userId);
    currentArchive.value = res;
  } catch (err) {
    currentArchive.value = null;
  }
  archiveDialogVisible.value = true;
}

function copyArchive() {
  if (!formattedArchive.value) return;

  navigator.clipboard
    .writeText(formattedArchive.value)
    .then(() => {
      ElMessage.success("存档已复制到剪贴板");
    })
    .catch(() => {
      ElMessage.error("复制失败");
    });
}

function formatTime(time: string) {
  if (!time) return "-";
  return new Date(time).toLocaleString();
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}
.truncate-text {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #909399;
  font-size: 12px;
  font-family: monospace;
}
.archive-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 13px;
  color: #909399;
}
.meta-left {
  display: flex;
  align-items: center;
}
.ml-4 {
  margin-left: 16px;
}
.code-editor {
  background-color: #1a1a1a;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #333;
}
.code-editor pre {
  margin: 0;
  color: #f39c12;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}
.mr-1 {
  margin-right: 4px;
}
.mt-4 {
  margin-top: 20px;
}
</style>
