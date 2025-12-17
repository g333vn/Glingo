# 🪟 Hướng Dẫn Setup Windows Task Scheduler

## 🎯 Mục Đích

Tự động chạy backup script mỗi ngày/tuần/tháng mà không cần nhớ chạy thủ công.

---

## 📋 BƯỚC 1: TẠO TASK TỰ ĐỘNG BACKUP HÀNG NGÀY

### **Bước 1.1: Mở Task Scheduler**

1. Nhấn `Win + R`
2. Gõ: `taskschd.msc`
3. Nhấn Enter

Hoặc:
- Tìm "Task Scheduler" trong Start Menu
- Mở "Task Scheduler"

---

### **Bước 1.2: Tạo Basic Task**

1. Click **"Create Basic Task"** (bên phải)
2. Đặt tên: `Elearning Daily Backup`
3. Mô tả: `Tự động tổ chức file backup mỗi ngày`
4. Click **Next**

---

### **Bước 1.3: Chọn Trigger (Khi nào chạy)**

1. Chọn **"Daily"** (mỗi ngày)
2. Click **Next**
3. Đặt thời gian:
   - **Start:** `02:00:00` (2:00 AM - ít ảnh hưởng)
   - **Recur every:** `1 days`
4. Click **Next**

---

### **Bước 1.4: Chọn Action (Làm gì)**

1. Chọn **"Start a program"**
2. Click **Next**
3. Điền thông tin:
   - **Program/script:** `node`
   - **Add arguments:** `E:\Projects\elearning - cur\scripts\auto-backup.cjs`
   - **Start in:** `E:\Projects\elearning - cur`
4. Click **Next**

**Lưu ý:** Thay `E:\Projects\elearning - cur` bằng đường dẫn project của bạn.

---

### **Bước 1.5: Hoàn tất**

1. Xem lại thông tin
2. Đánh dấu **"Open the Properties dialog for this task when I click Finish"**
3. Click **Finish**

---

### **Bước 1.6: Cấu hình nâng cao**

Trong Properties dialog:

1. Tab **General:**
   - ✅ Đánh dấu **"Run whether user is logged on or not"**
   - ✅ Đánh dấu **"Run with highest privileges"** (nếu cần)

2. Tab **Conditions:**
   - ✅ Bỏ đánh dấu **"Start the task only if the computer is on AC power"** (nếu muốn chạy cả khi dùng pin)

3. Tab **Settings:**
   - ✅ Đánh dấu **"Allow task to be run on demand"**
   - ✅ Đánh dấu **"Run task as soon as possible after a scheduled start is missed"**

4. Click **OK**

---

## 📋 BƯỚC 2: TẠO TASK TỰ ĐỘNG CLEANUP HÀNG THÁNG

### **Bước 2.1: Tạo Basic Task mới**

1. Click **"Create Basic Task"**
2. Đặt tên: `Elearning Monthly Cleanup`
3. Mô tả: `Tự động dọn dẹp file backup cũ mỗi tháng`
4. Click **Next**

---

### **Bước 2.2: Chọn Trigger**

1. Chọn **"Monthly"** (mỗi tháng)
2. Click **Next**
3. Đặt:
   - **Start date:** Ngày 1 của tháng
   - **Time:** `02:00:00` (2:00 AM)
   - **Months:** Tất cả các tháng
   - **Days:** Ngày 1
4. Click **Next**

---

### **Bước 2.3: Chọn Action**

1. Chọn **"Start a program"**
2. Click **Next**
3. Điền:
   - **Program/script:** `node`
   - **Add arguments:** `E:\Projects\elearning - cur\scripts\backup-cleanup.cjs`
   - **Start in:** `E:\Projects\elearning - cur`
4. Click **Next** → **Finish**

---

## 📋 BƯỚC 3: KIỂM TRA VÀ TEST

### **Test Task:**

1. Trong Task Scheduler, tìm task vừa tạo
2. Click chuột phải → **Run**
3. Kiểm tra kết quả:
   - Xem log trong `data/backups/auto-backup.log`
   - Kiểm tra file backup có được tổ chức không

---

### **Xem Log:**

```bash
# Xem log tự động backup
cat data/backups/auto-backup.log

# Hoặc mở file trong Notepad
notepad data/backups/auto-backup.log
```

---

## 🎯 CÁC TASK KHUYẾN NGHỊ

### **1. Daily Backup (Hàng ngày)**

