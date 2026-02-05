import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

/**
 * Supabase Auth 기반 로그인/회원가입
 * - 테이블명: member (profiles에서 수정됨)
 * - 컬럼: id, email, role
 */
export default function Auth({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!supabase) {
    return (
      <div className="auth-box">
        <p className="auth-error">
          Supabase가 설정되지 않았습니다. .env 파일을 확인해주세요.
        </p>
        <button
          type="button"
          onClick={() =>
            onSuccess?.({
              id: 'demo',
              role: 'member',
              email: 'demo@test.com',
            })
          }
        >
          데모로 진행 (Supabase 없음)
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        // 1. 로그인 시도
        const { data, error: signError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signError) throw signError;

        // 2. member 테이블에서 프로필 확인
        const profile = await getOrCreateProfile(data.user, role);
        onSuccess?.(profile);
      } else {
        // 1. 회원가입 시도
        const { data, error: signError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signError) throw signError;

        // 2. member 테이블에 프로필 생성
        const profile = await getOrCreateProfile(data.user, role);
        onSuccess?.(profile);
      }
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * member 테이블에서 데이터를 읽거나 새로 생성하는 함수
   */
  async function getOrCreateProfile(user, selectedRole) {
    // [수정] 테이블명을 'profiles'에서 'member'로 변경
    const { data: existing, error: fetchError } = await supabase
      .from('member')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // single() 대신 maybeSingle()이 더 안전합니다.

    if (existing) {
      return {
        id: user.id,
        role: existing.role || 'member',
        email: existing.email,
      };
    }

    // [수정] 신규 가입 시 member 테이블에 삽입
    // 이제 난수 ID 대신 실제 이메일을 저장하여 Peer ID로 사용합니다.
    const newProfile = {
      id: user.id,
      email: user.email,
      role: selectedRole,
    };

    const { error: insertError } = await supabase
      .from('member')
      .insert(newProfile);

    if (insertError) {
      console.error('프로필 생성 실패:', insertError.message);
      // 에러가 나더라도 인증은 성공했으므로 최소 정보를 반환
      return { id: user.id, role: selectedRole, email: user.email };
    }

    return newProfile;
  }

  return (
    <div className="auth-box">
      <h2>{isLogin ? '로그인' : '회원가입'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {!isLogin && (
          <div className="auth-role">
            <p style={{ fontSize: '14px', marginBottom: '5px' }}>역할 선택:</p>
            <label>
              <input
                type="radio"
                name="role"
                checked={role === 'member'}
                onChange={() => setRole('member')}
              />
              일반 사용자
            </label>
            <label>
              <input
                type="radio"
                name="role"
                checked={role === 'cnsler'} // DB 값과 일치하도록 'cnsler'로 수정
                onChange={() => setRole('cnsler')}
              />
              상담사
            </label>
          </div>
        )}
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '처리 중…' : isLogin ? '로그인' : '가입'}
        </button>
      </form>
      <button
        type="button"
        className="auth-toggle"
        onClick={() => {
          setIsLogin((v) => !v);
          setError('');
        }}
      >
        {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있나요? 로그인'}
      </button>
    </div>
  );
}
