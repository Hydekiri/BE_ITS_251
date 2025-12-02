docker exec -i be-db-1 psql -U its -d its_db < src/config/data.sql
docker exec -i be-db-1 psql -U its -d its_db -c "COPY (SELECT id, username, email, full_name, phone_number, address, created_at FROM users) TO STDOUT WITH CSV HEADER" > .\users.csv
docker exec -i be-db-1 psql -U its -d its_db -A -t -F "," -c "SELECT id, username, email, full_name, phone_number, address, created_at FROM users;" > .\users.txt
docker compose logs --tail 200 app
docker compose logs --follow app
docker ps
docker exec -it be-db-1 psql -U its -d its_db
 # BE_ITS_251 — Backend

 Ngắn gọn: project NestJS + TypeORM + Postgres. README này hướng dẫn cách chạy, cấu hình môi trường, và định nghĩa API chính (Authentication, User, Courses).

 ## Yêu cầu
 - Docker & Docker Compose
 - Node/npm (chỉ để phát triển/local; container dùng Node 20)

 ## Cấu hình môi trường
 Tạo file `.env` ở gốc project (hoặc dùng `env_file` trong `docker-compose.yml`). Ví dụ tối thiểu:

 ```env
 DB_HOST=db
 DB_PORT=5432
 DB_USERNAME=its
 DB_PASSWORD=its_password
 DB_NAME=its_db
 JWT_SECRET=change_this_secret
 PORT=3000
 GEMINI_API_KEY=
 ```

 ## Lệnh Docker (fast start)
 - Build & chạy: `docker compose up --build -d`
 - Chỉ khởi động: `docker compose up -d`
 - Dừng: `docker compose down`

 ## Import schema / seed data
 Chạy (PowerShell / Git Bash):

 ```powershell
 docker exec -i be-db-1 psql -U its -d its_db < src/config/db.sql
 docker exec -i be-db-1 psql -U its -d its_db < src/config/data.sql
 ```

 ## Xuất dữ liệu DB ra file (khuyến nghị)
 - Xuất trực tiếp sang `users.csv` trên máy host:
 ```powershell
 docker exec -i be-db-1 psql -U its -d its_db -c "COPY (SELECT id, username, email, full_name, phone_number, address, created_at FROM users) TO STDOUT WITH CSV HEADER" > .\users.csv
 ```
 - Hoặc xuất sang TXT (mỗi dòng 1 record):
 ```powershell
 docker exec -i be-db-1 psql -U its -d its_db -A -t -F "," -c "SELECT id, username, email, full_name, phone_number, address, created_at FROM users;" > .\users.txt
 ```

 ## Tổng quan Authentication & Authorization
 - Token: JWT (ký bằng `JWT_SECRET`).
 - Refresh token được lưu trong bảng `user_sessions` để hỗ trợ refresh và logout.

 Tất cả endpoint (ngoại trừ `login/register`) yêu cầu header:
 ```
 Authorization: Bearer <accessToken>
 Content-Type: application/json
 ```

 Base URL (development): `http://localhost:3000`

 ---

 ## Authentication (đúng với code hiện tại)

 1) POST /auth/login
 - Mục đích: Đăng nhập
 - Body (JSON):
 ```json
 { "email": "student@example.com", "password": "SecurePassword123", "rememberMe": false }
 ```
 - Response (201 Created):
 ```json
 {
	 "success": true,
	 "data": {
		 "accessToken": "<JWT>",
		 "refreshToken": "<REFRESH>",
		 "expiresIn": 3600,
		 "user": { "id": "...", "email": "...", "fullName": "...", "role": "..." }
	 }
 }
 ```

 2) POST /auth/refresh
 - Mục đích: Làm mới access token bằng refresh token
 - Body:
 ```json
 { "refreshToken": "<REFRESH>" }
 ```
 - Response (200 OK):
 ```json
 { "success": true, "data": { "accessToken": "<JWT>", "expiresIn": 3600 } }
 ```

 3) POST /auth/logout
 - Mục đích: Đăng xuất (vô hiệu hoá refresh token)
 - Headers: `Authorization: Bearer <accessToken>`
 - Body:
 ```json
 { "refreshToken": "<REFRESH>" }
 ```
 - Response (200 OK):
 ```json
 { "success": true, "message": "Đăng xuất thành công" }
 ```

 4) POST /auth/register
 - Mục đích: Tạo user (legacy kept). Repo cũng có `/users/register` (nên dùng endpoint ở `users` module).

 ---

 ## Users API (điều khiển trong `src/modules/users/controllers/users.controller.ts`)

 1) GET /users
 - Mục đích: Lấy danh sách user (chỉ để dev; không phân trang ở hiện tại)
 - Response: `User[]` (toàn bộ đối tượng user từ DB, không kèm mật khẩu)

 2) GET /users/:id
 - Mục đích: Lấy user theo `id`
 - Header: `Authorization: Bearer <token>`
 - Response (success): user object (không có password)

 3) POST /users
 - Mục đích: Tạo user (thô; dùng DTO `CreateUserDto`)
 - Body: tuỳ DTO (thông thường username, email, password...)
 - Response: created user entity (đã hash password if service handles it)

 4) POST /users/register
 - Mục đích: Đăng ký người dùng (học sinh/giáo viên)
 - Body (JSON):
 ```json
 {
	 "email": "newuser@example.com",
	 "password": "SecurePass123",
	 "passwordConfirm": "SecurePass123",
	 "fullName": "Trần Thị B",
	 "role": "student",
	 "classLevel": "grade_10",
	 "dateOfBirth": "2008-05-15",
	 "gender": "female",
	 "phoneNumber": "+84987654321"
 }
 ```
 - Behavior (as implemented):
	 - Server checks `password === passwordConfirm`.
	 - If email already exists, returns `{ success: false, message: 'Email already exists' }`.
	 - On success returns:
 ```json
 {
	 "success": true,
	 "data": { "id": "...", "email": "...", "fullName": "...", "role": "...", "createdAt": "..." },
	 "message": "Đăng ký thành công. Vui lòng kiểm tra email xác nhận."
 }
 ```

 5) GET /users/profile
 - Mục đích: Lấy profile user hiện tại
 - Header: `Authorization: Bearer <token>`
 - Response (success):
 ```json
 {
	 "success": true,
	 "data": {
		 "id": "...",
		 "email": "...",
		 "fullName": "...",
		 "avatarUrl": null,
		 "role": "student",
		 "status": "active",
		 "phoneNumber": "...",
		 "dateOfBirth": null,
		 "gender": null,
		 "address": "...",
		 "profile": {},
		 "createdAt": "...",
		 "updatedAt": "..."
	 }
 }
 ```

 6) PATCH /users/profile
 - Mục đích: Cập nhật profile của user hiện tại
 - Header: `Authorization: Bearer <token>`
 - Body (partial): ví dụ `{ "fullName": "New Name", "phoneNumber": "+849...", "avatarUrl": "..." }`
 - Response (success):
 ```json
 { "success": true, "data": { "id":"...", "fullName":"...", "phoneNumber":"...", "avatarUrl":null, "updatedAt":"..." }, "message":"Cập nhật hồ sơ thành công" }
 ```

 7) PATCH /users/password
 - Mục đích: Đổi mật khẩu
 - Header: `Authorization: Bearer <token>`
 - Body:
 ```json
 { "currentPassword": "OldPass123", "newPassword": "NewPass456", "confirmPassword": "NewPass456" }
 ```
 - Response (success): `{ "success": true, "message": "Mật khẩu đã được thay đổi thành công" }`.

 8) POST /users/forgot-password
 - Mục đích: Tạo token đặt lại mật khẩu (hiện chưa gửi email tự động)
 - Body: `{ "email": "user@example.com" }`
 - Response: `{ "success": true, "message": "Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra trong vòng 24 giờ." }`

 9) POST /users/reset-password
 - Mục đích: Đặt lại mật khẩu bằng token
 - Body:
 ```json
 { "resetToken": "<TOKEN>", "newPassword": "NewPass789", "confirmPassword": "NewPass789" }
 ```
 - Response (success): `{ "success": true, "message": "Mật khẩu đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới." }`

 ---

 ## Courses API (`src/modules/courses`)

 1) GET /courses
 - Mục đích: Lấy danh sách khóa học
 - Query params supported:
	 - `page` (number, default 1)
	 - `limit` (number, default 10)
	 - `subject` (string)
	 - `status` (string)
	 - `classLevel` (string)
	 - `search` (string, searches title)
	 - `sortBy` (field name, default `createdAt`)
	 - `order` (`asc` | `desc`, default `desc`)
 - Response (success):
 ```json
 {
	 "success": true,
	 "data": {
		 "courses": [ /* array of Course entities */ ],
		 "pagination": { "currentPage": 1, "totalPages": 10, "totalItems": 95, "limit": 10 }
	 }
 }
 ```

 2) GET /courses/:id
 - Mục đích: Lấy chi tiết một khóa học kèm modules & lessons
 - Response (success): `{ "success": true, "data": { /* course with relations */ } }`

 3) POST /courses
 - Mục đích: Tạo khóa học mới (chỉ teacher)
 - Header: `Authorization: Bearer <token>` (token phải chứa `role: 'teacher'` trong payload)
 - Body (CreateCourseDto): ví dụ
 ```json
 { "title": "Hoá Học Cơ Bản Lớp 10", "description": "...", "subjectId": "subject-chemistry-001", "classLevel": "grade_10", "status": "draft", "thumbnailUrl": "..." }
 ```
 - Response (success):
 ```json
 { "success": true, "data": { /* created course */ }, "message": "Khóa học đã được tạo thành công" }
 ```

 4) POST /courses/:id/enroll
 - Mục đích: Học sinh đăng ký khóa học
 - Header: `Authorization: Bearer <token>`
 - Body: `{ "enrollmentNotes": "..." }` (optional)
 - Response (201):
 ```json
 {
	 "success": true,
	 "data": {
		 "enrollmentId": "...",
		 "courseId": "...",
		 "studentId": "...",
		 "enrollmentStatus": "active",
		 "enrolledAt": "...",
		 "progressPercentage": 0
	 },
	 "message": "Đã đăng ký khóa học thành công"
 }
 ```

 5) GET /courses/:courseId/modules/:moduleId/lessons
 - Mục đích: Lấy bài học trong module
 - Query: `page`, `limit`
 - Response (success):
 ```json
 { "success": true, "data": { "moduleId": "...", "moduleName": null, "lessons": [ /* lessons */ ], "pagination": { "currentPage":1, "totalPages":1, "totalItems":5 } } }
 ```

 ---

 ## Examples (PowerShell / curl)

 # Login (get access + refresh)
 ```powershell
 curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"newuser@example.com","password":"SecurePass123","rememberMe":false}'
 ```

 # Refresh
 ```powershell
 curl -X POST http://localhost:3000/auth/refresh -H "Content-Type: application/json" -d '{"refreshToken":"<REFRESH>"}'
 ```

 # Logout
 ```powershell
 curl -X POST http://localhost:3000/auth/logout -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS>" -d '{"refreshToken":"<REFRESH>"}'
 ```

 # Register (users/register)
 ```powershell
 curl -X POST http://localhost:3000/users/register -H "Content-Type: application/json" -d '{"email":"newuser@example.com","password":"SecurePass123","passwordConfirm":"SecurePass123","fullName":"Trần Thị B","role":"student"}'
 ```

 # List courses
 ```powershell
 curl "http://localhost:3000/courses?page=1&limit=10&subject=To%C3%A1n&status=published"
 ```

 ---

 ## Ghi chú kỹ thuật

 ## Kiểm tra và debug
 ```powershell
 docker compose logs --tail 200 app
 docker compose logs --follow app
 ```
 ```powershell
 docker ps
 docker exec -it be-db-1 psql -U its -d its_db
 # Trong psql: SELECT * FROM users LIMIT 10;
 ```

 ---
 - Thêm route test bảo vệ bằng JWT để kiểm tra nhanh token,
 - Hoặc chạy build và thử các endpoint tự động rồi gửi log.