- **Tên:** `Elearning Daily Backup`
- **Trigger:** Daily, 2:00 AM
- **Action:** `node scripts/auto-backup.cjs`
- **Mục đích:** Tự động tổ chức file backup mỗi ngày

---

### **2. Weekly Backup (Hàng tuần)**

- **Tên:** `Elearning Weekly Backup`
- **Trigger:** Weekly, Sunday, 2:00 AM
- **Action:** `node scripts/auto-backup.cjs`
- **Mục đích:** Backup định kỳ mỗi tuần

---

### **3. Monthly Cleanup (Hàng tháng)**

- **Tên:** `Elearning Monthly Cleanup`
- **Trigger:** Monthly, Day 1, 2:00 AM
- **Action:** `node scripts/backup-cleanup.cjs`
- **Mục đích:** Dọn dẹp file backup cũ

---

## ⚙️ CẤU HÌNH NÂNG CAO

### **Chạy với quyền Admin:**

1. Mở Properties của task
2. Tab **General**
3. Đánh dấu **"Run with highest privileges"**
4. Click **OK**

---

### **Chạy khi không đăng nhập:**

1. Tab **General**
2. Chọn **"Run whether user is logged on or not"**
3. Nhập password Windows (nếu cần)
4. Click **OK**

---

### **Gửi email khi lỗi:**

1. Tab **Actions**
2. Click **New** → **Send an e-mail**
3. Điền thông tin email
4. Click **OK**

---

## 🐛 TROUBLESHOOTING

### **Task không chạy:**

**Vấn đề:** Task không được trigger

**Giải pháp:**
1. Kiểm tra task có được enable không
2. Kiểm tra trigger có đúng không
3. Kiểm tra quyền (Run with highest privileges)
4. Xem History trong Task Scheduler

---

### **Lỗi "Node is not recognized":**

**Vấn đề:** Windows không tìm thấy `node`

**Giải pháp:**
1. Tìm đường dẫn đầy đủ của node:
   ```powershell
   where.exe node
   ```
2. Dùng đường dẫn đầy đủ trong Program/script:
   ```
   C:\Program Files\nodejs\node.exe
   ```

---

### **Lỗi "Path not found":**

**Vấn đề:** Đường dẫn project không đúng

**Giải pháp:**
1. Kiểm tra đường dẫn project:
   ```powershell
   cd "E:\Projects\elearning - cur"
   pwd
   ```
2. Cập nhật đường dẫn trong task

---

### **Task chạy nhưng không có kết quả:**

**Vấn đề:** Script chạy nhưng không tìm thấy file

**Giải pháp:**
1. Kiểm tra log: `data/backups/auto-backup.log`
2. Kiểm tra có file backup trong Downloads không
3. Test script thủ công:
   ```bash
   npm run backup:auto
   ```

---

## 📝 VÍ DỤ CẤU HÌNH

### **Ví dụ 1: Daily Backup**

```
Task Name: Elearning Daily Backup
Trigger: Daily at 2:00 AM
Action: Start a program
  Program: node
  Arguments: E:\Projects\elearning - cur\scripts\auto-backup.cjs
  Start in: E:\Projects\elearning - cur
```

---

### **Ví dụ 2: Weekly Backup với Cleanup**

```
Task Name: Elearning Weekly Backup
Trigger: Weekly on Sunday at 2:00 AM
Action: Start a program
  Program: node
  Arguments: E:\Projects\elearning - cur\scripts\auto-backup.cjs --cleanup
  Start in: E:\Projects\elearning - cur
```

---

## ✅ CHECKLIST

- [ ] ✅ Đã tạo task Daily Backup
- [ ] ✅ Đã tạo task Monthly Cleanup
- [ ] ✅ Đã test task (Run manually)
- [ ] ✅ Đã kiểm tra log
- [ ] ✅ Đã cấu hình quyền (nếu cần)
- [ ] ✅ Đã hiểu cách hoạt động

---

## 🎯 TÓM TẮT

### **Các bước chính:**

1. ✅ Mở Task Scheduler
2. ✅ Tạo Basic Task
3. ✅ Chọn Trigger (Daily/Weekly/Monthly)
4. ✅ Chọn Action (Start a program)
5. ✅ Cấu hình nâng cao
6. ✅ Test task

### **Kết quả:**

- ✅ Tự động backup mỗi ngày/tuần
- ✅ Tự động dọn dẹp mỗi tháng
- ✅ Không cần nhớ chạy thủ công
- ✅ Log tự động trong `data/backups/auto-backup.log`

---

**Với setup này, bạn có thể tự động hóa 90% quy trình backup!** 🚀✅

