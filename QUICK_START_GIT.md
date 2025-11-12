# ⚡ Quick Start: Setup Git Trong 5 Phút

## 🔍 Tình Trạng Hiện Tại

Project của bạn **CHƯA CÓ Git** hoặc Git chưa được cài đặt.

---

## 📥 BƯỚC 1: Cài Git (3 phút)

### Windows:

1. **Download Git:**
   - Vào: https://git-scm.com/download/win
   - Click "Download for Windows"
   - File sẽ tên: `Git-2.x.x-64-bit.exe`

2. **Cài Đặt:**
   - Chạy file vừa download
   - **Next** → **Next** → **Next** (giữ mặc định)
   - Chọn "Use Visual Studio Code as Git's default editor" (nếu có)
   - **Install** → Đợi cài xong → **Finish**

3. **Khởi Động Lại:**
   - Đóng VS Code/Cursor
   - Mở lại VS Code/Cursor
   - Mở Terminal (Ctrl + `)

4. **Test:**
   ```bash
   git --version
   ```
   Nếu thấy `git version 2.x.x` → ✅ Thành công!

---

## 🚀 BƯỚC 2: Khởi Tạo Git Cho Project (2 phút)

### Trong Terminal của VS Code/Cursor:

1. **Mở Terminal:**
   - Nhấn `Ctrl + `` (dấu backtick)
   - Hoặc: Menu → Terminal → New Terminal

2. **Kiểm Tra Đã Ở Đúng Thư Mục:**
   ```bash
   pwd
   # Hoặc trên Windows:
   cd
   ```
   Phải thấy: `E:\Projects\elearning - cur`

3. **Khởi Tạo Git:**
   ```bash
   git init
   ```

4. **Setup Tên & Email (Chỉ Làm 1 Lần):**
   ```bash
   git config --global user.name "Tên Của Bạn"
   git config --global user.email "email@example.com"
   ```
   Ví dụ:
   ```bash
   git config --global user.name "Hoang Giang"
   git config --global user.email "letranhoanggiangqb@gmail.com"
   ```

5. **Commit Lần Đầu:**
   ```bash
   git add .
   git commit -m "Initial commit - Project setup"
   ```

✅ **Xong! Git đã sẵn sàng!**

---

## 📋 BƯỚC 3: Commit Code Thường Xuyên

### Mỗi Khi Làm Xong 1 Việc:

```bash
# 1. Xem thay đổi
git status

# 2. Thêm tất cả file
git add .

# 3. Commit với message
git commit -m "Mô tả ngắn gọn những gì đã làm"
```

### Ví Dụ:

```bash
git add .
git commit -m "Fix responsive cho mobile"

git add .
git commit -m "Thêm tooltip cho nút TRA TỪ"

git add .
git commit -m "Sửa lỗi email bị cắt trên About page"
```

---

## 🔍 Xem Lại Commit

```bash
# Xem danh sách commit
git log --oneline

# Xem chi tiết 1 commit
git show
```

---

## 🔄 Quay Lại Version Cũ (Nếu Làm Hỏng)

```bash
# 1. Xem danh sách commit
git log --oneline

# 2. Ghi nhớ mã commit (ví dụ: abc123d)

# 3. Quay lại
git reset --hard abc123d
```

⚠️ **Cẩn thận**: `reset --hard` sẽ xóa mọi thay đổi chưa commit!

---

## ✅ Checklist Hôm Nay

- [ ] Cài Git từ https://git-scm.com/download/win
- [ ] Khởi động lại VS Code/Cursor
- [ ] Chạy `git init` trong project
- [ ] Setup tên và email
- [ ] Commit lần đầu: `git add .` → `git commit -m "Initial commit"`
- [ ] Test: `git log --oneline`

---

## 🆘 Gặp Vấn Đề?

### "git is not recognized"
→ Git chưa cài hoặc chưa khởi động lại VS Code
→ Giải pháp: Cài Git, khởi động lại VS Code

### "fatal: not a git repository"
→ Chưa chạy `git init`
→ Giải pháp: Chạy `git init` trong thư mục project

### "Please tell me who you are"
→ Chưa setup tên/email
→ Giải pháp: Chạy 2 lệnh `git config --global` ở trên

---

## 🎯 Tóm Tắt: 3 Lệnh Quan Trọng

```bash
# 1. Xem trạng thái
git status

# 2. Commit code
git add .
git commit -m "Mô tả ngắn gọn"

# 3. Xem lịch sử
git log --oneline
```

**Làm 3 lệnh này thường xuyên là đủ!** 🚀

---

**Bắt đầu ngay:** Cài Git và chạy `git init`! 💪

