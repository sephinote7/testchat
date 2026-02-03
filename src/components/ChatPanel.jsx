import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import './ChatPanel.css';

/**
 * 1:1 채팅 패널: 메시지 목록 + 입력
 * sendMessage(text)는 DataConnection이 열려 있을 때만 동작
 */
export default function ChatPanel({ sendMessage, disabled }) {
  const messages = useChatStore((s) => s.messages);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || disabled) return;
    sendMessage(text);
    setInput('');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="chat-panel">
      <div className="chat-panel-header">
        <h3>채팅</h3>
        <button
          type="button"
          className="chat-clear-btn"
          onClick={clearMessages}
          disabled={messages.length === 0}
          title="채팅 내역 지우기"
        >
          내역 지우기
        </button>
      </div>
      <ul ref={listRef} className="chat-message-list">
        {messages.length === 0 && (
          <li className="chat-empty">연결 후 대화를 나눠 보세요.</li>
        )}
        {messages.map((m) => (
          <li key={m.id} className={`chat-message chat-message--${m.from}`}>
            <span className="chat-message-label">
              {m.from === 'me' ? '나' : '상대'}
            </span>
            <span className="chat-message-text">{m.text}</span>
            <span className="chat-message-time">{formatTime(m.time)}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          className="chat-input"
          placeholder={disabled ? '연결 후 입력 가능' : '메시지 입력...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={disabled || !input.trim()}
        >
          전송
        </button>
      </form>
    </section>
  );
}
