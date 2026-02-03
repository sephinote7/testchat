/**
 * PeerJS용 5자리 난수 ID 생성 (10000 ~ 99999)
 * 1:1 채팅에서 짧은 ID로 상대방에게 전달하기 쉽게 함
 */
export function generateShortPeerId() {
  return String(10000 + Math.floor(Math.random() * 90000));
}