---

## AI Tutor API (Gia sư AI)

Module: `src/modules/ai-tutor`

1) POST `/ai-tutor/chat`
- Mục đích: Giao tiếp với gia sư AI (chatbot)
- Khi nào sử dụng: Học sinh gửi câu hỏi cần giúp đỡ
- Body (JSON):
```json
{
	"question": "Làm sao để giải phương trình 2x + 5 = 13?",
	"contextType": "lesson",
	"contextId": "lesson-001",
	"topic": "Phương Trình Bậc Nhất",
	"conversationHistory": [
		{ "role": "user", "content": "AI là gì?" },
		{ "role": "assistant", "content": "AI (Trí Tuệ Nhân Tạo) là..." }
	]
}
```
- Xử lý (Async - gọi Gemini API):
	1. Backend nhận câu hỏi
	2. Xác thực user có quyền hỏi (theo `contextId`)
	3. Xây dựng prompt với `context` + `conversationHistory`
	4. Gọi Gemini API (qua `AiService`) với system prompt giáo dục
	5. Parse kết quả
	6. Lưu interaction vào `ai_interactions`
	7. Ghi nhận vào `ai_tutor_responses` (cache)
	8. Trả về phản hồi
- Response (200 OK) (Thường mất 3-5 giây):
```json
{
	"success": true,
	"data": {
		"interactionId": "interact-001",
		"question": "Làm sao để giải phương trình 2x + 5 = 13?",
		"response": "Để giải phương trình này, ta thực hiện các bước sau:\n\n1. Chuyển vế: 2x = 13 - 5\n2. Tính toán: 2x = 8\n3. Chia cả hai vế: x = 8/2 = 4\n\nVậy x = 4 là nghiệm của phương trình.\n\nGợi ý: Khi chuyển vế, nhớ đổi dấu!",
		"contextType": "lesson",
		"contextId": "lesson-001",
		"modelUsed": "gemini-1.5-pro",
		"tokensUsed": 287,
		"createdAt": "2025-12-02T15:20:00Z"
	}
}
```

