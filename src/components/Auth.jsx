import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

/**
 * Supabase Auth 기반 로그인/회원가입
 * - role: member(일반 사용자) / counsellor(상담사)
 * - 가입 시 profiles에 member_id 또는 cnsler_id 생성
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
          Supabase가 설정되지 않았습니다. .env에 VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY를 넣어 주세요.
        </p>
        <button
          type="button"
          onClick={() =>
            onSuccess?.({
              id: 'demo',
              role: 'member',
              member_id: `demo_${Date.now().toString(36)}`,
              cnsler_id: null,
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
        const { data, error: signError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signError) throw signError;
        const profile = await getOrCreateProfile(data.user, role);
        onSuccess?.(profile);
      } else {
        const { data, error: signError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signError) throw signError;
        const profile = await getOrCreateProfile(data.user, role);
        onSuccess?.(profile);
      }
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  async function getOrCreateProfile(user, selectedRole) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (existing) {
      return {
        id: user.id,
        role: existing.role || 'member',
        member_id: existing.member_id ?? null,
        cnsler_id: existing.cnsler_id ?? null,
      };
    }
    const member_id =
      selectedRole === 'member' ? `m_${Date.now().toString(36)}` : null;
    const cnsler_id =
      selectedRole === 'counsellor' ? `c_${Date.now().toString(36)}` : null;
    await supabase.from('profiles').insert({
      id: user.id,
      role: selectedRole,
      member_id,
      cnsler_id,
    });
    return { id: user.id, role: selectedRole, member_id, cnsler_id };
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
            <label>
              <input
                type="radio"
                name="role"
                checked={role === 'member'}
                onChange={() => setRole('member')}
              />
              일반 사용자 (member_id)
            </label>
            <label>
              <input
                type="radio"
                name="role"
                checked={role === 'counsellor'}
                onChange={() => setRole('counsellor')}
              />
              상담사 (cnsler_id)
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
        {isLogin ? '회원가입' : '로그인'} 화면으로
      </button>
    </div>
  );
}
