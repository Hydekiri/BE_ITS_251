Đã thêm explanation vào result page. Tuy nhiên file bị lỗi khi edit, cần restore và edit lại.

## Tóm tắt yêu cầu:

### 1. ✅ Result Page - Hiển thị Correct Answer và Explanation
- Đã có hiển thị correct answer
- Cần thêm explanation từ AI (nếu có)

### 2. ✅ Quiz mới gen nằm trong "Your Assessment"  
- Logic đã có: `newAssessments` = quiz không có savedProgress
- Backend đã lưu quiz với status "in_progress"
- Frontend fetch từ `/exercises` và hiển thị

### 3. ✅ Pause → Chuyển sang "Continue Assessment"
- Logic đã có: `inProgressAssessments` = quiz có savedProgress
- Khi click Pause → save `savedProgress-${exerciseId}` vào localStorage
- Page reload → quiz tự động chuyển từ "Your Assessment" sang "Continue Assessment"

## Workflow hiện tại:
1. Gen quiz → Lưu DB →  Backend trả exerciseId
2. Frontend reload → Fetch exercises → Hiển thị trong "Your Assessment"
3. Click "Start Now" → Làm quiz
4. Click "Pause" → Lưu progress → Redirect về /assessment
5. Quiz tự động xuất hiện trong "Continue Assessment" vì có savedProgress

## Vấn đề cần fix:
1. **Result page**: Cần thêm explanation display (file bị lỗi khi edit)
2. **Explanation từ AI**: Cần đảm bảo AI response có field "explanation"

Hãy test workflow và báo kết quả!