2) GET `/ai-tutor/conversations`
- Mục đích: Lấy lịch sử hội thoại với gia sư AI
- Khi nào sử dụng: Hiển thị lịch sử trò chuyện
- Tham số (Query): `page`, `limit`, `contextType`, `contextId`
- Ví dụ: `GET /ai-tutor/conversations?page=1&limit=20&contextType=lesson&contextId=lesson-001`
- Response (200 OK):
```json
{
	"success": true,
	"data": {
		"conversations": [
			{
				"id": "interact-001",
				"question": "Làm sao để giải phương trình 2x + 5 = 13?",
				"response": "Để giải phương trình này...",
				"contextType": "lesson",
				"topic": "Phương Trình Bậc Nhất",
				"isHelpful": null,
				"rating": null,
				"createdAt": "2025-12-02T15:20:00Z"
			}
		],
		"pagination": { "currentPage": 1, "totalPages": 1, "totalItems": 1 }
	}
}
```

3) POST `/ai-tutor/interactions/:interactionId/feedback`
- Mục đích: Gửi phản hồi về chất lượng câu trả lời của AI
- Khi nào sử dụng: Học sinh đánh giá câu trả lời (helpful/not helpful, rating)
- Body (JSON):
```json
{
	"isHelpful": true,
	"rating": 5,
	"comment": "Rất hữu ích! Giải thích rõ ràng và dễ hiểu"
}
```
- Response (200 OK):
```json
{
	"success": true,
	"data": {
		"interactionId": "interact-001",
		"isHelpful": true,
		"rating": 5,
		"comment": "Rất hữu ích! Giải thích rõ ràng và dễ hiểu",
		"updatedAt": "2025-12-02T15:22:00Z"
	},
	"message": "Cảm ơn phản hồi của bạn"
}
```

