import ReconnectingWebSocket from 'reconnecting-websocket';
import { http } from './http';

/**
 * 用户信息
 * @interface UserInfo
 * @property {string} id - 用户 ID
 * @property {string} username - 登录用户名
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像 URL
 * @property {boolean} isAdmin - 是否为管理员
 */
export interface UserInfo {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    isAdmin: boolean;
}

/**
 * 在线设备信息
 * @interface OnlineDevice
 * @property {string} clientId - 设备连接 ID
 * @property {any} attributes - 设备属性
 */
export interface OnlineDevice {
    clientId: string;
    attributes: any;
}

/**
 * 在线客户端信息（包含用户信息和设备属性）
 * @interface OnlineClient
 * @extends UserInfo
 * @property {string} clientId - 设备连接 ID
 * @property {any} attributes - 设备属性
 */
export interface OnlineClient extends UserInfo {
    clientId: string;
    attributes: any;
}

/**
 * 在线用户信息（按 userId 去重，包含每台设备信息）
 * @interface OnlineUser
 * @extends OnlineClient
 * @property {OnlineDevice[]} devices - 用户的所有在线设备列表
 */
export interface OnlineUser extends OnlineClient {
    devices: OnlineDevice[];
}

/**
 * 发送消息结果
 * @interface SendResult
 * @property {number} sent - 成功发送的连接数量
 */
export interface SendResult {
    sent: number;
}

/**
 * GameSDK 类提供了与游戏后端交互的功能，包括用户认证、存档管理、实时通信等。
 * @class GameSDK
 * @example
 * const sdk = new GameSDK('my-game-key');
 * await sdk.login();
 * await sdk.initAuth();
 * const userInfo = await sdk.getUserProfile();
 * await sdk.saveArchive('my game save data');
 * const archive = await sdk.getArchive();
 * sdk.connectRealtime((data) => {
 *     console.log('Received real-time message:', data);
 * });
 * sdk.setAttributes({ level: 5, score: 1000 });
 * const attributes = sdk.getAttributes();
 * const onlineUsers = await sdk.getOnlineUsers();
 * const onlineClients = await sdk.getOnlineClients();
 * const sendResult = await sdk.sendMessageToUsers(['user1', 'user2'], { type: 'custom', payload: 'Hello' });
 */
export class GameSDK {
    /** 游戏 Key，用于多游戏区分 */
    private gameKey: string;
    /** 后端基础地址 */
    private baseUrl: string;
    /** 当前认证 token，保存在 localStorage 中 */
    private token: string | null = null;
    /** 实时连接的 WebSocket 实例（可重连） */
    private ws: ReconnectingWebSocket | null = null;
    /** 存放从服务端同步过来的用户属性 */
    private userAttributes: Record<string, any> = {};
    /** 事件监听器集合，按事件类型存储回调函数数组 */
    private eventListeners: { [event: string]: Array<(data: any) => void> } = {};

    /**
     * 创建 GameSDK 实例
     * @param {string} gameKey - 游戏的唯一标识
     * @param {string} [baseUrl=http://play.adventext.fun] - 后端基础地址
     */
    constructor(gameKey: string, baseUrl: string = 'http://play.adventext.fun') {
        this.gameKey = gameKey;
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem(this.tokenKey);

        // 初始化 HTTP 驱动
        http.setBaseUrl(this.baseUrl);
        http.setTokenGetter(() => this.token);
    }

    /**
     * localStorage 中保存 token 的 key
     * @private
     * @returns {string}
     */
    private get tokenKey(): string {
        return `token${this.gameKey ? '_' + this.gameKey : ''}`;
    }
    
    /**
     * 获取登录跳转地址并跳转到第三方登录或授权页面
     * @param {string} [redirectUri] - 可选的回调跳转地址
     * @returns {Promise<void>}
     */
    async login(redirectUri?: string) {
        const data = await http.get<{ url: string }>(`/api/auth/login-url?gameKey=${this.gameKey}&redirect=${encodeURIComponent(redirectUri || '')}`);
        if (data.url) {
            window.location.href = data.url;
        }
    }

    /**
     * 注销当前会话并移除本地保存的 token
     * @returns {Promise<void>}
     */
    async logout() {
        this.token = null;
        localStorage.removeItem(this.tokenKey);
    }

    /**
     * 解析当前页面 URL（或 hash）中的回调参数并向后端验证登录信息，验证成功后会保存 token 并跳转。
     * 支持从 `window.location.search` 或 `window.location.hash` 中解析查询参数（兼容 hash 路由）。
     * @returns {Promise<boolean>} 如果验证成功并设置了 token 则返回 true
     */
    async initAuth() {
        let urlParams = new URLSearchParams(window.location.search);

        // 如果 search 中没有，尝试从 hash 中解析（兼容 Vue Hash Router 等）
        if (!urlParams.has('openid.ns') && window.location.hash.includes('?')) {
            const queryInHash = window.location.hash.split('?')[1];
            urlParams = new URLSearchParams(queryInHash);
        }

        const authCode = urlParams.get('openid.ns');
        // 假如我们已经登录完成回调回来带了用户信息或者 code
        if (authCode) {
            const data = await http.post<{ token: string; user: any }>('/api/auth/verify', {
                gameKey: this.gameKey,
                ...Object.fromEntries(urlParams.entries())
            });

            if (data.token) {
                this.token = data.token;
                localStorage.setItem(this.tokenKey, this.token || '');
                const redirect = urlParams.get('redirect') || '/';
                window.location.href = redirect;
                return true;
            }
        }
        return false;
    }

