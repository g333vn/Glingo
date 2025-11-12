# 📚 Hướng Dẫn Git Cho Người Mới - Từ A Đến Z

## 🎯 Git Là Gì? Tại Sao Cần?

**Git** = Hệ thống quản lý phiên bản code
- **Backup tự động**: Lưu lại mọi thay đổi
- **Quay lại được**: Nếu làm hỏng, có thể quay về version cũ
- **Làm việc nhóm**: Nhiều người có thể làm cùng lúc
- **An toàn**: Không sợ mất code

**Ví dụ thực tế:**
- Hôm nay code xong, commit
- Ngày mai làm hỏng → quay lại hôm qua
- Hoặc xem lại code hôm qua đã làm gì

---

## ✅ BƯỚC 1: Kiểm Tra Đã Cài Git Chưa

### Cách 1: Dùng Terminal/Command Prompt

**Windows:**
1. Mở **Command Prompt** (gõ `cmd` trong Start Menu)
2. Gõ lệnh:
```bash
git --version
```

**Nếu thấy:** `git version 2.x.x` → ✅ Đã cài rồi!
**Nếu thấy:** `'git' is not recognized` → ❌ Chưa cài, xem bước tiếp theo

### Cách 2: Kiểm Tra Trong VS Code/Cursor

1. Mở Terminal trong VS Code/Cursor (Ctrl + `)
2. Gõ: `git --version`
3. Xem kết quả

---

## 📥 BƯỚC 2: Cài Git (Nếu Chưa Có)

### Windows:
1. Vào: https://git-scm.com/download/win
2. Download và cài đặt (Next → Next → Next, giữ mặc định)
3. Khởi động lại VS Code/Cursor
4. Test lại: `git --version`

### Mac:
```bash
# Mở Terminal, gõ:
brew install git
```

### Linux (Ubuntu):
```bash
sudo apt-get install git
```

---

## 🚀 BƯỚC 3: Khởi Tạo Git Repository (Lần Đầu)

### 3.1. Mở Terminal Trong Project

**Cách 1: Trong VS Code/Cursor**
- Nhấn `Ctrl + `` (dấu backtick, phía trên Tab)
- Hoặc: Menu → Terminal → New Terminal

**Cách 2: Command Prompt**
- Mở Command Prompt
- `cd` vào thư mục project:
```bash
cd "E:\Projects\elearning - cur"
```

### 3.2. Kiểm Tra Đã Có Git Chưa

```bash
# Kiểm tra xem đã init Git chưa
ls -a
# Hoặc trên Windows:
dir /a
```

**Nếu thấy folder `.git`** → ✅ Đã có Git rồi, bỏ qua bước này!
**Nếu không thấy** → Tiếp tục bước 3.3

### 3.3. Khởi Tạo Git (Chỉ Làm 1 Lần)

```bash
git init
```

**Kết quả:** `Initialized empty Git repository in ...`

✅ Xong! Bây giờ Git đã theo dõi project của bạn.

---

## 💾 BƯỚC 4: Commit Code (Lưu Lại Thay Đổi)

### 4.1. Xem Trạng Thái File

```bash
git status
```

**Kết quả sẽ hiển thị:**
- **Untracked files**: File mới, chưa được Git theo dõi
- **Modified**: File đã thay đổi
- **Staged**: File đã sẵn sàng để commit

### 4.2. Thêm File Vào Staging Area

**Thêm TẤT CẢ file:**
```bash
git add .
```

**Hoặc thêm từng file:**
```bash
git add src/components/Header.jsx
git add src/pages/AboutPage.jsx
```

### 4.3. Commit (Lưu Lại)

```bash
git commit -m "Mô tả ngắn gọn những gì đã làm"
```

**Ví dụ:**
```bash
git commit -m "Fix responsive cho mobile và tablet"
git commit -m "Thêm tính năng tra từ dictionary"
git commit -m "Sửa lỗi dropdown menu ở header"
```

**Quy tắc viết message:**
- ✅ Ngắn gọn, rõ ràng
- ✅ Tiếng Việt hoặc tiếng Anh đều được
- ✅ Mô tả ĐÃ LÀM gì, không phải SẼ LÀM

**Ví dụ tốt:**
- ✅ "Fix lỗi email bị cắt trên mobile"
- ✅ "Thêm tooltip cho nút TRA TỪ"
- ✅ "Tách file data theo level"

**Ví dụ xấu:**
- ❌ "Update" (quá mơ hồ)
- ❌ "Fix bug" (không rõ fix gì)
- ❌ "WIP" (work in progress - không nên commit)

---

## 📖 BƯỚC 5: Xem Lại Commit (Lịch Sử)

### 5.1. Xem Danh Sách Commit

```bash
git log
```

**Kết quả:**
```
commit abc123def456... (HEAD -> main)
Author: Your Name <your.email@example.com>
Date:   Mon Nov 12 14:30:00 2024

    Fix responsive cho mobile và tablet

commit 789ghi012jkl...
Author: Your Name
Date:   Sun Nov 11 10:15:00 2024

    Thêm tính năng tra từ dictionary
```

**Thoát khỏi git log:** Nhấn `q` (quit)

### 5.2. Xem Ngắn Gọn Hơn

```bash
git log --oneline
```

**Kết quả:**
```
abc123d Fix responsive cho mobile và tablet
789ghi0 Thêm tính năng tra từ dictionary
456def1 Sửa lỗi dropdown menu
```

### 5.3. Xem Thay Đổi Của 1 Commit

```bash
git show abc123d
```

Sẽ hiển thị:
- Thông tin commit
- File nào đã thay đổi
- Nội dung thay đổi (diff)

---

## 🔄 BƯỚC 6: Quay Lại Version Cũ (Nếu Làm Hỏng)

### 6.1. Xem Danh Sách Commit Trước

```bash
git log --oneline
```

Ghi nhớ mã commit (ví dụ: `abc123d`)

### 6.2. Quay Lại Version Cũ

**Cách 1: Xem Code Cũ (Không Thay Đổi)**
```bash
git checkout abc123d
```

**Cách 2: Quay Lại Hoàn Toàn (Xóa Thay Đổi Mới)**
```bash
git reset --hard abc123d
```

⚠️ **CẨN THẬN**: `reset --hard` sẽ XÓA mọi thay đổi chưa commit!

**Cách 3: Quay Lại Commit Gần Nhất**
```bash
git reset --hard HEAD~1
```
(HEAD~1 = commit trước đó 1 bước)

### 6.3. Quay Lại Branch Chính

Sau khi xem code cũ, quay lại:
```bash
git checkout main
# Hoặc
git checkout master
```

---

## 📋 QUY TRÌNH HÀNG NGÀY (Best Practice)

### Khi Bắt Đầu Làm Việc:

```bash
# 1. Xem code đã thay đổi gì
git status

# 2. Xem lịch sử commit gần đây
git log --oneline -5
```

### Khi Làm Xong 1 Tính Năng Nhỏ:

```bash
# 1. Xem thay đổi
git status

# 2. Thêm file vào staging
git add .

# 3. Commit với message rõ ràng
git commit -m "Mô tả ngắn gọn"

# 4. Xem lại commit vừa tạo
git log --oneline -1
```

### Khi Làm Hỏng Code:

```bash
# 1. Xem commit gần nhất
git log --oneline -5

# 2. Quay lại commit trước đó
git reset --hard HEAD~1

# Hoặc quay lại commit cụ thể
git reset --hard abc123d
```

---

## 🎯 TẦN SUẤT COMMIT (Khi Nào Commit?)

### ✅ Nên Commit Khi:
- ✅ Làm xong 1 tính năng nhỏ (ví dụ: fix 1 lỗi)
- ✅ Làm xong 1 phần (ví dụ: responsive cho 1 trang)
- ✅ Trước khi thử nghiệm điều gì mới (backup trước)
- ✅ Cuối ngày làm việc (backup an toàn)

### ❌ Không Nên Commit Khi:
- ❌ Code đang lỗi, chưa chạy được
- ❌ Chỉ thay đổi 1 dòng comment
- ❌ Đang làm dở, chưa xong

**Nguyên tắc:** Commit khi code **CHẠY ĐƯỢC** và **CÓ Ý NGHĨA**

---

## 🔍 CÁC LỆNH HỮU ÍCH KHÁC

### Xem Thay Đổi Chưa Commit

```bash
git diff
```

### Xem Thay Đổi Của 1 File Cụ Thể

```bash
git diff src/components/Header.jsx
```

### Xem File Nào Đã Thay Đổi

```bash
git status --short
```

### Xóa File Khỏi Git (Nhưng Giữ File)

```bash
git rm --cached file-name.js
```

### Xem Ai Đã Sửa File Này

```bash
git blame src/components/Header.jsx
```

---

## 🛡️ TẠO BACKUP TRƯỚC KHI THAY ĐỔI LỚN

### Trước Khi Làm Gì Đó Rủi Ro:

```bash
# 1. Commit code hiện tại (backup)
git add .
git commit -m "Backup trước khi refactor data structure"

# 2. Tạo branch mới để thử nghiệm
git checkout -b experiment-data-structure

# 3. Làm thay đổi...

# 4a. Nếu OK: Quay lại main và merge
git checkout main
git merge experiment-data-structure

# 4b. Nếu không OK: Xóa branch, quay lại main
git checkout main
git branch -D experiment-data-structure
```

---

## 📝 VÍ DỤ THỰC TẾ: Workflow Hàng Ngày

### Sáng: Bắt Đầu Làm Việc

```bash
# Xem code đã thay đổi gì từ hôm qua
git status
git log --oneline -3
```

### Trong Ngày: Làm Việc

```bash
# Sau khi fix 1 lỗi nhỏ
git add .
git commit -m "Fix lỗi email bị cắt trên mobile"

# Sau khi thêm 1 tính năng
git add .
git commit -m "Thêm tooltip cho nút TRA TỪ"
```

### Tối: Kết Thúc Ngày

```bash
# Commit mọi thay đổi còn lại
git add .
git commit -m "Hoàn thành responsive cho tablet"

# Xem lại tất cả commit hôm nay
git log --oneline --since="today"
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Commit Thường Xuyên
- ✅ Commit mỗi 1-2 giờ làm việc
- ✅ Commit trước khi thử nghiệm điều gì mới
- ✅ Commit cuối ngày

### 2. Message Rõ Ràng
- ✅ Mô tả ngắn gọn, dễ hiểu
- ✅ Tiếng Việt OK, không cần tiếng Anh
- ✅ Nói rõ ĐÃ LÀM gì

### 3. Không Commit Code Lỗi
- ❌ Đừng commit code không chạy được
- ❌ Đừng commit file test/temp
- ✅ Test trước khi commit

### 4. Backup Trước Khi Thay Đổi Lớn
- ✅ Commit trước khi refactor
- ✅ Tạo branch để thử nghiệm
- ✅ Có thể quay lại bất cứ lúc nào

---

## 🎓 BÀI TẬP THỰC HÀNH

### Bài 1: Setup Git (5 phút)
1. Kiểm tra Git đã cài chưa: `git --version`
2. Nếu chưa, cài Git
3. Khởi tạo repo: `git init`
4. Commit lần đầu: `git add .` → `git commit -m "Initial commit"`

### Bài 2: Commit Thường Xuyên (10 phút)
1. Sửa 1 file nhỏ (ví dụ: thêm comment)
2. Xem thay đổi: `git status`
3. Commit: `git add .` → `git commit -m "Thêm comment"`
4. Xem lại: `git log --oneline`

### Bài 3: Quay Lại Version Cũ (10 phút)
1. Xem danh sách commit: `git log --oneline`
2. Ghi nhớ mã commit (ví dụ: `abc123d`)
3. Quay lại: `git checkout abc123d`
4. Xem code cũ
5. Quay lại: `git checkout main`

---

## 🆘 GẶP VẤN ĐỀ?

### Lỗi: "fatal: not a git repository"
→ Chưa init Git, chạy: `git init`

### Lỗi: "Please tell me who you are"
→ Cần setup tên và email:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Lỗi: "nothing to commit"
→ Không có file nào thay đổi, hoặc chưa `git add`

### Muốn Xóa Commit Vừa Tạo (Chưa Push)
```bash
git reset --soft HEAD~1
```
(Code vẫn giữ nguyên, chỉ xóa commit)

---

## 🎉 TÓM TẮT: 3 LỆNH QUAN TRỌNG NHẤT

```bash
# 1. Xem trạng thái
git status

# 2. Thêm file và commit
git add .
git commit -m "Mô tả ngắn gọn"

# 3. Xem lịch sử
git log --oneline
```

**Làm 3 lệnh này thường xuyên là đủ cho người mới!** 🚀

---

## 📚 TÀI LIỆU THAM KHẢO

- **Git Official**: https://git-scm.com/doc
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Visual Git Guide**: https://learngitbranching.js.org/

---

**Bắt đầu ngay:** Chạy `git status` để xem project hiện tại như thế nào! 💪


