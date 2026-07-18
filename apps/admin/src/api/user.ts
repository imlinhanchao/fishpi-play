import http from '../utils/http';

export interface UserProfile {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    isAdmin: boolean;
}

export const getUserProfile = () => {
    return http.get<UserProfile>('/user/profile');
};