---

Ghi chú nhanh:
- `AiTutorModule` dùng `AiService` hiện có; nếu bạn đặt `GEMINI_API_KEY` trong `.env` backend sẽ gọi API thực, ngược lại service trả stub tạm thời.
- Controller hiện lấy `userId` từ `req.user` (nếu dùng JWT Guard) hoặc từ header `x-user-id` để tiện test.
- Tạo bảng DB: nếu TypeORM không tạo tự động, chạy SQL tạo `ai_interactions` và `ai_tutor_responses` (tôi có thể tạo migration SQL nếu bạn muốn).


 Chọn hành động tiếp theo.


## Assessment API (Bài tập & Kiểm tra)

Dưới đây là định nghĩa các endpoint cho hệ thống bài tập và kiểm tra (exercises & exams). Các endpoint này đã được hiện thực trong `src/modules/assessments`.

1) GET `/exercises`
- Mục đích: Lấy danh sách bài tập của học sinh (cả bài được giao và đang làm/đã nộp)
- Tham số (Query): `page`, `limit`, `status`, `courseId`, `sortBy`, `order`, `search`
- Ví dụ: `GET /exercises?page=1&limit=10&status=assigned&courseId=course-001&sortBy=dueDate`
- Response (200):
```json
{
	"success": true,
	"data": {
		"exercises": [
			{
				"id": "exercise-001",
				"title": "Bài Tập Phương Trình Bậc Nhất",
				"description": "Giải 10 phương trình cơ bản",
				"courseId": "course-001",
				"moduleId": "module-001",
				"difficultyLevel": "intermediate",
				"numQuestions": 10,
				"timeLimit": 45,
				"status": "assigned",
				"dueDate": "2025-12-10T23:59:59Z",
				"assignedAt": "2025-12-02T14:00:00Z",
				"generatedBy": "ai_generator",
				"isStarted": false,
				"progressPercentage": 0
			}
		],
		"pagination": { "currentPage": 1, "totalPages": 3, "totalItems": 28 }
	}
}
```

