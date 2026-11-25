# N% 런로그
엔퍼센트 크루와 지역 러너가 러닝 앱 캡처를 인증하고 14일간 함께 달린 기록을 확인하는 모바일 웹 앱입니다.

## 로컬 실행
Node.js 22.13 이상과 npm이 설치된 컴퓨터에서 압축을 풀고 package.json이 있는 폴더에서 실행하세요.

```sh
npm install
npm run setup
npm run dev
```

메인은 http://localhost:3000, 운영진 화면은 http://localhost:3000/admin 입니다.
`setup`은 .env가 없을 때 예시 설정을 복사하고 Prisma Client 생성, SQLite 스키마 적용, 샘플 데이터 입력을 순서대로 실행합니다. 테스트용 시드만 다시 입력하려면 `npm run seed`를 사용하세요. 실제 운영 데이터베이스에는 샘플 시드를 넣지 마세요.

| 테스트 항목 | 값 |
|---|---|
| 샘플 인스타 ID | pace.jin, runwith_yuna, seoul.strider, min_42k, river.runner |
| 샘플 러너 PIN | 2580 |
| 로컬 관리자 비밀번호 | 1234 |
| 초깃값 | 샘플 러너 5명, 러닝 15건, 추첨 대상 3명 |

## 첫 러닝 인증
1. 메인의 **러닝 기록 인증하기**를 누르고 인스타 ID와 PIN을 입력합니다. 기존 ID는 자동완성 목록에서 선택할 수 있습니다. 영문 대소문자는 같은 ID로 처리합니다. 최초 입력자가 ID를 등록하며 인스타그램 소유권을 인증하는 방식은 아닙니다.
2. 인증 창에 NRC, 스트라바, 가민 등 러닝 앱의 PNG, JPEG, WebP 캡처를 끌어 놓거나 갤러리에서 선택합니다. 사진은 분석 후 서버에 보관하지 않습니다. 키가 있으면 분석을 위해 OpenAI로 전송합니다.
3. 날짜·거리·운동 시간을 확인하고 **기록 등록하기**를 누릅니다. 운동 시간은 시:분:초 형식입니다. 읽지 못한 값은 직접 입력할 수 있습니다.
4. 같은 날짜에 거리가 5.05km와 5.14km인 두 기록은 모두 5.1km 구간으로 처리하므로 두 번째 등록이 차단됩니다.
5. 크루원 이름은 인스타그램으로 연결됩니다. 성장곡선 우측 **나** 탭은 인증한 러너의 날짜별 누적 거리를 표시합니다.

## 설정
| 환경변수 | 설명 |
|---|---|
| DATABASE_URL | 기본값 file:./runlog.db. 파일은 prisma 폴더에 생성됩니다. |
| OPENAI_API_KEY | 서버에서만 사용합니다. 비어 있으면 오늘 날짜, 5.20km, 00:30:15 예시가 표시됩니다. |
| ADMIN_PASSWORD | 운영진 비밀번호. 외부 공개 전 기본값을 변경하세요. |
| SEASON_START | 최초 실행 전에 지정하는 1회차 시작일(YYYY-MM-DD). 기본은 설치 당일로부터 6일 전입니다. |

## 집계와 추첨
- 한국 시간 자정에 회차가 전환됩니다. 시작일을 포함해 14일이며, 다음 회차 시작일은 포함하지 않습니다. 이번 회차의 오늘까지 기록을 등록할 수 있습니다.
- 거리와 시간은 각각 정수 미터와 초로 저장합니다. 화면의 총거리와 개인·크루 차트에 같은 기록이 반영됩니다.
- 성장률은 (이번 거리 − 이전 거리) ÷ 이전 거리 × 100입니다. 1회차는 인증 횟수순입니다. 이후 회차는 성장률 보유자를 먼저 배치하고, 전 회차 기록이 없는 러너끼리는 인증 횟수로 정렬합니다. 동점이면 인스타 ID 오름차순입니다.
- 운영진 화면의 결과 카드는 인스타그램에 공유할 수 있도록 캡처용으로 구성했습니다. 참가자 3회 이상 인증 시 추첨 대상에 포함됩니다. 서버의 crypto.randomInt로 1~3명을 비복원 추출합니다. 화면의 애니메이션은 당첨 결과에 영향을 주지 않습니다. 다시 추첨하면 독립적인 새 결과가 나옵니다.
- 사용자 세션은 브라우저 localStorage에 보관하며 유효기간은 30일입니다. 관리자 세션은 sessionStorage에 보관하며 유효기간은 8시간입니다. 서버에는 세션 토큰의 해시와 소금을 적용한 PIN 해시만 저장합니다.

## 프로젝트 구성
| 경로 | 담당 기능 |
|---|---|
| prisma/schema.prisma, prisma/seed.ts | User, Season, RunRecord, Session 모델과 샘플 데이터 |
| app/api/[action]/route.ts | 인증, 이미지 분석, 기록 저장, 랭킹 및 추첨 |
| lib/domain.ts, lib/server.ts | 한국 날짜, 회차, 집계, 순위 계산과 인증 |
| components/Dashboard.tsx, components/Upload.tsx | 메인 화면, 성장곡선, 인증 폼 |
| app/admin/page.tsx | 운영진 인증, 결과 카드와 행운상 |
| app/globals.css | 첨부 시안의 직물 질감과 원형 N% 엠블럼을 응용한 스포츠 테마 |

## API
| 메서드 | 경로 | 동작 |
|---|---|---|
| GET | /api/members | 자동완성 ID |
| POST | /api/auth | handle, pin으로 참여 및 세션 발급 |
| GET | /api/board | 시즌 랭킹과 누적 곡선. 사용자 토큰 전달 시 개인 기록 포함 |
| POST | /api/analyze-run | 사용자 토큰과 multipart의 image 필드로 날짜·거리·초·분·시간 문자열 분석 |
| POST | /api/runs | 사용자 토큰과 day, km, seconds로 최종 저장 |
| POST | /api/admin-auth | 관리자 비밀번호 인증 |
| GET | /api/results | 관리자 토큰으로 회차별 결과 조회 |
| POST | /api/draw | 관리자 토큰과 count로 현재 회차 추첨 |
| POST | /api/logout | 현재 토큰 폐기. 관리자는 admin을 true로 전달 |

인증된 요청은 Authorization 헤더에 Bearer 토큰을 전달합니다. 정상 응답은 JSON이며 중복 등록은 HTTP 409를 반환합니다.

## 검증 및 빌드
```sh
npm test
npm run check
npm run build
npm start
```

## 운영 및 데이터베이스 전환
SQLite로 운영하려면 Next.js Node 서버와 지속성 있는 데이터 볼륨을 함께 사용하세요. 정적 파일 호스팅만으로는 API가 실행되지 않습니다. HTTPS를 사용하고 운영 키는 서버 환경변수로 설정하세요. 다중 인스턴스로 확장할 때는 요청 제한 카운터도 공유 저장소로 이전하세요.

PostgreSQL 또는 Supabase로 이전할 때는 schema.prisma의 datasource provider를 postgresql로 바꾸고 DATABASE_URL을 해당 DB 연결 문자열로 지정합니다. 새 DB에 맞는 Prisma 마이그레이션을 만들고 SQLite의 사용자·시즌·기록을 관계 키 순서로 이관하세요. DB 파일이나 기존 SQLite 전용 마이그레이션은 재사용하지 않습니다. Prisma Client를 다시 생성하고 중복 제약·회차 집계·권한 동작을 확인한 뒤 전환하세요.

