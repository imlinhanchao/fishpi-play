export interface ApiResponse<T = any> {
    code: number;
    data: T;
    msg: string;
}

class Http {
    private baseUrl: string = '';
    private tokenGetter: () => string | null = () => null;

    setBaseUrl(url: string) {
        this.baseUrl = url;
    }

    setTokenGetter(getter: () => string | null) {
        this.tokenGetter = getter;
    }

    private async request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
        const token = this.tokenGetter();
        
        const headers = new Headers(options.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        if (options.body && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        const response = await fetch(fullUrl, {
            ...options,
            headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.msg || `HTTP Error: ${response.status}`);
        }

        const res: ApiResponse<T> = await response.json();
        if (res.code !== 0) {
            throw new Error(res.msg || 'Request failed');
        }

        return res.data;
    }

    get<T = any>(url: string, options?: RequestInit): Promise<T> {
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    post<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    put<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    delete<T = any>(url: string, options?: RequestInit): Promise<T> {
        return this.request<T>(url, { ...options, method: 'DELETE' });
    }
}

export const http = new Http();
