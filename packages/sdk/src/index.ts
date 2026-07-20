import ReconnectingWebSocket from 'reconnecting-websocket';
import { http } from './http';

export interface UserInfo {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    isAdmin: boolean;
}

export class GameSDK {
    private gameKey: string;
    private baseUrl: string;
    private token: string | null = null;
    private ws: ReconnectingWebSocket | null = null;
    private userAttributes: Record<string, any> = {};

    constructor(gameKey: string, baseUrl: string = 'http://play.adventext.fun') {
        this.gameKey = gameKey;
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem(this.tokenKey);

        // 初始化 HTTP 驱动
        http.setBaseUrl(this.baseUrl);
        http.setTokenGetter(() => this.token);
    }

    private get tokenKey(): string {
        return `token${this.gameKey ? '_' + this.gameKey : ''}`;
    }

    // 1. 域名校验 (简单模拟，实际需从后端获取白名单)
    async validateDomain(): Promise<boolean> {
        // 实际开发中应调用后端接口获取该 gameKey 的白名单并比对 window.location.hostname
        return true;
    }

    // 2. 获取登录跳转地址并跳转
    async login(redirectUri?: string) {
        const data = await http.get<{ url: string }>(`/api/auth/login-url?gameKey=${this.gameKey}&redirect=${encodeURIComponent(redirectUri || '')}`);
        if (data.url) {
            window.location.href = data.url;
        }
    }

    async logout() {
        this.token = null;
        localStorage.removeItem(this.tokenKey);
    }

    // 3. 从 URL 解析参数并验证登录
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

    getToken(): string | null {
        return this.token;
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem(this.tokenKey, token);
    }

    // 4. 获取用户信息
    async getUserProfile(): Promise<UserInfo> {
        return await http.get<UserInfo>('/api/user/profile');
    }

    // 5. 存档存取
    async saveArchive(content: string) {
        await http.post('/api/storage/archive', { content });
    }

    async getArchive(): Promise<{ content: string; updatedAt: string } | null> {
        return await http.get<{ content: string; updatedAt: string } | null>('/api/storage/archive');
    }

    // 6. WebSocket 链接与属性存取
    connectRealtime(onMessage?: (data: any) => void) {
        if (!this.token) throw new Error("Need login first");
        const wsUrl = this.baseUrl.replace('http', 'ws') + `?token=${this.token}`;
        this.ws = new ReconnectingWebSocket(wsUrl);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
            if (data.type === 'attributes_sync') {
                this.userAttributes = data.attributes;
            }
        };
    }

    setAttributes(attributes: Record<string, any>) {
        this.ws?.send(JSON.stringify({ type: 'set_attributes', attributes }));
    }

    getAttributes(): Record<string, any> {
        return this.userAttributes;
    }

    getOtherDevices() {
        this.ws?.send(JSON.stringify({ type: 'get_devices' }));
    }
}
