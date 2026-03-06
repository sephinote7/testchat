import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  accessToken: null,
  email: null,
  // userInfo: { username: null, email: null, role: null, img: null },
  loginStatus: false,
  nickname: null,
  roleName: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setEmail: (email) => set({ email }),
  setLoginStatus: (loginStatus) => set({ loginStatus }),
  setNickname: (nickname) => set({ nickname }),
  setRoleName: (roleName) => set({ roleName }),
  clearAuth: () => set({ accessToken: null, email: null, loginStatus: false, roleName: null }),
  // setUserInfo: (userInfo) => set({ userInfo }),
}));
