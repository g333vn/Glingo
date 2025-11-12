# 📚 Hướng Dẫn Git Cơ Bản Cho Người Mới

## 🎯 Tổng quan

Git là hệ thống quản lý phiên bản (version control) giúp bạn:
- **Lưu trữ** lịch sử thay đổi code
- **Khôi phục** code về phiên bản cũ nếu có lỗi
- **Làm việc nhóm** mà không bị xung đột
- **Backup** code an toàn

## 🚀 Cài đặt Git

### Windows
1. Tải Git từ: https://git-scm.com/download/win
2. Cài đặt với các tùy chọn mặc định
3. Mở **Git Bash** hoặc **Command Prompt**

### Kiểm tra cài đặt
```bash
git --version
```
Nếu hiển thị version (ví dụ: `git version 2.40.0`) là đã cài đặt thành công!

## ⚙️ Cấu hình lần đầu

### 1. Cấu hình tên và email
```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

**Ví dụ:**
```bash
git config --global user.name "Nguyen Van A"
git config --global user.email "nguyenvana@gmail.com"
```

### 2. Kiểm tra cấu hình
```bash
git config --list
```

## 📂 Các khái niệm cơ bản

### Repository (Repo)
- Là **thư mục dự án** được Git quản lý
- Chứa tất cả code và lịch sử thay đổi

### Commit
- Là **bản ghi** một thay đổi trong code
- Giống như "chụp ảnh" trạng thái code tại thời điểm đó
- Mỗi commit có **message** mô tả thay đổi

### Branch (Nhánh)
- Là **phiên bản song song** của code
- `main` (hoặc `master`) là nhánh chính
- Có thể tạo nhánh mới để thử nghiệm mà không ảnh hưởng code chính

## 🔄 Workflow cơ bản

### 1. Kiểm tra trạng thái
```bash
git status
```
- Xem file nào đã thay đổi
- File nào chưa được thêm vào Git

### 2. Thêm file vào staging area
```bash
# Thêm tất cả file đã thay đổi
git add .

# Hoặc thêm file cụ thể
git add src/pages/HomePage.jsx
```

### 3. Commit (Lưu thay đổi)
```bash
git commit -m "Mô tả thay đổi"
```

**Ví dụ:**
```bash
git commit -m "Thêm tính năng đăng nhập"
git commit -m "Sửa lỗi responsive trên mobile"
git commit -m "Cập nhật tài liệu"
```

### 4. Xem lịch sử commit
```bash
git log
```
- Nhấn `q` để thoát

### 5. Xem lịch sử ngắn gọn
```bash
git log --oneline
```

## 📋 Các lệnh thường dùng

### Xem thay đổi
```bash
# Xem file nào đã thay đổi
git status

# Xem chi tiết thay đổi
git diff

# Xem thay đổi của file cụ thể
git diff src/pages/HomePage.jsx
```

### Hoàn tác (Undo)

#### 1. Bỏ thay đổi chưa commit
```bash
# Bỏ thay đổi của file cụ thể
git checkout -- src/pages/HomePage.jsx

# Bỏ tất cả thay đổi chưa commit
git checkout -- .
```

#### 2. Bỏ file đã add vào staging
```bash
git reset HEAD src/pages/HomePage.jsx
```

#### 3. Sửa commit message (nếu chưa push)
```bash
git commit --amend -m "Message mới"
```

### Xem thông tin
```bash
# Xem tất cả branch
git branch

# Xem remote repository
git remote -v

# Xem commit gần nhất
git log -1
```

## 🌿 Làm việc với Branch

### Tạo branch mới
```bash
git branch ten-branch-moi
```

### Chuyển sang branch
```bash
git checkout ten-branch-moi
```

### Tạo và chuyển sang branch mới (1 lệnh)
```bash
git checkout -b ten-branch-moi
```

### Xóa branch
```bash
git branch -d ten-branch-moi
```

### Xem tất cả branch
```bash
git branch -a
```

## 🔗 Làm việc với Remote (GitHub/GitLab)

### Clone repository
```bash
git clone https://github.com/username/repository.git
```

### Thêm remote
```bash
git remote add origin https://github.com/username/repository.git
```

### Push (Đẩy code lên remote)
```bash
# Push lần đầu
git push -u origin main

# Push các lần sau
git push
```

### Pull (Lấy code từ remote)
```bash
git pull
```

### Fetch (Lấy thông tin từ remote, không merge)
```bash
git fetch
```

## ⚠️ Các tình huống thường gặp

### 1. Quên commit message
```bash
# Nếu chưa đóng editor, chỉ cần gõ message và lưu
# Nếu đã commit, sửa bằng:
git commit --amend -m "Message mới"
```

### 2. Commit nhầm file
```bash
# Bỏ file khỏi commit (giữ thay đổi)
git reset --soft HEAD~1
git reset HEAD file-nhaym.jsx
git commit -m "Message đúng"
```

### 3. Muốn quay lại commit cũ
```bash
# Xem lịch sử
git log --oneline

