/**
 * 마이페이지 회원 정보 수정 요청 함수
 * @param {Object} modifyData - 수정할 회원 정보 (nickname, password 등)
 */
async function modifyMemberInfo(modifyData) {
    const url = '/api/mypage/modify';

    try {
        const response = await fetch(url, {
            method: 'PATCH', // 컨트롤러의 @PatchMapping과 일치
            headers: {
                'Content-Type': 'application/json',
                // Spring Security 사용 시 필요에 따라 CSRF 토큰이나 JWT를 여기에 추가해야 합니다.
            },
            body: JSON.stringify(modifyData)
        });

        const message = await response.text();

        if (response.ok) {
            // 200 OK: 수정 성공
            alert(message);
            // 성공 후 마이페이지 메인으로 이동하거나 화면 갱신
            window.location.href = '/mypage'; 
        } else if (response.status === 409) {
            // 409 CONFLICT: 중복된 닉네임 등 비즈니스 로직 에러
            alert("수정 실패: " + message);
        } else {
            // 500 등 기타 에러
            alert("오류가 발생했습니다: " + message);
        }
    } catch (error) {
        console.error("네트워크 오류:", error);
        alert("서버와 통신하는 중 문제가 발생했습니다.");
    }
}

// 사용 예시 (폼 제출 이벤트 발생 시)
/*
const formData = {
    nickname: "새로운닉네임",
    password: "newPassword123"
};
modifyMemberInfo(formData);
*/