    /**
     * 检查当前 token 是否有效，尝试拉取用户信息来验证
     * @returns {Promise<boolean>} 是否已认证
     */
    async isAuthenticated(): Promise<boolean> {
        if (!this.token) return false;
        try {
            await this.getUserProfile();
            return true;
        } catch (e) {
            this.token = null;
            localStorage.removeItem(this.tokenKey);
            return false;
        }
    }

    /**
     * 获取当前 token
     * @returns {string | null}
     */
    getToken(): string | null {
        return this.token;
    }

    /**
     * 设置并持久化 token
     * @param {string} token - JWT 或会话 token
     */
    setToken(token: string) {
        this.token = token;
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * 拉取当前用户信息
     * @returns {Promise<UserInfo>} 用户信息
     */
    async getUserProfile(): Promise<UserInfo> {
        return await http.get<UserInfo>('/api/user/profile');
    }

    /**
     * 保存存档内容到服务器
     * @param {string} content - 存档内容的序列化字符串
     * @returns {Promise<void>}
     */
    async saveArchive(content: string) {
        await http.post('/api/storage/archive', { content });
    }

    /**
     * 获取当前用户的存档
     * @returns {Promise<{ content: string; updatedAt: string } | null>} 存档数据或 null
     */
    async getArchive(): Promise<{ content: string; updatedAt: string } | null> {
        return await http.get<{ content: string; updatedAt: string } | null>('/api/storage/archive');
    }

    /**
     * 建立实时 WebSocket 连接（使用 ReconnectingWebSocket）并监听消息
     * @param {(data: any) => void} [onMessage] - 可选的消息回调
     * @throws {Error} 如果未登录（没有 token）则抛出错误
     */
    connectRealtime(onMessage?: (data: any) => void) {
        if (!this.token) throw new Error("Need login first");
        const wsUrl = this.baseUrl.replace('http', 'ws') + `?token=${this.token}`;
        this.ws = new ReconnectingWebSocket(wsUrl);
        
        this.ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (onMessage) onMessage(msg);
            if (msg.type === 'attributes_sync') {
                this.userAttributes = msg.attributes;
            }
            if (msg.type === 'custom_message' && msg.data?.type) {
                const listeners = this.eventListeners[msg.data.type];
                if (listeners && listeners.length > 0) {
                    listeners.forEach(callback => callback(msg.data.payload));
                }
            }
        };
    }

    /**
     * 设置并推送用户属性到服务端
     * @param {Record<string, any>} attributes - 要设置的属性对象
     * @returns {void}
     */
    setAttributes(attributes: Record<string, any>) {
        this.ws?.send(JSON.stringify({ type: 'set_attributes', attributes }));
    }

    /**
     * 获取本地缓存的用户属性（由服务端主动同步）
     * @returns {Record<string, any>} 用户属性对象
     */
    getAttributes(): Record<string, any> {
        return this.userAttributes;
    }

    /**
     * 请求获取其他设备信息（通过 WebSocket）
     * @returns {void}
     */
    getOtherDevices() {
        this.ws?.send(JSON.stringify({ type: 'get_devices' }));
    }

    /**
     * 获取在线用户（按 userId 去重，包含每台设备信息）
     * @returns {Promise<OnlineUser[]>} 在线用户列表
     */
    async getOnlineUsers(): Promise<OnlineUser[]> {
        return await http.get<OnlineUser[]>(`/api/ws/${this.gameKey}/users`);
    }

    /**
     * 获取在线客户端列表（包含每台设备信息）
     * @returns {Promise<OnlineClient[]>} 在线客户端列表
     */
    async getOnlineClients(): Promise<OnlineClient[]> {
        return await http.get<OnlineClient[]>(`/api/ws/${this.gameKey}/clients`);
    }

    /**
     * 获取指定用户的在线客户端列表
     * @param {string} userId - 用户 ID
     * @returns {Promise<any[]>} 在线客户端列表
     */
    async getOnlineClientsByUser(userId: string): Promise<OnlineClient[]> {
        return await http.get<OnlineClient[]>(`/api/ws/${this.gameKey}/${userId}/clients`);
    }

    /**
     * 向指定用户 ID 列表发送消息（将发送给该用户的所有设备）
     * @param {string[]} userIds - 用户 ID 列表
     * @param {any} payload - 消息负载
     */
    async sendToUsers(userIds: string[], event: string, payload: any): Promise<SendResult> {
        return await http.post<SendResult>(`/api/ws/${this.gameKey}/send`, { userIds, payload: { type: event, payload } });
    }


    /**
     * 向指定客户端 ID 列表发送消息
     * @param {string[]} clientIds - 客户端 ID 列表
     * @param {any} payload - 消息负载
     */
    async sendToClients(clientIds: string[], payload: any): Promise<SendResult> {
        return await http.post<SendResult>(`/api/ws/${this.gameKey}/send`, { clientIds, payload });
    }

    /**
     * 监听指定事件类型的消息回调，返回一个取消监听的函数
     * @param {string} event - 事件类型
     * @param {(data: any) => void} callback - 事件回调
     * @returns {() => void} 取消监听的函数
     */
    on(event: string, callback: (data: any) => void) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
        return () => {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        };
    }

    /**
     * 取消监听指定事件类型的消息回调
     * @param {string} event - 事件类型
     * @param {(data: any) => void} callback - 事件回调
     */
    off(event: string, callback: (data: any) => void) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }
}
