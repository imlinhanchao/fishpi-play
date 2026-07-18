import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { GameSDK } from 'fishpi-play'

const sdk = new GameSDK('', '')

class Http {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: '/api',
            timeout: 10000,
        });

        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                const token = sdk.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                const res = response.data;
                // 根据后端定义的结构: { code, data, msg }
                if (res.code !== 0) {
                    ElMessage.error(res.msg || '请求失败');
                    return Promise.reject(new Error(res.msg || '请求失败'));
                }
                // 只返回 data 部分
                return res.data;
            },
            (error) => {
                const message = error.response?.data?.msg || error.message || '网络错误';
                ElMessage.error(message);
                return Promise.reject(error);
            }
        );
    }

    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.get(url, config);
    }

    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.post(url, data, config);
    }

    public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.put(url, data, config);
    }

    public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.delete(url, config);
    }
}

export const http = new Http();
export default http;
