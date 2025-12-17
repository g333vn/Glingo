# 📚 Glingo - Japanese Learning Platform

> Nền tảng học tiếng Nhật và luyện thi JLPT

🌐 **Live:** https://glingo.vercel.app

---

## ✨ Tính năng

| Module | Mô tả |
|--------|-------|
| **Level** | Học theo sách N1-N5, quiz theo chapter |
| **JLPT** | Đề thi thực tế: Kiến thức, Đọc hiểu, Nghe hiểu |
| **Dashboard** | Theo dõi tiến độ học tập |
| **Admin** | Quản lý content, users, đề thi |

---

## 🚀 Cài đặt

```bash
# Clone
git clone <repository-url>
cd elearning

# Install
npm install

# Dev
npm run dev
npm run dev -- --host

# Build
npm run build
```

---

## 🛠️ Tech Stack

| | |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Vite |
| **Backend** | Supabase (Auth, Database, Storage) |
| **Deploy** | Vercel |
| **Analytics** | Google Analytics, Vercel Analytics |

---

## 📁 Cấu trúc

```
src/
├── components/     # UI components
├── contexts/       # React contexts (Auth, Language)
├── features/       # Level & JLPT modules
├── pages/          # Page components
├── services/       # API services
└── utils/          # Utilities
```

---

## 🔐 Bảo mật

- ✅ Supabase Auth + RLS
- ✅ Role-based access (Admin/Editor/User)
- ✅ Security headers (CSP, HSTS)
- ✅ No sensitive data in F12

---

## 📊 Lighthouse Scores

| Metric | Score |
|--------|-------|
| Performance | 37 |
| Accessibility | 90 |
| Best Practices | 96 |
| SEO | 100 |

---

## 📝 License

MIT License

---

**Happy Learning! 🎓**
