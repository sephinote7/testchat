# PC 버전 폰트 사이즈 가이드라인

## 폰트 사이즈 기준 (Tailwind CSS 클래스)

### Heading

- **h1**: `text-[60px] font-bold` (60px Bold)
- **h2**: `text-[48px] font-bold` (48px Bold)
- **h3**: `text-[36px] font-semibold` (36px SemiBold)
- **h4**: `text-[30px] font-semibold` (30px SemiBold)
- **h5**: `text-[24px] font-medium` (24px Medium)
- **h6**: `text-[18px] font-medium` (18px Medium)

### Body & Input

- **p**: `text-base font-normal` (16px Regular)
- **input**: `text-base font-normal` (16px Regular)
- **sm**: `text-sm font-normal` (14px Regular)
- **xs**: `text-xs font-normal` (12px Regular)

## Tailwind Config 매핑

```javascript
fontSize: {
  'xs': '12px',    // 12px
  'sm': '14px',    // 14px
  'base': '16px',  // 16px (default)
  'lg': '18px',    // 18px
  'xl': '24px',    // 24px
  '2xl': '30px',   // 30px
  '3xl': '36px',   // 36px
  '4xl': '48px',   // 48px
  '5xl': '60px',   // 60px
}
```

## 사용 예시

```jsx
{
  /* PC 버전 제목 */
}
<h1 className="text-2xl font-bold lg:text-[60px] lg:font-bold">제목</h1>;

{
  /* PC 버전 부제목 */
}
<h2 className="text-xl font-bold lg:text-[48px] lg:font-bold">부제목</h2>;

{
  /* PC 버전 본문 */
}
<p className="text-sm lg:text-base lg:font-normal">본문 내용</p>;

{
  /* PC 버전 작은 텍스트 */
}
<span className="text-xs lg:text-sm lg:font-normal">작은 텍스트</span>;
```

## 적용 원칙

1. **모바일 우선**: 모바일 사이즈를 먼저 정의하고 `lg:` 브레이크포인트에서 PC 사이즈 적용
2. **일관성**: 모든 PC 화면에서 동일한 기준 적용
3. **반응형**: `lg:` (1024px 이상)에서만 PC 폰트 사이즈 적용
