# 🎨 i18n Visual Guide - Thiết Kế Giao Diện

## 🎯 Thiết Kế Cuối Cùng

**Philosophy:** Header/Footer **luôn English** cho vi + en | Content **localized**

---

## 📱 VIETNAMESE (🇻🇳)

### Header
```
┌─────────────────────────────────────────────────────────┐
│ HOME | LEVEL | JLPT | ABOUT ME | 🇻🇳 VN ▼ | Login      │ ← ENGLISH
└─────────────────────────────────────────────────────────┘
```

### Content (Home Page)
```
┌─────────────────────────────────────────────────────────┐
│         Learn Your Approach                             │ ← Brand (Keep)
│         Học tiếng Nhật mọi lúc mọi nơi                  │ ← Vietnamese
│         💚 100% miễn phí 💚                              │ ← Vietnamese
│                                                         │
│  [📚 Bắt đầu học ngay - Start Learning]                │ ← Vietnamese + English
│  [📝 Luyện đề JLPT - Practice JLPT]                    │ ← Vietnamese + English
│                                                         │
│  [My Story →]                                           │ ← English
└─────────────────────────────────────────────────────────┘

Feature Cards:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ JLPT Tests  │ LEVEL System│Quick        │ 24/7 Access │ ← English
│ N1-N5       │Comprehensive│Dictionary   │ Anytime     │ ← English
│             │             │JP-VI-EN     │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Footer
```
┌─────────────────────────────────────────────────────────┐
│ Quick Links              Contact                        │ ← ENGLISH
│ • Home                   letranhoanggiangqb@gmail.com   │ ← ENGLISH
│ • LEVEL System                                          │
│ • JLPT Practice                                         │
│ • About Me                                              │
│                                                         │
│ Non-profit - Community Service                          │ ← ENGLISH
│ [Scroll to Top ⬆️]                                      │ ← ENGLISH
└─────────────────────────────────────────────────────────┘
```

---

## 📱 ENGLISH (🇬🇧)

### Header
```
┌─────────────────────────────────────────────────────────┐
│ HOME | LEVEL | JLPT | ABOUT ME | 🇬🇧 EN ▼ | Login      │ ← ENGLISH
└─────────────────────────────────────────────────────────┘
```

### Content (Home Page)
```
┌─────────────────────────────────────────────────────────┐
│         Learn Your Approach                             │ ← Brand (Keep)
│         Learn Japanese Anytime, Anywhere                │ ← English
│         💚 100% Free 💚                                  │ ← English
│                                                         │
│  [📚 Start Learning - Begin Your Journey]              │ ← English
│  [📝 Practice JLPT - Test Preparation]                 │ ← English
│                                                         │
│  [My Story →]                                           │ ← English
└─────────────────────────────────────────────────────────┘

Feature Cards:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ JLPT Tests  │ LEVEL System│Quick        │ 24/7 Access │ ← English
│ N1-N5       │Comprehensive│Dictionary   │ Anytime     │ ← English
│             │             │JP-VI-EN     │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Footer
```
┌─────────────────────────────────────────────────────────┐
│ Quick Links              Contact                        │ ← ENGLISH
│ • Home                   letranhoanggiangqb@gmail.com   │ ← ENGLISH
│ • LEVEL System                                          │
│ • JLPT Practice                                         │
│ • About Me                                              │
│                                                         │
│ Non-profit - Community Service                          │ ← ENGLISH
│ [Scroll to Top ⬆️]                                      │ ← ENGLISH
└─────────────────────────────────────────────────────────┘
```

---

## 📱 JAPANESE (🇯🇵)

### Header
```
┌─────────────────────────────────────────────────────────┐
│ ホーム | レベル | JLPT | 紹介 | 🇯🇵 JP ▼ | ログイン    │ ← JAPANESE
└─────────────────────────────────────────────────────────┘
```

