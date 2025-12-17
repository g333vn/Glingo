# 🎨 NEO BRUTALISM DESIGN GUIDE

## 📐 Design System Chuẩn cho Admin & Editor Panels

### 🎯 Core Principles

1. **Bold Borders** - `border-[3px]` hoặc `border-[4px]` với `border-black`
2. **Hard Shadows** - `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
3. **Strong Typography** - `font-black`, `font-bold`, `uppercase`
4. **Vibrant Colors** - Bright, saturated colors
5. **Hover Effects** - `translate-x-[-2px] translate-y-[-2px]` + increased shadow

---

## 🧩 Component Standards

### **1. BUTTONS**

#### Primary Button
```jsx
className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
```

#### Secondary Button (Gray)
```jsx
className="px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
```

#### Success Button (Green)
```jsx
className="px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
```

#### Danger Button (Red)
```jsx
className="px-4 py-2 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
```

#### Warning Button (Yellow/Orange)
```jsx
className="px-4 py-2 bg-yellow-500 text-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide"
```

#### Disabled State
```jsx
disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0
```

---

### **2. INPUTS**

#### Text Input
```jsx
className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
```

#### Text Area
```jsx
className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] resize-y"
```

#### Select Dropdown
```jsx
className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
```

#### Disabled Input
```jsx
disabled:bg-gray-100 disabled:cursor-not-allowed
```

---

### **3. CARDS**

#### Basic Card
```jsx
className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
```

#### Hoverable Card
```jsx
className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all p-6 cursor-pointer"
```

#### Colored Card (Blue)
```jsx
className="bg-blue-500 text-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
```

---

### **4. MODALS**

#### Modal Container
```jsx
className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md"
```

#### Modal Overlay
```jsx
style={{
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}
```

#### Modal Title
```jsx
className="text-xl font-black text-gray-800 uppercase tracking-wide"
```

---

### **5. TABS**

#### Active Tab
```jsx
className="px-4 py-2 bg-blue-500 text-white rounded-t-lg border-[3px] border-black border-b-0 font-black uppercase tracking-wide"
```

#### Inactive Tab
```jsx
className="px-4 py-2 bg-white text-gray-700 rounded-t-lg border-[3px] border-black border-b-0 font-bold hover:bg-gray-100 transition-all"
```

---

### **6. BADGES / TAGS**

#### Status Badge
```jsx
className="px-3 py-1 text-xs font-black rounded-full border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-green-400 text-green-900"
```

Colors by status:
- Success: `bg-green-400 text-green-900`
- Warning: `bg-yellow-400 text-yellow-900`
- Error: `bg-red-400 text-red-900`
- Info: `bg-blue-400 text-blue-900`

---

### **7. ALERTS / NOTICES**

#### Info Alert
```jsx
className="p-4 bg-blue-100 border-[3px] border-blue-400 rounded-lg"
```

#### Warning Alert
```jsx
className="p-4 bg-yellow-100 border-[3px] border-yellow-400 rounded-lg"
```

#### Error Alert
```jsx
className="p-4 bg-red-100 border-[3px] border-red-400 rounded-lg"
```

#### Success Alert
```jsx
className="p-4 bg-green-100 border-[3px] border-green-400 rounded-lg"
```

---

### **8. TABLES**

#### Table Container
```jsx
className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
```

#### Table Header
```jsx
className="bg-gray-50 border-b-[3px] border-black"
```

#### Table Row Hover
```jsx
className="hover:bg-yellow-50 transition-colors border-b-[2px] border-gray-200"
```

---

## ❌ **KHÔNG DÙNG (Old Styles)**

### Buttons
```jsx
❌ bg-blue-600 hover:bg-blue-700
❌ bg-green-600 hover:bg-green-700  
❌ shadow-lg, shadow-md
❌ font-semibold (use font-black instead)
```

### Inputs
```jsx
❌ border border-gray-300
❌ focus:ring-2 focus:ring-blue-500
❌ (use border-[3px] border-black instead)
```

### Cards
```jsx
❌ shadow-lg, shadow-xl
❌ border border-gray-200
❌ (use border-[4px] border-black + hard shadow)
```

---

## 📋 Checklist for Each Page

- [ ] All buttons have `border-[3px] border-black`
- [ ] All buttons have `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- [ ] All buttons have `font-black` or `font-bold`
- [ ] All buttons have hover effects (translate + shadow increase)
- [ ] All inputs have `border-[3px] border-black`
- [ ] All cards have `border-[4px] border-black`
- [ ] All cards have `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`
- [ ] Typography uses `font-black` for headings
- [ ] Modals use Neo Brutalism styles
- [ ] Alerts/notices have colored borders
- [ ] Tables have proper borders and shadows

---

## 🎨 Color Palette

### Primary Colors
- Blue: `bg-blue-500` / `border-blue-400`
- Green: `bg-green-500` / `border-green-400`
- Red: `bg-red-500` / `border-red-400`
- Yellow: `bg-yellow-400` / `border-yellow-400`
- Orange: `bg-orange-500` / `border-orange-400`
- Purple: `bg-purple-500` / `border-purple-400`

### Neutrals
- Black: `border-black`, `text-black`
- White: `bg-white`, `text-white`
- Gray: `bg-gray-500`, `text-gray-700`

---

## 🔧 Migration Checklist

### Admin Pages
- [x] AdminDashboardPage - ✅ DONE
- [x] UsersManagementPage - ✅ DONE
- [ ] ContentManagementPage - PARTIAL
- [ ] ExamManagementPage - PARTIAL
- [ ] ExportImportPage - NOT DONE
- [ ] QuizEditorPage - NOT DONE

### Editor Pages
- [ ] EditorDashboardPage - NOT DONE
- [ ] EditorLayout - PARTIAL

### Components
- [x] AdminLayout - ✅ DONE
- [ ] EditorLayout - PARTIAL
- [x] Modal - ✅ DONE
- [x] SeriesCard - ✅ DONE

---

**Last Updated:** 2025-11-18
**Version:** 1.0

