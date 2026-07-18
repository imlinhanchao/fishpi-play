# 鱼丸游戏平台 SDK

游戏平台集成 SDK，提供身份认证、云存档以及实时属性同步功能。

## 安装

```bash
npm install fishpi-play
```

## 快速开始

### 初始化

```typescript
import { GameSDK } from 'fishpi-play';

const sdk = new GameSDK('your_game_key', 'https://play.adventext.fun');
```

### 身份认证

```typescript
// 1. 初始化认证（处理回调 URL 中的登录信息）
await sdk.initAuth();

// 2. 检查登录状态
if (!await sdk.isAuthenticated()) {
    // 3. 跳转登录
    sdk.login(window.location.href);
}

// 4. 获取用户信息
const user = await sdk.getUserProfile();
console.log('Welcome, ' + user.nickname);

// 5. 登出
sdk.logout();
```

### 云存档

```typescript
// 上传存档
await sdk.saveArchive(JSON.stringify({ score: 100 }));

// 获取存档
const archive = await sdk.getArchive();
if (archive) {
    console.log('Last saved at:', archive.updatedAt);
    const data = JSON.parse(archive.content);
}
```

### 实时属性同步 (WebSocket)

```typescript
// 连接实时消息服务
sdk.connectRealtime((msg) => {
    console.log('Received message:', msg);
});

// 设置属性
sdk.setAttributes({ status: 'in-game', level: 5 });

// 获取当前属性
const attrs = sdk.getAttributes();
```

## API 参考

### `GameSDK`

#### `constructor(gameKey: string, baseUrl?: string)`
初始化 SDK 实例。`baseUrl` 默认为 `http://localhost:3000`。

#### `validateDomain(): Promise<boolean>`
校验当前域名是否在游戏的许可白名单内。

#### `login(redirectUri?: string): Promise<void>`
跳转至平台登录页面。

#### `logout(): Promise<void>`
清除本地 token，退出登录。

#### `initAuth(): Promise<boolean>`
尝试从当前页面 URL 解析验证信息。如果验证成功，将自动存储 Token 并返回 `true`。

#### `isAuthenticated(): Promise<boolean>`
检查当前 Token 是否有效并返回用户信息。

#### `getToken(): string | null`
获取当前存储的授权 Token。

#### `setToken(token: string): void`
手动设置授权 Token（例如从其他存储恢复时）。

#### `getUserProfile(): Promise<UserInfo>`
获取当前登录用户的详细信息。

#### `saveArchive(content: string): Promise<void>`
保存字符串格式的存档数据到云端。

#### `getArchive(): Promise<{ content: string; updatedAt: string } | null>`
获取云端存档及其更新时间。

#### `connectRealtime(onMessage?: (data: any) => void): void`
通过 WebSocket 连接实时同步服务。

#### `setAttributes(attributes: Record<string, any>): void`
设置当前用户的实时属性（如状态、位置等）。

#### `getAttributes(): Record<string, any>`
获取已同步的用户实时属性。

#### `getOtherDevices(): void`
请求获取当前账号在其他设备上的登录信息（通过 WebSocket 返回数据）。

## 类型定义

### `UserInfo`

```typescript
interface UserInfo {
    id: string;       // 用户唯一 ID
    username: string; // 用户名
    nickname: string; // 昵称
    avatar: string;   // 头像 URL
    isAdmin: boolean; // 是否为管理员
}
```
