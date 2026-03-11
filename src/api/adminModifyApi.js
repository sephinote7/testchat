import { authApi } from '../axios/Auth';

export const modifyMemberInfo = async (modifydto) => {
  try {
    // 컨트롤러의 @PatchMapping("/api/mypage/modify")와 대응
    const { data } = await authApi.patch(`/api/mypage/modify`, modifydto);

    return data; // "회원 정보가 성공적으로 수정되었습니다." 메시지 반환
  } catch (error) {
    // 컨트롤러에서 HttpStatus.CONFLICT(409) 등을 던지면 여기서 캐치됩니다.
    console.error('modifyMemberInfo error:', error);
    throw error;
  }
};
