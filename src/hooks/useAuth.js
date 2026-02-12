import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
            nickname: session.user.user_metadata?.nickname || session.user.email?.split('@')[0],
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
          nickname: session.user.user_metadata?.nickname || session.user.email?.split('@')[0],
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Supabase 로그인 성공 시 더미 유저 제거
      localStorage.removeItem('dummyUser');
      
      return { success: true, data };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error: error.message };
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
  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: metadata.role || 'USER',
            nickname: metadata.nickname || '',
            birthdate: metadata.birthdate || '',
            mbti: metadata.mbti || '',
            introduction: metadata.introduction || '',
          },
        },
      });

      if (error) throw error;
      
      // Supabase 회원가입 성공 시 더미 유저 제거
      localStorage.removeItem('dummyUser');
      
      return { success: true, data };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return { success: false, error: error.message };
    }
  };

  // 로그아웃 함수
  const signOut = async () => {
    try {
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 더미 유저도 제거 (개발/테스트용)
      localStorage.removeItem('dummyUser');
      
      // 로그아웃 상태로 변경
      setUser({
        isLogin: false,
        role: 'USER',
        email: null,
        id: null,
        nickname: null,
      });
      
      return { success: true };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류가 발생해도 로컬 상태는 초기화
      localStorage.removeItem('dummyUser');
      setUser({
        isLogin: false,
        role: 'USER',
        email: null,
        id: null,
        nickname: null,
      });
      return { success: false, error: error.message };
    }
  };

  return { user, loading, signIn, signUp, signOut, dummySignIn };
}