### Content (Home Page)
```
┌─────────────────────────────────────────────────────────┐
│         Learn Your Approach                             │ ← Brand (Keep)
│         いつでもどこでも日本語学習                        │ ← Japanese
│         💚 100%無料 💚                                   │ ← Japanese
│                                                         │
│  [📚 学習を始める - 今すぐ開始]                         │ ← Japanese
│  [📝 JLPT練習 - 試験対策]                               │ ← Japanese
│                                                         │
│  [マイストーリー →]                                      │ ← Japanese
└─────────────────────────────────────────────────────────┘

Feature Cards:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ JLPTテスト  │レベルシステム│ 辞書検索    │24時間アクセス│ ← Japanese
│ N1-N5       │ 多様        │ 日-越-英    │ いつでも    │ ← Japanese
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Footer
```
┌─────────────────────────────────────────────────────────┐
│ クイックリンク          連絡先                           │ ← JAPANESE
│ • ホーム               letranhoanggiangqb@gmail.com    │ ← JAPANESE
│ • レベルシステム                                         │
│ • JLPT練習                                              │
│ • 紹介                                                  │
│                                                         │
│ 非営利 - コミュニティサービス                            │ ← JAPANESE
│ [トップへ戻る ⬆️]                                        │ ← JAPANESE
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Rationale

### Why This Design?

#### **Vietnamese + English = Same Header/Footer**

✅ **Pros:**
- Professional look
- International brand
- Familiar to tech users
- Easier to maintain (less duplicates)
- Button positions consistent

✅ **Target Audience:**
- Vietnamese users = comfortable with English UI
- English speakers = native
- Both groups expect English navigation in tech apps

#### **Japanese = Full Translation**

✅ **Pros:**
- Full localization for Japanese users
- Immersive experience
- Better comprehension
- Shows respect for language learners

✅ **Target Audience:**
- Japanese native speakers
- Advanced learners wanting full immersion
- Users preferring Japanese interface

---

## 📊 Language Breakdown

### What's Different in Each Language?

| Element | Vietnamese | English | Japanese |
|---------|-----------|---------|----------|
| **Header Menu** | English | English | Japanese |
| **Login/Logout** | English | English | Japanese |
| **Tagline** | Vietnamese | English | Japanese |
| **CTA Buttons** | Vietnamese | English | Japanese |
| **Feature Cards** | English | English | Japanese |
| **Footer Links** | English | English | Japanese |
| **Footer Mission** | English | English | Japanese |

### Translation Keys Distribution

```
Total keys: ~100

Header/Footer (vi = en):   20 keys
Content (vi ≠ en ≠ ja):    80 keys
```

---

## ✅ Current Status

### Migrated Components

1. ✅ **Header** - English for vi+en, Japanese for ja
2. ✅ **HomePage** - Vietnamese/English/Japanese content
3. ✅ **Footer** - English for vi+en, Japanese for ja

### Result

```
Vietnamese: English UI + Vietnamese Content
English:    English UI + English Content  
Japanese:   Japanese UI + Japanese Content
```

---

## 🚀 Test It Now

### Test Cases

#### **Test 1: Vietnamese**
```
1. Select 🇻🇳 Vietnamese
2. Check Header: HOME, LEVEL, JLPT, Login ← English ✅
3. Check Content: "Học tiếng Nhật..." ← Vietnamese ✅
4. Check Footer: Quick Links, Contact ← English ✅
```

#### **Test 2: English**
```
1. Select 🇬🇧 English
2. Check Header: HOME, LEVEL, JLPT, Login ← English ✅
3. Check Content: "Learn Japanese..." ← English ✅
4. Check Footer: Quick Links, Contact ← English ✅
```

#### **Test 3: Japanese**
```
1. Select 🇯🇵 Japanese
2. Check Header: ホーム, レベル, ログイン ← Japanese ✅
3. Check Content: "いつでもどこでも..." ← Japanese ✅
4. Check Footer: クイックリンク, 連絡先 ← Japanese ✅
```

---

## 💡 Summary

### The Design

- **Header/Footer:** Always English (except Japanese)
- **Content:** Localized per language
- **Brand:** "Learn Your Approach" stays English (brand name)

### Why It Works

✅ Consistent navigation  
✅ Professional appearance  
✅ Flexible content  
✅ Best UX for each audience

---

**Test URL:** `http://localhost:5173/`

**Expected:** Header/Footer English cho Vietnamese & English, Content khác nhau! 🎉

