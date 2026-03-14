import { useState, useEffect } from 'react';
import { authApi } from '../axios/Auth';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { supabase } from './../lib/supabase';
import { memberApi } from '../api/backendApi';

export default function useAuth() {
  // 초기 상태: 로그아웃 상태
  const [user, setUser] = useState({
    isLogin: false,
    role: 'USER',
    email: null,
    id: null,
    nickname: null,
    provider: null,
    kakao_additional_done: false,
  });
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken); // accessToken 상태를 가져옵니다.

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
          const provider = session.user.app_metadata?.provider;
          const userRole = session.user.user_metadata?.role || 'USER';
          const kakaoAdditionalDone = !!session.user.user_metadata?.kakao_additional_done;
          const nickname = session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || 'user';
          setUser({
            isLogin: true,
            role: userRole,
            email: session.user.email,
            id: session.user.id,
            nickname,
            provider: provider || null,
            kakao_additional_done: kakaoAdditionalDone,
          });
          // 백엔드 member 테이블에 동기화 (게시글 작성 등에 필요)
          const memberId = session.user.email || session.user.id;
          memberApi.sync({ memberId, nickname }).catch(() => {});
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
                provider: null,
                kakao_additional_done: false,
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
              provider: null,
              kakao_additional_done: false,
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
              provider: null,
              kakao_additional_done: false,
            });
          }
        } else {
          setUser({
            isLogin: false,
            role: 'USER',
            email: null,
            id: null,
            nickname: null,
            provider: null,
            kakao_additional_done: false,
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
        const provider = session.user.app_metadata?.provider;
        const userRole = session.user.user_metadata?.role || 'USER';
        const kakaoAdditionalDone = !!session.user.user_metadata?.kakao_additional_done;
        const nickname = session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || 'user';
        setUser({
          isLogin: true,
          role: userRole,
          email: session.user.email,
          id: session.user.id,
          nickname,
          provider: provider || null,
          kakao_additional_done: kakaoAdditionalDone,
        });
        // Supabase 로그인 성공 시 더미 유저는 제거
        localStorage.removeItem('dummyUser');
        // 백엔드 member 테이블에 동기화 (게시글 작성 등에 필요)
        const memberId = session.user.email || session.user.id;
        memberApi.sync({ memberId, nickname }).catch(() => {});
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
            provider: null,
            kakao_additional_done: false,
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

  // 카카오 회원가입
  const kakaoSignUp = async (formData) => {
    try {
      const { data } = await authApi.patch('/api/member/kakao-signup', formData);

      console.log('회원가입 완료', data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // 닉네임 중복 확인 함수 (빈 값이면 API 호출하지 않음 — 403/파싱 오류 방지)
  const getmemberInfoNicknameCheckYn = async (nickname) => {
    const trimmed = nickname != null ? String(nickname).trim() : '';
    if (!trimmed) {
      throw new Error('닉네임을 입력해 주세요.');
    }
    try {
      const { data } = await authApi.get('/api/member_InfoNicknameChk', {
        params: {
          nickname: trimmed,
        },
      });
      return data;
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message ?? error?.message ?? '서버 연결에 실패했습니다.';
      if (status >= 500) {
        console.warn('닉네임 중복 확인 실패: 서버 일시 오류');
      } else {
        console.error('닉네임 중복 확인 실패', msg);
      }
      throw new Error(status >= 500 ? '서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.' : msg);
    }
  };

  const uploadProfileImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const filePath = `profile/${fileName}`;

    const { error } = await supabase.storage.from('profile-images').upload(filePath, file, {
      upsert: false,
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);

    return {
      img_name: fileName,
      img_url: data.publicUrl,
    };
  };

  const saveProfileImage = async (memberId, imgName, imgUrl) => {
    const { error } = await supabase
      .from('member')
      .update({
        img_name: imgName,
        img_url: imgUrl,
      })
      .eq('member_id', memberId);

    if (error) {
      throw error;
    }
  };

  const editInfo = async (formData) => {
    const { data } = await authApi.patch('/api/mypage/modify', formData);
    return data;
  };

  const getUserInfo = async () => {
    const { data } = await authApi.get('/api/mypage');
    return data;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    getmemberInfoNicknameCheckYn,
    kakaoSignUp,
    uploadProfileImage,
    saveProfileImage,
    editInfo,
    getUserInfo,
  };
}