2) POST `/exercises/generate`
- Mục đích: Tạo bài tập tự động bằng AI (backend gọi Gemini qua `AiService`)
- Khi nào sử dụng: Học sinh yêu cầu tạo bài tập cá nhân; giáo viên sinh đề cho lớp
- Body (JSON):
```json
{
	"courseId": "course-001",
	"moduleId": "module-001",
	"topic": "Phương Trình Bậc Nhất",
	"subtopic": "Giải và Biện Luận",
	"numQuestions": 10,
	"difficultyLevel": "intermediate",
	"questionTypes": ["multiple_choice", "short_answer"],
	"timeLimit": 45,
	"prompt": "Tạo 10 câu hỏi về phương trình bậc nhất..."
}
```
- Xử lý (Async, có thể mất vài giây):
	1. Backend validate params
	2. Gọi Gemini (qua `AiService`)
	3. Parse kết quả, lưu vào `question_bank` (hoặc `exercise_questions`)
	4. Tạo `exercises` + `exercise_questions`
	5. Trả về thông tin bài tập
- Response (201 Created):
```json
{
	"success": true,
	"data": {
		"exerciseId": "exercise-new-001",
		"title": "Bài Tập Phương Trình Bậc Nhất (AI Generated)",
		"numQuestions": 10,
		"questions": [
			{
				"id": "q-001",
				"questionText": "Giải phương trình: 2x + 5 = 13",
				"questionType": "multiple_choice",
				"options": { "A": "x = 4", "B": "x = 3", "C": "x = 5", "D": "x = 6" },
				"correctAnswer": "A",
				"explanation": "2x + 5 = 13 => 2x = 8 => x = 4"
			}
		],
		"status": "assigned",
		"createdAt": "2025-12-02T14:50:00Z"
	},
	"message": "Bài tập đã được tạo thành công"
}
```

3) GET `/exercises/:exerciseId`
- Mục đích: Lấy chi tiết bài tập (để học sinh làm bài)
- Ví dụ: `GET /exercises/exercise-001`
- Response (200):
```json
{
	"success": true,
	"data": {
		"id": "exercise-001",
		"title": "Bài Tập Phương Trình Bậc Nhất",
		"description": "Giải 10 phương trình cơ bản",
		"numQuestions": 10,
		"timeLimit": 45,
		"status": "assigned",
		"dueDate": "2025-12-10T23:59:59Z",
		"questions": [
			{
				"id": "q-001",
				"sequenceOrder": 1,
				"questionText": "Giải phương trình: 2x + 5 = 13",
				"questionType": "multiple_choice",
				"pointsPossible": 1,
				"options": { "A": "x = 4", "B": "x = 3", "C": "x = 5", "D": "x = 6" }
			}
		]
	}
}
```

4) POST `/exercises/:exerciseId/submit`
- Mục đích: Nộp bài tập (học sinh nộp toàn bộ câu trả lời)
- Ví dụ path: `POST /exercises/exercise-001/submit`
- Body (JSON):
```json
{
	"answers": [
		{ "questionId": "q-001", "answerType": "multiple_choice", "selectedOption": "A", "timeSpentSeconds": 120 },
		{ "questionId": "q-002", "answerType": "short_answer", "answerText": "x = 4 ...", "timeSpentSeconds": 180 }
	],
	"totalTimeSpentSeconds": 3600
}
```
- Xử lý (Async):
	- Chấm trắc nghiệm tức thì
	- Gửi câu trả lời tự luận tới Gemini để chấm (hoặc chấm thủ công theo rubric)
	- Tính điểm, tạo feedback, cập nhật `learning_progress` và `learning_analytics`
