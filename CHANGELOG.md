# Changelog

All notable changes to PICVIUM releases are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-14

첫 정식 배포입니다. 아래는 Windows x64 빌드의 변경 내용이며,
기존 `test` 공개 테스트 빌드와 기능·검증 범위가 같다는 뜻은 아닙니다.

### Added

- 이미지 보기: 창 맞춤·1:1·확대/축소·이동·전체 화면, 폴더 탐색과 썸네일, GIF/APNG/WebP/JPEG XL 재생, 여러 페이지 이동.
- JPEG/PNG/WebP/AVIF/HEIC/TIFF·PSD/PSB·SVG/ICO 등 검증된 이미지 보기, RAW 21개 확장자와 X3F/GPR 전체 디코딩, PDF 정적 페이지·EPS 내장 미리보기.
- 실제 해상도·MP·원본 비트 수·형식·크기·날짜 출처·파일 위치 정보와 EXIF 사이드바.
- 자르기·크기 변경·회전·반전·실행 취소/다시 실행·이미지 복사, JPEG/PNG/BMP/TIFF/WebP/AVIF/GIF로 실제 인코딩 저장.
- AI 업스케일: 사진·일러스트 모델, 2/4/8배, Vulkan GPU 확인, 진행·취소·결과 비교·새 파일 저장(Windows x64).
- 일괄 변환: 여러 파일·7개 저장 형식·품질·진행·취소·파일별 결과. 첫 이미지/페이지 처리, 메타데이터 제거·ICC 유지, 기존 파일 건너뛰기.
- 도구 모음 명령·순서·구분선 사용자 지정, 아이콘 테마, 명령 검색·단축키 안내.
- 9개 언어 즉시 전환, 포터블·원자적 버전 설정, 단일 실행과 Windows 파일 연결·바탕화면·파일 위치·휴지통 연동.

