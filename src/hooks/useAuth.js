import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authApi } from '../axios/Auth';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

export default function useAuth() {
  // 초기 상태: 로그아웃 상태
  const [user, setUser] = useState({
    isLogin: false,
    role: 'USER',
    email: null,
    id: null,
    nickname: null,
  });
  const [loading, setLoading] = useState(true);

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setStoreEmail = useAuthStore((state) => state.setEmail);
  const setLoginStatus = useAuthStore((state) => state.setLoginStatus);
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 세션 확인
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Supabase 세션이 있으면 우선 사용
          const userRole = session.user.user_metadata?.role || 'USER';
          setUser({
            isLogin: true,
            role: userRole,
            email: session.user.email,
            id: session.user.id,
            nickname:
              session.user.user_metadata?.nickname ||
              session.user.email?.split('@')[0],
          });
        } else {
          // Supabase 세션이 없으면 더미 유저 확인 (개발/테스트용)
          const savedDummyUser = localStorage.getItem('dummyUser');
          if (savedDummyUser) {
            try {
              const parsedUser = JSON.parse(savedDummyUser);
              setUser(parsedUser);
            } catch (error) {
              console.error('더미 유저 로드 오류:', error);
              // 오류 시 로그아웃 상태 유지
              setUser({
                isLogin: false,
                role: 'USER',
                email: null,
                id: null,
                nickname: null,
              });
            }
          } else {
            // 둘 다 없으면 로그아웃 상태
            setUser({
              isLogin: false,
              role: 'USER',
              email: null,
              id: null,
              nickname: null,
            });
          }
        }
      } catch (error) {
        console.error('세션 확인 오류:', error);
        // 오류 발생 시 더미 유저 확인
        const savedDummyUser = localStorage.getItem('dummyUser');
        if (savedDummyUser) {
          try {
            const parsedUser = JSON.parse(savedDummyUser);
            setUser(parsedUser);
          } catch (err) {
            console.error('더미 유저 로드 오류:', err);
            setUser({
              isLogin: false,
              role: 'USER',
              email: null,
              id: null,
              nickname: null,
            });
          }
        } else {
          setUser({
            isLogin: false,
            role: 'USER',
            email: null,
            id: null,
            nickname: null,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Supabase 로그인 시
        const userRole = session.user.user_metadata?.role || 'USER';
        setUser({
          isLogin: true,
          role: userRole,
          email: session.user.email,
          id: session.user.id,
          nickname:
            session.user.user_metadata?.nickname ||
            session.user.email?.split('@')[0],
        });
        // Supabase 로그인 성공 시 더미 유저는 제거
        localStorage.removeItem('dummyUser');
      } else {
        // Supabase 로그아웃 시
        const savedDummyUser = localStorage.getItem('dummyUser');
        if (savedDummyUser) {
          // 더미 유저가 있으면 사용 (개발/테스트용)
          try {
            const parsedUser = JSON.parse(savedDummyUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('더미 유저 로드 오류:', error);
            setUser({
              isLogin: false,
              role: 'USER',
              email: null,
              id: null,
              nickname: null,
            });
          }
        } else {
          // 완전 로그아웃 상태
          setUser({
            isLogin: false,
            role: 'USER',
            email: null,
            id: null,
            nickname: null,
          });
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 로그인 함수
  const signIn = async (email, password) => {
    try {
      const response = await authApi.post('/api/member/login', null, {
        params: { email, password },
      });

      console.log('로그인 테스트 : ', response.data);

      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        setLoginStatus(true);

        if (response.data.email) setStoreEmail(response.data.email);
        else setStoreEmail(email);
        return { success: true };
      } else return { success: false, error: 'accessToken이 없습니다.' };
    } catch (error) {
      console.error('로그인에 실패했습니다.', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 더미 로그인 함수 (개발/테스트용)
  const dummySignIn = (role = 'USER') => {
    const dummyUsers = {
      USER: {
        isLogin: true,
        role: 'USER',
        email: 'user@test.com',
        id: 'user-123',
        nickname: '일반사용자',
      },
      COUNSELOR: {
        isLogin: true,
        role: 'COUNSELOR',
        email: 'counselor@test.com',
        id: 'counselor-123',
        nickname: '상담사',
      },
      ADMIN: {
        isLogin: true,
        role: 'ADMIN',
        email: 'admin@test.com',
        id: 'admin-123',
        nickname: '관리자',
      },
    };

    const selectedUser = dummyUsers[role] || dummyUsers.USER;
    setUser(selectedUser);
    // localStorage에 저장하여 새로고침 시에도 유지
    localStorage.setItem('dummyUser', JSON.stringify(selectedUser));
    return { success: true };
  };

  // 회원가입 함수
  const signUp = async ({
    email,
    password,
    nickname,
    social = false,
    gender = null,
    mbti = null,
    birth = null,
    persona = null,
    profile = null,
    text = null,
  }) => {
    try {
      const { data } = await authApi.post('/api/member/signup', {
        email,
        password,
        nickname,
        social,
        gender,
        mbti,
        birth,
        persona,
        profile,
        text,
      });

      console.log('회원가입 완료', data);
      return data;
    } catch (error) {
      console.error('회원가입 실패', error);
    }
  };

  // 닉네임 중복 확인 함수
  const getmemberInfoNicknameCheckYn = async (nickname) => {
    try {
      const { data } = await authApi.get('/api/member_InfoNicknameChk', {
        params: {
          nickname,
        },
      });

      return data;
    } catch (error) {
      console.error('닉네임 중복 확인 실패', error);
    }
  };
  return { user, loading, signIn, signUp, getmemberInfoNicknameCheckYn };
}