- Response (200 OK):
```json
{
	"success": true,
	"data": {
		"exerciseId": "exercise-001",
		"submittedAt": "2025-12-02T15:00:00Z",
		"totalPoints": 8.5,
		"pointsPossible": 10,
		"scorePercentage": 85,
		"grade": "A",
		"answers": [
			{ "questionId": "q-001", "isCorrect": true, "pointsEarned": 1, "feedback": "✓ Chính xác!" },
			{ "questionId": "q-002", "isCorrect": true, "pointsEarned": 1, "feedback": "✓ Chính xác!" }
		],
		"summary": { "totalCorrect": 8, "totalWrong": 2, "correctPercentage": 80, "averageTimePerQuestion": 45 }
	},
	"message": "Bài tập đã được chấm. Bạn đạt 8.5/10 điểm (85%)"
}
```

5) POST `/exams/:examId/start`
- Mục đích: Bắt đầu làm bài kiểm tra (tạo session, trả về danh sách câu hỏi đã trộn)
- Ví dụ: `POST /exams/exam-final-001/start`
- Response (200 OK):
```json
{
	"success": true,
	"data": {
		"examId": "exam-final-001",
		"title": "Kiểm Tra Giữa Kỳ Toán Lớp 10",
		"totalQuestions": 30,
		"totalPoints": 100,
		"timeLimit": 90,
		"startedAt": "2025-12-02T15:15:00Z",
		"expiresAt": "2025-12-02T16:45:00Z",
		"shuffleQuestions": true,
		"shuffleOptions": true,
		"questions": [ /* array of question objects */ ]
	}
}
```

6) POST `/exams/:examId/submit`
- Mục đích: Nộp bài kiểm tra (tự động khi hết giờ hoặc khi học sinh bấm nộp)
- Body & xử lý: tương tự `POST /exercises/:id/submit` (gửi answers, chấm tự động và/hoặc qua Gemini)
- Response (200 OK): Tương tự response nộp bài exercise (tổng điểm, feedback, summary)

---

Ghi chú triển khai & an toàn
- Các endpoint tạo và chấm tự động phụ thuộc vào `GEMINI_API_KEY` (đặt trong `.env`).
- Hiện implementation là bản mẫu: AI parsing và grading cần hoàn thiện (structure parsing, rubric-based scoring, điểm số thang điểm chi tiết).
- Token/authorization: controller hiện sử dụng header `Authorization` để xác định `studentId` (giải mã payload); trong thực tế cần verify JWT bằng `jwt.verify` hoặc dùng Guards của NestJS.
- Cơ sở dữ liệu: nếu bạn muốn tạo bảng mới cho `exercises`, `exercise_questions`, `exercise_submissions`, `submission_answers`, hãy tạo migration hoặc bật `synchronize` tạm thời.

Nếu bạn muốn, tôi có thể:
- Sinh file migration SQL cho các bảng assessments,
- Hoàn thiện parser trả về cấu trúc câu hỏi từ Gemini,
- Hoàn thiện flow chấm tự luận bằng Gemini và tích hợp rubric.

Chọn bước tiếp theo bạn muốn tôi làm.

# Authentication API (Đăng ký / Đăng nhập)

Ứng dụng cung cấp hai endpoint chính để quản lý người dùng và xác thực bằng JWT.

Base URL (development): `http://localhost:3000`

- POST `/auth/register`
	- Mục đích: Tạo tài khoản mới.
	- Body (JSON):
		```json
		{
			"username": "huydang",
			"password": "123456",
			"email": "huy@example.com",
			"fullName": "Huy Dang",         // optional, nếu không cung cấp sẽ dùng `username`
			"phone": "+84912345678",
			"address": "Ho Chi Minh City"
		}
		```
	- Response (201 Created): trả về object người dùng (không có mật khẩu):
		```json
		{
			"id": "65d225e1-a546-47f7-a4d7-2f4edf7de480",
			"username": "huydang",
			"fullName": "Huy Dang",
			"email": "huy@example.com",
			"phone": "+84912345678",
			"address": "Ho Chi Minh City"
		}
		```
	- Errors:
		- `400` nếu payload không hợp lệ.
		- `409` nếu email hoặc username đã tồn tại.
		- `500` cho lỗi server/DB (sẽ log chi tiết server-side).