# Quay lại commit cụ thể (chỉ xem, không thay đổi)
git checkout commit-hash

# Quay lại nhánh chính
git checkout main
```

### 4. Xung đột khi merge
```bash
# Git sẽ đánh dấu xung đột trong file
# Mở file và sửa thủ công, sau đó:
git add file-co-xung-dot.jsx
git commit -m "Giải quyết xung đột"
```

## 📝 Quy tắc đặt tên commit message

### Format chuẩn
```
<type>: <subject>

<body>
```

### Types phổ biến
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Format code (không ảnh hưởng logic)
- `refactor`: Refactor code
- `test`: Thêm/sửa test
- `chore`: Công việc bảo trì

### Ví dụ
```bash
git commit -m "feat: Thêm tính năng đăng nhập"
git commit -m "fix: Sửa lỗi responsive trên mobile"
git commit -m "docs: Cập nhật README.md"
git commit -m "refactor: Tối ưu code Quiz Editor"
```

## 🎯 Workflow đề xuất cho dự án

### Hàng ngày
```bash
# 1. Kiểm tra thay đổi
git status

# 2. Xem code đã thay đổi
git diff

# 3. Thêm file vào staging
git add .

# 4. Commit
git commit -m "feat: Mô tả thay đổi"

# 5. Push lên remote (nếu có)
git push
```

### Khi bắt đầu làm việc
```bash
# 1. Lấy code mới nhất
git pull

# 2. Kiểm tra trạng thái
git status
```

### Khi hoàn thành tính năng
```bash
# 1. Kiểm tra tất cả thay đổi
git status
git diff

# 2. Thêm và commit
git add .
git commit -m "feat: Hoàn thành tính năng X"

# 3. Push
git push
```

## 💡 Tips cho người mới

### 1. Commit thường xuyên
- Commit sau mỗi tính năng nhỏ hoàn thành
- Đừng đợi đến khi code hoàn hảo mới commit
- Message rõ ràng để dễ tìm lại sau này

### 2. Kiểm tra trước khi commit
```bash
git status
git diff
```
- Đảm bảo chỉ commit những gì cần thiết
- Tránh commit file tạm, file log, node_modules

### 3. Sử dụng .gitignore
- File `.gitignore` chứa danh sách file/folder không cần commit
- Ví dụ: `node_modules/`, `.env`, `dist/`

### 4. Backup thường xuyên
```bash
git push
```
- Push code lên remote để backup
- Không bao giờ mất code nếu có remote

### 5. Đọc lỗi cẩn thận
- Git thường đưa ra gợi ý khi có lỗi
- Đọc kỹ thông báo lỗi trước khi hỏi

## 🆘 Khi gặp lỗi

### "fatal: not a git repository"
- **Nguyên nhân**: Không ở trong thư mục Git
- **Giải pháp**: `cd` vào thư mục dự án

### "fatal: pathspec did not match any files"
- **Nguyên nhân**: File không tồn tại hoặc chưa được tạo
- **Giải pháp**: Kiểm tra đường dẫn file

### "error: failed to push"
- **Nguyên nhân**: Remote có code mới hơn
- **Giải pháp**: 
```bash
git pull
# Giải quyết xung đột nếu có
git push
```

### "Please tell me who you are"
- **Nguyên nhân**: Chưa cấu hình user.name và user.email
- **Giải pháp**: 
```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

## 📚 Tài liệu tham khảo

- **Git Official**: https://git-scm.com/doc
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Learn Git**: https://learngitbranching.js.org/

## 🎓 Bài tập thực hành

### Bài 1: Commit đầu tiên
```bash
# 1. Tạo file mới
echo "Hello Git" > test.txt

# 2. Thêm vào Git
git add test.txt

# 3. Commit
git commit -m "feat: Thêm file test.txt"

# 4. Xem lịch sử
git log --oneline
```

### Bài 2: Sửa và commit
```bash
# 1. Sửa file
echo "Hello Git - Updated" > test.txt

# 2. Xem thay đổi
git diff test.txt

# 3. Commit
git add test.txt
git commit -m "fix: Cập nhật nội dung test.txt"
```

### Bài 3: Xem lịch sử
```bash
# 1. Xem tất cả commit
git log

# 2. Xem commit ngắn gọn
git log --oneline

# 3. Xem thay đổi của commit cụ thể
git show HEAD
```

---

## ✅ Checklist cho người mới

- [ ] Đã cài đặt Git
- [ ] Đã cấu hình user.name và user.email
- [ ] Biết cách `git status`
- [ ] Biết cách `git add .`
- [ ] Biết cách `git commit -m "message"`
- [ ] Biết cách `git log`
- [ ] Biết cách `git push` và `git pull`
- [ ] Đã đọc và hiểu workflow cơ bản

---

**Chúc bạn thành công với Git! 🚀**

Nếu có thắc mắc, hãy thử lệnh `git help <command>` để xem hướng dẫn chi tiết.

