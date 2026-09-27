# Hướng dẫn cập nhật website — không cần học lập trình

## 1. Muốn thay đổi email, LinkedIn hoặc thêm GitHub?

1. Nhấp chuột phải `content.js` > Open with > Notepad (hoặc VS Code).
2. Ngay đầu file tìm `window.PORTFOLIO_CONFIG`.
3. Thay đổi dòng `github: ''` thành `github: 'https://github.com/TEN_TAI_KHOAN_THAT_CUA_BAN'`.
4. Chỉnh email/LinkedIn nếu cần. Giữ nguyên dấu nháy và dấu phẩy như mẫu.
5. Nhấn Ctrl+S và mở lại `index.html` để xem kết quả.

## 2. Đổi văn bản trong từng ngôn ngữ

Trong `content.js`, tìm `window.PORTFOLIO_I18N` có 4 khối:

- `en` — Tiếng Anh.
- `vi` — Tiếng Việt.
- `zh-Hant` — Tiếng Trung phồn thể.
- `zh-Hans` — Tiếng Trung giản thể.

Trong mỗi khối, tìm `heroSummary`, `aboutParagraph`, `experienceData`, `projectData`...
Chỉ sửa phần **giữa hai dấu nháy**, đừng xóa dấu phẩy, dấu ngoặc hoặc tên trường.
Chuyển giữa các ngôn ngữ ở thanh đầu trang sau khi lưu để tự kiểm tra.

## 3. Thay CV nháp bằng CV cuối cùng

Khi CV đã được bạn duyệt, đặt file PDF mới vào `assets/` rồi sửa đường dẫn
`resume` ở đầu `content.js`. Tránh ghi thông tin nhạy cảm lên CV công khai.

## 4. Thêm ảnh chân dung thật

Bản này dùng logo chữ HP cách điệu, **không giả tạo ảnh chân dung**. Nếu muốn
thêm ảnh cá nhân, chuẩn bị ảnh `.jpg/.webp`, gửi lại ảnh và yêu cầu cập nhật
thiết kế hoặc chỉnh vùng `.profile-illustration` trong `index.html`.

## 5. Cập nhật website đã đăng

Trên GitHub > repository > Add file > Upload files > chọn các file mới
(nếu file trùng tên GitHub sẽ yêu cầu xử lý thay thế). Tốt hơn, nếu bạn muốn
sửa trực tiếp một tệp, mở tệp đó trên GitHub > biểu tượng bút chì > Commit.
Khi Vercel đã liên kết đúng nhánh GitHub, bản mới thường được deploy tự động.

## 6. Cách đổi 4 ngôn ngữ

Góc phải thanh menu, chọn `EN`, `VI`, `繁體` hoặc `简体`. Toàn bộ các tiêu đề,
kinh nghiệm, mô tả dự án, chứng chỉ, công cụ, modal dự án và liên hệ sẽ đổi.
Ngôn ngữ và chế độ sáng/tối được lưu trên trình duyệt khi được cho phép.

## 7. Các thông tin bạn cần duyệt

- Tháng bắt đầu Kodai Sangyo không thống nhất giữa hai CV cũ: 07 hay 08/2023.
- Điểm TOEIC 840 trích theo CV cũ; cần xác nhận còn muốn công bố không.
- Global MBA hiện đang theo học; chưa ghi đã tốt nghiệp.
- Chỉ chứng chỉ SQL HackerRank là bài kiểm tra kỹ năng, DataCamp là khóa học.
- Không hiển thị giấy tờ có số cư trú hoặc dữ liệu nội bộ.
- Dự án Netflix được đánh dấu coursework/review, inventory vẫn ở giai đoạn kế hoạch.