- POST `/auth/login`
	- Mục đích: Xác thực user và trả về token JWT.
	- Body (JSON):
		```json
		{
			"email": "huy@example.com",
			"password": "123456"
		}
		```
	- Response (200 OK):
		```json
		{
			"access_token": "<JWT_TOKEN>",
			"user": {
				 "id": "...",
				 "username": "huydang",
				 "fullName": "Huy Dang",
				 "email": "huy@example.com",
				 "phone": "+84912345678",
				 "address": "Ho Chi Minh City"
			}
		}
		```
	- Errors:
		- `401` nếu email/password không đúng.

Token sử dụng header `Authorization: Bearer <token>` cho các endpoint bảo vệ.

Ví dụ `curl` (PowerShell):

```powershell
# Đăng ký
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"username":"huydang","password":"123456","email":"huy@example.com","fullName":"Huy Dang","phone":"+84912345678","address":"Ho Chi Minh City"}'

# Đăng nhập
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"huy@example.com","password":"123456"}'
```

Sau khi nhận `access_token`, gọi endpoint bảo vệ:

```powershell
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:3000/protected-route
```

## Lệnh thao tác và xuất dữ liệu DB (Postgres trong Docker)

Nếu bạn thấy bảng hiển thị trong terminal lộn xộn, xuất dữ liệu ra file CSV/ TXT sẽ gọn hơn.

- Xuất trực tiếp sang CSV trên máy host (khuyến nghị):
```powershell
docker exec -i be-db-1 psql -U its -d its_db -c "COPY (SELECT id, username, email, full_name, phone_number, address, created_at FROM users) TO STDOUT WITH CSV HEADER" > .\users.csv
```

- Tạo file CSV trong container rồi copy về host:
```powershell
docker exec -i be-db-1 psql -U its -d its_db -c "COPY (SELECT id, username, email, full_name, phone_number, address, created_at FROM users) TO '/tmp/users.csv' WITH CSV HEADER;"
docker cp be-db-1:/tmp/users.csv .\users.csv
docker exec -i be-db-1 rm /tmp/users.csv
```

- Xuất dưới dạng TXT (mỗi dòng 1 record, dấu phẩy phân tách):
```powershell
docker exec -i be-db-1 psql -U its -d its_db -A -t -F "," -c "SELECT id, username, email, full_name, phone_number, address, created_at FROM users;" > .\users.txt
```

- Truy vấn nhanh (psql interactive):
```powershell
docker exec -it be-db-1 psql -U its -d its_db
# rồi trong psql: SELECT id, username, email, full_name, phone_number, address, created_at FROM users LIMIT 10;
```

Ghi chú kỹ thuật:
- `ValidationPipe` đã được bật trong server, vì vậy payload thiếu trường bắt buộc sẽ trả `400 Bad Request`.
- Mật khẩu được lưu dạng hash (sử dụng `bcryptjs`).
- JWT ký bằng biến môi trường `JWT_SECRET` (nên đặt trong `.env` hoặc `env_file` của Docker Compose).
- Nếu muốn dùng `npm ci` reproducible build trong Docker, hãy đảm bảo `package-lock.json` được cập nhật trong repo.

Tóm Tắt Luồng Người Dùng


📚 Luồng Học Sinh
1.	Đăng ký (POST /users/register)
2.	Đăng nhập (POST /auth/login)
3.	Xem danh sách khóa học (GET /courses)
4.	Đăng ký khóa học (POST /courses/:id/enroll)
5.	Xem bài học (GET /courses/:id/modules/:mid/lessons)
6.	Làm bài tập (GET /exercises/:id → POST /exercises/:id/submit)
7.	Chat AI (POST /ai-tutor/chat)


👨‍🏫 Luồng Giáo Viên
1.	Đăng ký/Đăng nhập
2.	Tạo khóa học (POST /courses)
3.	Tạo module/bài học
4.	Sinh bài tập (POST /exercises/generate)
5.	Tạo đề thi (POST /exams)
