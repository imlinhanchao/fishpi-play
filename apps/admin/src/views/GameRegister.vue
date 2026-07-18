<template>
  <div class="register">
    <h2>游戏注册</h2>
    <el-form :model="form" label-width="120px" style="max-width: 500px">
      <el-form-item label="游戏名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="游戏 Key">
        <el-input v-model="form.key" />
      </el-form-item>
      <el-form-item label="游戏描述">
        <el-input v-model="form.description" type="textarea" placeholder="简要描述游戏功能" />
      </el-form-item>
      <el-form-item label="回调路径">
        <el-input v-model="form.loginCallbackPath" placeholder="/auth/callback" />
      </el-form-item>
      <el-form-item label="域名白名单">
        <el-input v-model="form.domainWhitelist" placeholder="localhost,example.com" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交申请</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <h3>待审批游戏</h3>
    <el-table :data="pendingGames" style="width: 100%">
      <el-table-column prop="name" label="游戏名称" />
      <el-table-column prop="key" label="游戏 Key" />
      <el-table-column prop="loginCallbackPath" label="回调路径" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'pending' ? 'warning' : 'info'">
            {{ scope.row.status === 'pending' ? '待审批' : scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { registerGame, getGames, type Game } from '../api/game'

const form = ref({
  name: '',
  key: '',
  description: '',
  loginCallbackPath: '',
  domainWhitelist: ''
})

const pendingGames = ref<Game[]>([])

const fetchPendingGames = async () => {
  try {
    const data = await getGames({ status: 'pending' })
    pendingGames.value = data
  } catch (err) {
    console.error('获取待审批游戏失败', err)
  }
}

onMounted(fetchPendingGames)

const onSubmit = async () => {
    try {
        await registerGame({
            ...form.value,
            domainWhitelist: form.value.domainWhitelist.split(',').map(s => s.trim())
        })
        ElMessage.success('注册成功，等待审批')
        form.value = {
          name: '',
          key: '',
          description: '',
          loginCallbackPath: '',
          domainWhitelist: ''
        }
        fetchPendingGames()
    } catch (err: any) {
        // http.ts handled error display via ElMessage.error usually, 
        // but it also re-throws the error. 
        // Our onSubmit already has a try-catch, so we don't necessarily need to display it again if http.ts does it.
        // However, some custom handling might be needed.
    }
}
</script>
