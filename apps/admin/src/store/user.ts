import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserProfile, type UserProfile } from '../api/user';

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<UserProfile | null>(null);
    const isLoggedIn = ref(false);

    const fetchUserInfo = async () => {
        try {
            const profile = await getUserProfile();
            userInfo.value = profile;
            isLoggedIn.value = true;
            return profile;
        } catch (error) {
            userInfo.value = null;
            isLoggedIn.value = false;
            throw error;
        }
    };

    const logout = () => {
        userInfo.value = null;
        isLoggedIn.value = false;
        localStorage.clear();
        window.location.href = '/login';
    };

    return {
        userInfo,
        isLoggedIn,
        fetchUserInfo,
        logout
    };
});
