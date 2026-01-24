# Lộ Trình Học Tập Toàn Diện - JLPT E-Learning Platform

> **Mục tiêu**: Hiểu tường tận toàn bộ hệ thống từ kiến trúc, luồng hoạt động cho tới từng logic code, mọi ngóc ngách và nguyên lý hoạt động.

---

## 📋 Mục Lục

1. [Giai Đoạn 1: Tổng Quan & Kiến Trúc](#giai-đoạn-1-tổng-quan--kiến-trúc)
2. [Giai Đoạn 2: Khởi Tạo & Entry Point](#giai-đoạn-2-khởi-tạo--entry-point)
3. [Giai Đoạn 3: Authentication & Authorization](#giai-đoạn-3-authentication--authorization)
4. [Giai Đoạn 4: Routing & Navigation](#giai-đoạn-4-routing--navigation)
5. [Giai Đoạn 5: Storage Layer](#giai-đoạn-5-storage-layer)
6. [Giai Đoạn 6: Services Layer](#giai-đoạn-6-services-layer)
7. [Giai Đoạn 7: Features - Level System](#giai-đoạn-7-features---level-system)
8. [Giai Đoạn 8: Features - JLPT Exam](#giai-đoạn-8-features---jlpt-exam)
9. [Giai Đoạn 9: Dashboard & SRS](#giai-đoạn-9-dashboard--srs)
10. [Giai Đoạn 10: Admin Panel](#giai-đoạn-10-admin-panel)
11. [Giai Đoạn 11: Utilities & Helpers](#giai-đoạn-11-utilities--helpers)
12. [Giai Đoạn 12: Performance & Optimization](#giai-đoạn-12-performance--optimization)
13. [Giai Đoạn 13: Deployment & CI/CD](#giai-đoạn-13-deployment--cicd)

---

## 🎯 Giai Đoạn 1: Tổng Quan & Kiến Trúc

### Mục tiêu học tập
- Hiểu tổng quan về dự án và mục đích
- Nắm được tech stack và lý do chọn từng công nghệ
- Hiểu kiến trúc tổng thể của hệ thống

### Nội dung cần đọc

#### 1.1. Tổng quan dự án
- **File**: `README.md`
- **Nội dung**:
  - Mục đích: Nền tảng học tiếng Nhật JLPT với các tính năng học tập, luyện thi, SRS
  - Tech stack: React 19, Vite 7, Tailwind CSS, Ant Design, Supabase
  - Features chính: Level System (N1-N5), JLPT Exam, Dashboard, Admin Panel

**Câu hỏi tự kiểm tra**:
- Tại sao chọn React 19? (React 19 có gì mới?)
- Tại sao dùng Vite thay vì Create React App?
- Supabase là gì và tại sao chọn nó làm backend?
- IndexedDB vs localStorage - khi nào dùng cái nào?

**Giải thích chi tiết**:

##### Mục đích dự án

**Glingo** là nền tảng học tiếng Nhật toàn diện, tập trung vào:
- **JLPT Preparation**: Chuẩn bị cho kỳ thi JLPT (Japanese Language Proficiency Test) từ N5 (cơ bản) đến N1 (nâng cao)
- **Interactive Learning**: Học tương tác với lessons, quizzes, flashcards
- **SRS (Spaced Repetition System)**: Hệ thống lặp lại ngắt quãng để ghi nhớ hiệu quả
- **Exam Simulation**: Mô phỏng đề thi JLPT thực tế với timing và scoring

**Đối tượng sử dụng**:
- Học viên: Học và luyện thi JLPT
- Admin: Quản lý nội dung, users, settings
- Editor: Chỉnh sửa nội dung học tập

##### Tech Stack và lý do chọn

**Frontend Framework: React 19**
- **React 19** (phát hành 12/2024) là phiên bản mới nhất với nhiều cải tiến:
  - **Server Components**: Render trên server, giảm bundle size client
  - **Actions**: Xử lý form và mutations đơn giản hơn
  - **use() hook**: Đọc promises và context dễ dàng
  - **useOptimistic**: Cập nhật UI lạc quan (optimistic updates)
  - **Improved hydration**: Ít lỗi hơn, performance tốt hơn
  - **Better library compatibility**: Tương thích tốt với các thư viện hiện đại
  
- **Lý do chọn**: 
  - Framework phổ biến, cộng đồng lớn
  - Component-based architecture phù hợp với UI phức tạp
  - Virtual DOM giúp performance tốt
  - Ecosystem phong phú (routing, state management, UI libraries)

**Build Tool: Vite 7**
- **Vite** là build tool hiện đại, nhanh hơn nhiều so với Webpack:
  - **Dev server**: HMR (Hot Module Replacement) cực nhanh, khởi động trong vài giây
  - **Build**: Dùng Rollup, tối ưu hơn Webpack
  - **ESM native**: Sử dụng ES Modules trực tiếp, không cần bundle trong dev
  - **Plugin system**: Dễ mở rộng với plugins
  - **Zero config**: Cấu hình tối thiểu, hoạt động ngay out-of-the-box
  
- **Lý do chọn thay vì Create React App**:
  - CRA đã deprecated (không còn được maintain)
  - Vite nhanh hơn 10-100 lần trong development
  - Build output nhỏ hơn và tối ưu hơn
  - Hỗ trợ TypeScript, CSS, assets tốt hơn

**Styling: Tailwind CSS 3**
- **Utility-first CSS framework**: Viết styles trực tiếp trong JSX
- **Lý do chọn**:
  - Development nhanh, không cần viết CSS riêng
  - Bundle size nhỏ (tree-shaking tự động)
  - Responsive design dễ dàng
  - Consistent design system

**Ví dụ Tailwind CSS trong dự án**:

Tailwind sử dụng utility classes - mỗi class là một CSS property cụ thể. Thay vì viết CSS riêng, bạn viết trực tiếp trong JSX:

```jsx
// ❌ Cách truyền thống (CSS riêng):
// styles.css
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

// Component
<div className="container">...</div>

// ✅ Cách Tailwind (utility classes):
<div className="flex flex-col p-4 bg-white rounded-xl shadow-md">
  ...
</div>
```

**Ví dụ từ HomePage.jsx**:

```jsx
// Button với gradient, hover effects, responsive
<a 
  href="/level" 
  className="group relative inline-flex items-center justify-center gap-3 
             px-8 py-4 
             bg-gradient-to-r from-yellow-500 to-orange-500 
             text-white font-bold text-lg 
             rounded-full 
             shadow-2xl hover:shadow-3xl 
             transform hover:scale-110 
             transition-all duration-300 
             overflow-hidden 
             w-full sm:w-[280px]"
>
  <span className="text-2xl relative z-10">📚</span>
  <span className="relative z-10 text-center">
    {t('home.startLearning')}
  </span>
</a>
```

**Giải thích từng class**:
- `group`: Group các elements để hover effect áp dụng cho cả group
- `relative`: Position relative
- `inline-flex`: Display inline-flex
- `items-center justify-center`: Flexbox center alignment
- `gap-3`: Gap 0.75rem (12px) giữa các children
- `px-8 py-4`: Padding horizontal 2rem, vertical 1rem
- `bg-gradient-to-r from-yellow-500 to-orange-500`: Gradient background từ vàng sang cam
- `text-white font-bold text-lg`: Text màu trắng, đậm, size lớn
- `rounded-full`: Border radius 100% (tròn hoàn toàn)
- `shadow-2xl hover:shadow-3xl`: Shadow lớn, lớn hơn khi hover
- `transform hover:scale-110`: Scale lên 110% khi hover
- `transition-all duration-300`: Transition tất cả properties trong 300ms
- `w-full sm:w-[280px]`: Width 100% trên mobile, 280px từ sm breakpoint trở lên

**Ví dụ responsive design**:

```jsx
// Grid responsive: 2 cột mobile, 4 cột desktop
<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 
                  rounded-2xl p-6 
                  shadow-lg hover:shadow-2xl 
                  transition-all duration-300 
                  hover:-translate-y-2 
                  border-2 border-yellow-300">
    <div className="text-4xl mb-3">📝</div>
    <h3 className="font-bold text-gray-900 text-lg">JLPT Tests</h3>
    <p className="text-sm text-gray-700">Practice exams</p>
  </div>
</div>
```

**Giải thích responsive**:
- `grid-cols-2`: 2 cột trên mobile (mặc định)
- `md:grid-cols-2`: 2 cột từ medium breakpoint (768px)
- `lg:grid-cols-4`: 4 cột từ large breakpoint (1024px)
- `gap-4 md:gap-6`: Gap 1rem mobile, 1.5rem desktop

**Ví dụ với animations**:

```jsx
// Animated background blobs
<div className="absolute top-1/4 left-10 
                w-40 h-40 
                bg-yellow-300 
                rounded-full 
                mix-blend-multiply 
                filter blur-3xl 
                opacity-10 
                animate-blob">
</div>
```

**Lợi ích của Tailwind**:
1. **Không cần file CSS riêng**: Tất cả styles trong JSX
2. **Consistent spacing**: Dùng scale có sẵn (4, 8, 12, 16, ...)
3. **Tree-shaking**: Chỉ bundle classes đã dùng
4. **Responsive dễ dàng**: Chỉ cần thêm prefix `sm:`, `md:`, `lg:`
5. **Hover/focus states**: Dễ dàng với `hover:`, `focus:`, `active:`
6. **Dark mode**: Hỗ trợ với `dark:` prefix

**Tailwind vs Inline CSS - Sự khác biệt quan trọng**:

Nhìn bề ngoài, Tailwind có vẻ giống inline CSS vì đều viết styles trực tiếp trong HTML/JSX. Nhưng có sự khác biệt lớn:

**1. Inline CSS (style attribute)**:
```jsx
// ❌ Inline CSS - Viết trực tiếp CSS properties
<div style={{
  display: 'flex',
  flexDirection: 'column',
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
}}>
  Content
</div>
```

**Vấn đề với inline CSS**:
- ❌ Không thể dùng media queries (responsive)
- ❌ Không thể dùng pseudo-classes (hover, focus, active)
- ❌ Không thể dùng pseudo-elements (::before, ::after)
- ❌ Không có design system (mỗi lần phải nhớ giá trị)
- ❌ Không có tree-shaking (tất cả styles đều được include)
- ❌ Khó maintain (duplicate code nhiều)
- ❌ Priority cao nhất (khó override)

**2. Tailwind CSS (utility classes)**:
```jsx
// ✅ Tailwind - Dùng utility classes
<div className="flex flex-col p-4 bg-white rounded-xl shadow-md">
  Content
</div>
```

**Tailwind hoạt động như thế nào**:
- ✅ Build time: Tailwind scan code, tìm classes đã dùng
- ✅ Generate CSS: Chỉ generate CSS cho classes đã dùng
- ✅ Output: File CSS nhỏ, chỉ chứa styles cần thiết

**Ví dụ so sánh cụ thể**:

```jsx
// ❌ Inline CSS - KHÔNG THỂ làm responsive
<button style={{
  padding: '1rem',
  backgroundColor: 'blue',
  color: 'white'
}}>
  Click me
</button>
// Vấn đề: Làm sao thay đổi padding trên mobile? → Không thể!

// ✅ Tailwind - Responsive dễ dàng
<button className="p-4 md:p-6 lg:p-8 bg-blue-500 text-white">
  Click me
</button>
// p-4 trên mobile, p-6 trên tablet, p-8 trên desktop
```

```jsx
// ❌ Inline CSS - KHÔNG THỂ làm hover effect
<button style={{
  backgroundColor: 'blue',
  color: 'white'
}}>
  Click me
</button>
// Vấn đề: Làm sao đổi màu khi hover? → Phải dùng JavaScript!

// ✅ Tailwind - Hover effect dễ dàng
<button className="bg-blue-500 hover:bg-blue-600 text-white">
  Click me
</button>
// Tự động đổi màu khi hover, không cần JavaScript
```

```jsx
// ❌ Inline CSS - Phải nhớ giá trị mỗi lần
<div style={{ padding: '1rem', margin: '0.5rem', borderRadius: '0.5rem' }}>
  Content
</div>
<div style={{ padding: '1rem', margin: '0.5rem', borderRadius: '0.5rem' }}>
  More content
</div>
// Vấn đề: Duplicate code, không consistent

// ✅ Tailwind - Design system có sẵn
<div className="p-4 m-2 rounded-lg">
  Content
</div>
<div className="p-4 m-2 rounded-lg">
  More content
</div>
// Consistent spacing (p-4 = 1rem, m-2 = 0.5rem)
```

**Kết quả sau khi build**:

**Inline CSS**:
```html
<!-- Mỗi element có styles riêng, không tái sử dụng -->
<div style="display:flex;padding:1rem;...">...</div>
<div style="display:flex;padding:1rem;...">...</div>
<div style="display:flex;padding:1rem;...">...</div>
<!-- File HTML lớn, duplicate code nhiều -->
```

**Tailwind CSS**:
```html
<!-- Classes được tái sử dụng -->
<div class="flex p-4">...</div>
<div class="flex p-4">...</div>
<div class="flex p-4">...</div>

<!-- Tailwind generate CSS một lần: -->
<style>
.flex { display: flex; }
.p-4 { padding: 1rem; }
/* Chỉ generate một lần, tất cả elements dùng chung */
</style>
```

**Tóm tắt**:

| Tính năng | Inline CSS | Tailwind CSS |
|-----------|------------|--------------|
| **Responsive** | ❌ Không thể | ✅ Dễ dàng (`sm:`, `md:`, `lg:`) |
| **Hover/Focus** | ❌ Không thể | ✅ Dễ dàng (`hover:`, `focus:`) |
| **Design System** | ❌ Không có | ✅ Có sẵn (spacing, colors, etc.) |
| **Tree-shaking** | ❌ Không có | ✅ Tự động |
| **Maintainability** | ❌ Khó (duplicate) | ✅ Dễ (reusable classes) |
| **Bundle Size** | ❌ Lớn (duplicate) | ✅ Nhỏ (shared classes) |
| **Performance** | ❌ Chậm (inline styles) | ✅ Nhanh (CSS classes) |

**Kết luận**: Tailwind **KHÔNG phải** inline CSS. Nó là một hệ thống utility classes được generate và optimize ở build time, cho phép bạn viết styles trực tiếp trong JSX nhưng với đầy đủ tính năng của CSS (responsive, hover, dark mode, etc.) và performance tốt hơn nhiều.

**UI Components: Ant Design 5**
- **Enterprise-grade UI library**: Components đẹp, đầy đủ tính năng
- **Lý do chọn**:
  - Components phong phú (Table, Form, Modal, etc.)
  - Design đẹp, professional
  - Documentation tốt
  - Có patch cho React 19 (`@ant-design/v5-patch-for-react-19`)

**Cách sử dụng Ant Design**:

Ant Design cung cấp các components đã được build sẵn, bạn chỉ cần import và sử dụng. Trong dự án này, Ant Design được dùng chủ yếu cho các components phức tạp như Modal, Table, Form.

**1. Setup Ant Design**:

```jsx
// main.jsx - Import patch cho React 19
import '@ant-design/v5-patch-for-react-19';

// Đây là bắt buộc để Ant Design hoạt động với React 19
```

**2. Ví dụ từ dự án - Modal Component**:

```jsx
// src/components/Sidebar.jsx
import { Modal } from 'antd';

function Sidebar() {
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  return (
    <>
      {/* Custom button trigger */}
      <button onClick={() => setShowUpcomingModal(true)}>
        Click me
      </button>

      {/* Ant Design Modal */}
      <Modal
        title="Thông báo"
        open={showUpcomingModal}
        onOk={() => setShowUpcomingModal(false)}
        onCancel={() => setShowUpcomingModal(false)}
        okText="Đóng"
        cancelText="Hủy"
      >
        <p>Đề thi này sắp diễn ra. Vui lòng quay lại sau!</p>
      </Modal>
    </>
  );
}
```

**Giải thích**:
- `import { Modal } from 'antd'`: Import component từ Ant Design
- `open`: Prop để control modal hiển thị hay không
- `onOk`: Callback khi click nút OK
- `onCancel`: Callback khi click nút Cancel hoặc click outside
- `title`: Tiêu đề modal
- `okText`, `cancelText`: Custom text cho buttons

**3. Các Components phổ biến của Ant Design**:

**Table Component** (Hiển thị dữ liệu dạng bảng):
```jsx
import { Table } from 'antd';

const columns = [
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Vai trò',
    dataIndex: 'role',
    key: 'role',
  },
];

const data = [
  { key: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
  { key: '2', name: 'User 2', email: 'user2@example.com', role: 'admin' },
];

function UserTable() {
  return <Table columns={columns} dataSource={data} />;
}
```

**Form Component** (Form với validation):
```jsx
import { Form, Input, Button } from 'antd';

function LoginForm() {
  const onFinish = (values) => {
    console.log('Form values:', values);
    // Handle submit
  };

  return (
    <Form
      name="login"
      onFinish={onFinish}
      layout="vertical"
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' }
        ]}
      >
        <Input placeholder="Nhập email" />
      </Form.Item>

      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
      >
        <Input.Password placeholder="Nhập mật khẩu" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  );
}
```

**DatePicker Component** (Chọn ngày):
```jsx
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

function DateSelector() {
  const onChange = (date, dateString) => {
    console.log('Selected date:', date, dateString);
  };

  return (
    <DatePicker
      onChange={onChange}
      format="DD/MM/YYYY"
      placeholder="Chọn ngày"
    />
  );
}
```

**Message Component** (Thông báo toast):
```jsx
import { message } from 'antd';

// Success message
message.success('Lưu thành công!');

// Error message
message.error('Có lỗi xảy ra!');

// Warning message
message.warning('Cảnh báo!');

// Info message
message.info('Thông tin');
```

**4. Tại sao dự án này ít dùng Ant Design?**

Dự án này chủ yếu dùng **custom components** với **Tailwind CSS** vì:
- **Design system riêng**: Neo-brutalism style (bold, colorful, high contrast)
- **Customization**: Cần control hoàn toàn về styling
- **Bundle size**: Chỉ import những gì cần (Modal) thay vì toàn bộ library
- **Consistency**: Tất cả components có cùng design language

**Khi nào dùng Ant Design trong dự án này**:
- ✅ **Modal**: Khi cần modal phức tạp với nhiều tính năng
- ✅ **DatePicker**: Khi cần chọn ngày (có trong `components/admin/DatePicker.jsx`)
- ❌ **Table, Form, Button**: Dùng custom components với Tailwind

**5. Best Practices**:

```jsx
// ✅ Đúng: Import chỉ components cần dùng
import { Modal, DatePicker } from 'antd';

// ❌ Sai: Import toàn bộ (tăng bundle size)
import * as antd from 'antd';

// ✅ Đúng: Dùng với React 19 patch
import '@ant-design/v5-patch-for-react-19';

// ✅ Đúng: Customize với props
<Modal
  title="Custom Title"
  okText="Xác nhận"
  cancelText="Hủy"
  width={600}
  centered
>
  Content
</Modal>
```

**6. So sánh Custom Components vs Ant Design**:

| Tính năng | Custom Components | Ant Design |
|-----------|-------------------|------------|
| **Styling** | Full control (Tailwind) | Pre-styled, khó customize |
| **Bundle size** | Chỉ code cần thiết | Lớn hơn (nếu import nhiều) |
| **Design consistency** | Dễ maintain | Consistent sẵn |
| **Development time** | Lâu hơn (phải code) | Nhanh hơn (có sẵn) |
| **Flexibility** | Rất linh hoạt | Hạn chế hơn |

**Kết luận**: Ant Design là công cụ mạnh mẽ cho enterprise applications, nhưng trong dự án này, team chọn custom components để có full control về design và giảm bundle size. Ant Design chỉ được dùng cho những components phức tạp như Modal, DatePicker.

**Backend: Supabase**
- **Supabase** là Backend-as-a-Service (BaaS), cung cấp:
  - **PostgreSQL Database**: Database quan hệ mạnh mẽ với Row Level Security (RLS)
  - **Authentication**: Email/password, OAuth, Magic Links
  - **Real-time**: Subscriptions qua WebSocket cho live updates
  - **Storage**: File storage (images, audio) tương tự S3
  - **Auto-generated APIs**: REST và GraphQL APIs tự động từ database schema
  - **Edge Functions**: Serverless functions để xử lý logic phức tạp
  
- **Lý do chọn**:
  - **Giảm thời gian phát triển**: Không cần tự build backend từ đầu
  - **Security**: Row Level Security (RLS) bảo vệ data ở database level
  - **Real-time**: Cập nhật access control, maintenance mode real-time
  - **Cost-effective**: Free tier đủ cho MVP, pricing hợp lý khi scale
  - **Developer experience**: SDK tốt, documentation đầy đủ
  - **Open source**: Có thể self-host nếu cần

**Cách kết nối và sử dụng Supabase**:

**1. Setup và Configuration**:

**Bước 1: Tạo Supabase Project**
- Truy cập https://supabase.com
- Tạo project mới
- Lấy `Project URL` và `anon/public key`

**Bước 2: Cấu hình Environment Variables**
```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Bước 3: Khởi tạo Supabase Client**
```javascript
// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // Tự động lưu session
    autoRefreshToken: true,     // Tự động refresh token
    storage: window.localStorage, // Lưu session trong localStorage
    storageKey: 'sb-glingo-auth-token',
    detectSessionInUrl: true,   // Detect OAuth redirects
    flowType: 'pkce',           // PKCE flow (bảo mật hơn)
  },
  realtime: {
    params: {
      eventsPerSecond: 10,     // Giới hạn events/second
    },
  },
});
```

**Giải thích các options**:
- `persistSession: true`: Session được lưu tự động, không mất khi refresh page
- `autoRefreshToken: true`: Token tự động refresh trước khi hết hạn
- `flowType: 'pkce'`: PKCE (Proof Key for Code Exchange) - bảo mật hơn cho OAuth
- `storage: window.localStorage`: Lưu session trong localStorage (có thể dùng sessionStorage)

**2. Database Operations (PostgreSQL)**:

**Query dữ liệu (SELECT)**:
```javascript
// src/services/contentService.js
import { supabase } from './supabaseClient.js';

// Get books by level
export async function getBooks(level) {
  const { data, error } = await supabase
    .from('books')                    // Table name
    .select('*')                      // Select all columns
    .eq('level', level)               // WHERE level = level
    .order('order_index', { ascending: true }); // ORDER BY order_index ASC

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}
```

**Insert dữ liệu**:
```javascript
// Insert single record
const { data, error } = await supabase
  .from('books')
  .insert({
    id: 'book-1',
    level: 'n5',
    title: 'Minna no Nihongo',
    description: '...',
    created_by: userId
  })
  .select()  // Return inserted data
  .single(); // Return single object (not array)
```

**Update dữ liệu**:
```javascript
// Update record
const { data, error } = await supabase
  .from('books')
  .update({ title: 'New Title', updated_at: new Date().toISOString() })
  .eq('id', 'book-1')  // WHERE id = 'book-1'
  .select()
  .single();
```

**Upsert (Insert or Update)**:
```javascript
// Upsert - Insert nếu chưa có, Update nếu đã có
const { data, error } = await supabase
  .from('books')
  .upsert({
    id: 'book-1',
    level: 'n5',
    title: 'Updated Title'
  }, {
    onConflict: 'id,level'  // Conflict resolution: dựa trên id và level
  })
  .select()
  .single();
```

**Delete dữ liệu**:
```javascript
// Delete record
const { error } = await supabase
  .from('books')
  .delete()
  .eq('id', 'book-1');
```

**Query với filters**:
```javascript
// Multiple conditions
const { data } = await supabase
  .from('books')
  .select('*')
  .eq('level', 'n5')           // WHERE level = 'n5'
  .neq('status', 'deleted')    // AND status != 'deleted'
  .gte('order_index', 0)       // AND order_index >= 0
  .limit(10)                   // LIMIT 10
  .offset(0);                  // OFFSET 0 (pagination)
```

**3. Authentication (Auth)**:

**Sign Up**:
```javascript
// src/services/authService.js
export async function signUp({ email, password, displayName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,  // Metadata cho user
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // ✅ AUTO: Profile được tạo tự động bởi database trigger
  // Hoặc tạo thủ công:
  if (data.user?.id) {
    await createUserProfile(data.user.id, {
      display_name: displayName,
      email: email,
      role: 'user',
    });
  }

  return { success: true, data };
}
```

**Sign In**:
```javascript
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

**Sign Out**:
```javascript
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

**Get Current User**:
```javascript
// Get current session
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;

// Get current user (refresh from server)
const { data: { user } } = await supabase.auth.getUser();
```

**Listen to Auth State Changes**:
```javascript
// src/contexts/AuthContext.jsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User đăng nhập
        const profile = await getUserProfile(session.user.id);
        setUser(session.user);
        setProfile(profile);
      } else if (event === 'SIGNED_OUT') {
        // User đăng xuất
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED') {
        // Token được refresh
        console.log('Token refreshed');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**4. Row Level Security (RLS)**:

RLS là tính năng bảo mật ở database level - mỗi row có policy riêng để kiểm soát ai có thể đọc/ghi.

**Ví dụ RLS Policy**:
```sql
-- migrations/xxx_create_rls_policies.sql

-- Policy: Users chỉ đọc được books của level họ có quyền
CREATE POLICY "Users can read books they have access to"
ON books FOR SELECT
USING (
  -- Public books (level n5)
  level = 'n5' OR
  -- User đã đăng nhập
  auth.role() = 'authenticated' OR
  -- Admin có quyền đọc tất cả
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Chỉ admin mới được insert/update/delete
CREATE POLICY "Only admins can modify books"
ON books FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

**Lợi ích của RLS**:
- ✅ **Bảo mật ở database level**: Không thể bypass từ frontend
- ✅ **Tự động áp dụng**: Mọi query đều được check
- ✅ **Không cần code logic**: Database tự động filter

**5. Real-time Subscriptions**:

Supabase hỗ trợ real-time updates qua WebSocket - khi data thay đổi, tất cả clients đều nhận update ngay lập tức.

**Subscribe to table changes**:
```javascript
// src/services/accessControlService.js
export function subscribeToAccessControl(callback) {
  const subscription = supabase
    .channel('access_control_changes')
    .on(
      'postgres_changes',
      {
        event: '*',                    // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'app_settings',
        filter: 'id=eq.1'              // Only listen to row with id = 1
      },
      (payload) => {
        console.log('Access control updated:', payload);
        
        // Extract access_control data
        const accessControl = payload.new?.access_control || {};
        
        // Call callback with updated data
        callback({
          levelConfigs: accessControl.level || {},
          jlptConfigs: accessControl.jlpt || {},
          levelModuleConfig: accessControl.levelModule || {},
          jlptModuleConfig: accessControl.jlptModule || {}
        });
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}
```

**Sử dụng trong component**:
```javascript
// src/App.jsx
useEffect(() => {
  // Subscribe to real-time changes
  const unsubscribe = subscribeToAccessControl((updatedData) => {
    console.log('Access control updated via real-time');
    
    // Sync to localStorage
    localStorage.setItem('levelAccessControl', JSON.stringify(updatedData.levelConfigs));
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('accessControlUpdated', { 
      detail: updatedData 
    }));
  });

  return () => {
    unsubscribe(); // Cleanup on unmount
  };
}, []);
```

**Các loại events**:
- `INSERT`: Khi có record mới được thêm
- `UPDATE`: Khi record được update
- `DELETE`: Khi record bị xóa
- `*`: Tất cả events

**6. Storage (File Upload)**:

Supabase Storage tương tự AWS S3 - lưu trữ files (images, audio, PDFs).

**Upload file**:
```javascript
// src/services/fileUploadService.js
export async function uploadImage(file, path) {
  // Upload to bucket
  const { data, error } = await supabase.storage
    .from('book-images')        // Bucket name
    .upload(path, file, {
      cacheControl: '3600',     // Cache 1 hour
      upsert: true              // Overwrite if exists
    });

  if (error) {
    return { success: false, error };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('book-images')
    .getPublicUrl(path);

  return { success: true, url: urlData.publicUrl };
}
```

**Download file**:
```javascript
// Download file
const { data, error } = await supabase.storage
  .from('book-images')
  .download('book-1/cover.jpg');
```

**Delete file**:
```javascript
// Delete file
const { error } = await supabase.storage
  .from('book-images')
  .remove(['book-1/cover.jpg']);
```

**List files**:
```javascript
// List all files in folder
const { data, error } = await supabase.storage
  .from('book-images')
  .list('book-1', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });
```

**7. Error Handling Pattern**:

Tất cả Supabase operations trả về `{ data, error }`:

```javascript
// Consistent error handling
const { data, error } = await supabase
  .from('books')
  .select('*');

if (error) {
  console.error('Error:', error);
  return { success: false, error: error.message };
}

return { success: true, data };
```

**Common error codes**:
- `PGRST116`: Not found (no rows returned)
- `23505`: Unique constraint violation
- `23503`: Foreign key constraint violation
- `42501`: Insufficient privileges (RLS policy violation)

**8. Best Practices**:

**✅ Đúng**:
```javascript
// 1. Check error trước khi dùng data
const { data, error } = await supabase.from('books').select('*');
if (error) return { success: false, error };
return { success: true, data };

// 2. Dùng .single() cho single record
const { data } = await supabase
  .from('books')
  .select('*')
  .eq('id', 'book-1')
  .single();

// 3. Cleanup subscriptions
useEffect(() => {
  const unsubscribe = subscribeToChanges();
  return () => unsubscribe();
}, []);

// 4. Validate inputs trước khi query
if (!level || !userId) {
  return { success: false, error: 'Missing required fields' };
}
```

**❌ Sai**:
```javascript
// 1. Không check error
const { data } = await supabase.from('books').select('*');
console.log(data); // Có thể undefined nếu error

// 2. Không cleanup subscriptions
useEffect(() => {
  subscribeToChanges(); // Memory leak!
}, []);

// 3. Query không có filter
const { data } = await supabase.from('books').select('*'); // Load tất cả!
```

**9. Performance Optimization**:

**Select chỉ columns cần thiết**:
```javascript
// ❌ Load tất cả columns
const { data } = await supabase.from('books').select('*');

// ✅ Chỉ load columns cần
const { data } = await supabase
  .from('books')
  .select('id, title, level'); // Chỉ 3 columns
```

**Pagination**:
```javascript
// Load từng page
const PAGE_SIZE = 20;
const { data } = await supabase
  .from('books')
  .select('*')
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

**Batch operations**:
```javascript
// Insert nhiều records cùng lúc
const { data } = await supabase
  .from('books')
  .insert([
    { id: 'book-1', title: 'Book 1' },
    { id: 'book-2', title: 'Book 2' },
    { id: 'book-3', title: 'Book 3' }
  ]);
```

**10. Security Considerations**:

**Anon Key vs Service Role Key**:
- **Anon Key**: Public key, dùng trong client, bị giới hạn bởi RLS
- **Service Role Key**: Secret key, bypass RLS, chỉ dùng trong server/Edge Functions

**Không bao giờ expose Service Role Key trong client!**

**RLS Policies**:
- Luôn enable RLS cho tất cả tables
- Viết policies rõ ràng, test kỹ
- Không trust client - validate ở database level

**Tóm tắt**: Supabase cung cấp đầy đủ backend services với API đơn giản, bảo mật cao (RLS), và real-time capabilities. Trong dự án này, Supabase được dùng cho database, authentication, storage, và real-time subscriptions.

**Deployment: Vercel**
- **Vercel** là platform deployment cho frontend:
  - **Zero-config deployment**: Tự động detect và deploy
  - **Edge Network**: CDN toàn cầu, load nhanh
  - **Analytics**: Built-in analytics và speed insights
  - **Preview deployments**: Tự động tạo preview cho mỗi PR
  - **Free tier**: Hào phóng cho personal projects

**Cách kết nối và sử dụng Vercel**:

**1. Setup Vercel Project**:

**Bước 1: Tạo Vercel Account**
- Truy cập https://vercel.com
- Đăng ký/đăng nhập bằng GitHub, GitLab, hoặc Bitbucket

**Bước 2: Connect Repository**
1. Click "Add New Project"
2. Import Git repository (GitHub/GitLab/Bitbucket)
3. Chọn repository của bạn
4. Vercel tự động detect framework (Vite trong trường hợp này)

**Bước 3: Configure Project Settings**
```
Framework Preset: Vite
Root Directory: ./ (root)
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Bước 4: Environment Variables**
Thêm trong Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SPEED_INSIGHTS=true
```

**Environment Scope**:
- **Production**: Chỉ áp dụng cho production deployments
- **Preview**: Áp dụng cho preview deployments (PRs)
- **Development**: Áp dụng cho local development (optional)

**2. Vercel Configuration File (`vercel.json`)**:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.supabase.co https://*.vercel-analytics.com; ..."
        }
      ]
    }
  ]
}
```

**Giải thích**:
- **rewrites**: Tất cả routes redirect về `/index.html` (SPA routing)
- **headers**: Security headers (HSTS, CSP, X-Frame-Options, etc.)

**3. Deployment Workflow**:

**Automatic Deployment**:
```
Push to main branch
  ↓
Vercel detects changes
  ↓
Runs: npm install
  ↓
Runs: npm run build
  ↓
Deploys to production
  ↓
URL: https://your-project.vercel.app
```

**Preview Deployment**:
```
Create Pull Request
  ↓
Vercel creates preview deployment
  ↓
Unique URL: https://your-project-git-branch.vercel.app
  ↓
Comment in PR with preview link
```

**Manual Deployment với CLI**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**4. Build Process**:

**Vite Build Configuration** (`vite.config.js`):
```javascript
export default defineConfig({
  build: {
    // Minify JS/CSS
    minify: 'esbuild',
    
    // Tắt source map trên production (security)
    sourcemap: false,
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['antd', '@ant-design/icons'],
        }
      }
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 600
  }
});
```

**Build Output**:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Main bundle (code split)
│   ├── vendor-react-[hash].js
│   ├── vendor-supabase-[hash].js
│   ├── vendor-ui-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── ...
```

**5. Edge Network (CDN)**:

Vercel sử dụng **Edge Network** - CDN toàn cầu với 100+ locations:

**Cách hoạt động**:
```
User request
  ↓
Nearest Edge Location (CDN)
  ↓
Check cache
  ↓
If cached: Return immediately (fast!)
  ↓
If not cached: Fetch from origin → Cache → Return
```

**Lợi ích**:
- ✅ **Fast**: Content được serve từ location gần user nhất
- ✅ **Global**: 100+ edge locations worldwide
- ✅ **Automatic**: Không cần config, tự động hoạt động
- ✅ **HTTPS**: SSL certificate tự động (Let's Encrypt)

**6. Vercel Analytics & Speed Insights**:

**Setup trong code**:
```javascript
// src/App.jsx
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      {/* Vercel Speed Insights - Performance monitoring */}
      <SpeedInsights />
      
      {/* Vercel Web Analytics - Visitor tracking */}
      <Analytics />
    </div>
  );
}
```

**Vercel Analytics**:
- **Page views**: Track số lượt xem trang
- **Unique visitors**: Số visitor duy nhất
- **Top pages**: Trang được xem nhiều nhất
- **Referrers**: Nguồn traffic (Google, direct, etc.)
- **Countries**: Phân bố theo quốc gia

**Speed Insights**:
- **Core Web Vitals**: LCP, FID, CLS
- **Real User Monitoring (RUM)**: Performance từ real users
- **Performance scores**: Overall performance score
- **Recommendations**: Gợi ý cải thiện performance

**7. Preview Deployments**:

Mỗi Pull Request tự động tạo preview deployment:

**Workflow**:
```
Developer creates PR
  ↓
Vercel detects PR
  ↓
Creates preview deployment
  ↓
Builds with preview environment variables
  ↓
Generates unique URL
  ↓
Comments in PR with preview link
```

**Lợi ích**:
- ✅ **Test trước khi merge**: Test changes trên production-like environment
- ✅ **Share với team**: Share preview link để review
- ✅ **Isolated**: Mỗi PR có environment riêng, không ảnh hưởng production

**8. Custom Domain**:

**Thêm Custom Domain**:
1. Vào Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Configure DNS records:

**DNS Configuration**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**SSL Certificate**:
- Vercel tự động provision SSL certificate (Let's Encrypt)
- HTTPS enabled tự động
- Auto-renewal

**9. Environment Variables Management**:

**Via Dashboard**:
1. Project → Settings → Environment Variables
2. Add variable
3. Select environment (Production/Preview/Development)
4. Save

**Via CLI**:
```bash
# Add environment variable
vercel env add VITE_SUPABASE_URL

# List environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local
```

**Best Practices**:
- ✅ **Never commit secrets**: Chỉ lưu trong Vercel Dashboard
- ✅ **Use different values**: Production vs Preview có thể khác nhau
- ✅ **Rotate keys**: Đổi keys định kỳ để bảo mật

**10. CI/CD Integration**:

**GitHub Actions** (Optional):
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**11. Security Headers**:

Vercel config trong `vercel.json`:

**Strict-Transport-Security (HSTS)**:
```
max-age=31536000; includeSubDomains; preload
```
- Force HTTPS trong 1 năm
- Áp dụng cho subdomains
- Preload vào browser HSTS list

**Content-Security-Policy (CSP)**:
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://*.supabase.co https://*.vercel-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
...
```
- Chỉ cho phép load resources từ trusted sources
- Prevent XSS attacks
- Configure cho Supabase, Vercel Analytics, Google Fonts

**X-Frame-Options**:
```
DENY
```
- Prevent clickjacking
- Không cho phép embed trong iframe

**12. Performance Optimization**:

**Automatic Optimizations**:
- ✅ **Image Optimization**: Tự động optimize images
- ✅ **Code Splitting**: Automatic code splitting
- ✅ **Tree Shaking**: Remove unused code
- ✅ **Minification**: Minify JS/CSS
- ✅ **Compression**: Gzip/Brotli compression
- ✅ **Caching**: Smart caching strategy

**Manual Optimizations** (trong `vite.config.js`):
```javascript
build: {
  // Code splitting
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-supabase': ['@supabase/supabase-js'],
      }
    }
  }
}
```

**13. Monitoring & Logging**:

**Vercel Dashboard**:
- **Deployments**: Xem tất cả deployments
- **Analytics**: Page views, visitors, top pages
- **Speed Insights**: Performance metrics
- **Logs**: Real-time logs từ deployments
- **Functions**: Edge Functions logs (nếu có)

**Access Logs**:
```bash
# View logs via CLI
vercel logs [deployment-url]

# Follow logs in real-time
vercel logs --follow
```

**14. Rollback & Versioning**:

**Rollback Deployment**:
1. Vào Deployments trong Vercel Dashboard
2. Chọn deployment cũ
3. Click "Promote to Production"

**Versioning**:
- Mỗi deployment có unique URL
- Có thể promote bất kỳ version nào lên production
- Preview deployments không bị xóa ngay

**15. Free Tier Limits**:

**Vercel Free Tier**:
- ✅ **100GB bandwidth/month**: Đủ cho personal projects
- ✅ **100 builds/month**: Đủ cho development
- ✅ **Unlimited projects**: Không giới hạn số projects
- ✅ **Preview deployments**: Unlimited
- ✅ **Custom domains**: Unlimited
- ✅ **SSL certificates**: Free, auto-renewal

**Upgrade khi cần**:
- More bandwidth
- More builds
- Team collaboration
- Priority support

**16. Best Practices**:

**✅ Đúng**:
```bash
# 1. Test build locally trước khi push
npm run build

# 2. Check environment variables
vercel env ls

# 3. Monitor deployments
# Check Vercel Dashboard sau mỗi deployment

# 4. Use preview deployments
# Test trên preview trước khi merge

# 5. Set up custom domain
# Professional URL cho production
```

**❌ Sai**:
```bash
# 1. Commit secrets vào Git
# ❌ Không commit .env files

# 2. Deploy mà không test
# ❌ Luôn test build locally trước

# 3. Ignore build errors
# ❌ Fix build errors trước khi deploy
```

**Tóm tắt**: Vercel là platform deployment mạnh mẽ với zero-config, Edge Network toàn cầu, automatic SSL, preview deployments, và analytics built-in. Trong dự án này, Vercel được dùng để deploy React app với automatic deployments từ Git, custom domain, và monitoring.

##### Features chính

**1. Level System (N1-N5)**
- Cấu trúc phân cấp: **Level → Books → Chapters → Lessons → Quizzes**
- Mỗi level (N1-N5) có nhiều sách (books)
- Mỗi sách có nhiều chương (chapters)
- Mỗi chương có nhiều bài học (lessons)
- Mỗi bài học có quiz để kiểm tra
- **Lesson types**: Theory (lý thuyết), Flashcard (thẻ từ), Quiz (câu hỏi), Mixed (kết hợp)
- **Progress tracking**: Theo dõi tiến độ học tập của từng lesson

**2. JLPT Exam Practice**
- Mô phỏng đề thi JLPT thực tế
- **Knowledge Section**: Vocabulary (từ vựng), Grammar (ngữ pháp), Reading (đọc hiểu)
- **Listening Section**: Câu hỏi nghe với audio
- **Timing**: Giới hạn thời gian như thi thật
- **Auto-save**: Tự động lưu đáp án trong quá trình làm
- **Scoring**: Tự động chấm điểm và hiển thị kết quả
- **Answer explanations**: Giải thích đáp án sau khi hoàn thành

**3. Dashboard**
- **Progress Overview**: Tổng quan tiến độ học tập với biểu đồ
- **SRS Reviews**: Flashcard cần ôn tập (dựa trên thuật toán SRS)
- **Statistics**: Thống kê học tập (số lesson đã học, điểm số, etc.)
- **Activity Feed**: Lịch sử hoạt động gần đây
- **Streak Counter**: Đếm số ngày học liên tiếp

**4. Admin Panel**
- **Content Management**: CRUD (Create, Read, Update, Delete) cho books, chapters, lessons, quizzes
- **Exam Management**: Tạo và quản lý đề thi JLPT
- **User Management**: Xem users, thay đổi role, ban/unban
- **Access Control**: Cấu hình quyền truy cập theo level và module
- **Settings**: Maintenance mode, system configuration
- **Notifications**: Gửi thông báo cho users

##### Trả lời câu hỏi tự kiểm tra

**Q: Tại sao chọn React 19? (React 19 có gì mới?)**

**A:** React 19 là phiên bản mới nhất với nhiều tính năng mạnh mẽ:
- **Server Components**: Giảm bundle size, render trên server
- **Actions**: Xử lý form đơn giản hơn, không cần useState cho form state
- **use() hook**: Đọc promises và context dễ dàng, không cần useEffect
- **useOptimistic**: Cập nhật UI ngay lập tức trước khi server confirm
- **Better hydration**: Ít lỗi hydration mismatch, performance tốt hơn
- **Improved error boundaries**: Xử lý lỗi tốt hơn

Trong dự án này, React 19 được dùng để tận dụng các cải tiến về performance và developer experience. Cần patch `@ant-design/v5-patch-for-react-19` để tương thích với Ant Design 5.

**Q: Tại sao dùng Vite thay vì Create React App?**

**A:** Vite nhanh hơn và hiện đại hơn nhiều:
- **Dev server**: 
  - Vite: Khởi động trong vài giây, HMR cực nhanh (chỉ update module thay đổi)
  - CRA: Khởi động 30-60 giây, HMR chậm (rebuild toàn bộ)
- **Build**:
  - Vite: Dùng Rollup, output tối ưu, tree-shaking tốt
  - CRA: Dùng Webpack, output lớn hơn, chậm hơn
- **Configuration**:
  - Vite: Zero config, dễ customize
  - CRA: Khó customize, phải eject (không khuyến khích)
- **Status**:
  - Vite: Đang được maintain tích cực
  - CRA: Đã deprecated (không còn được maintain)

**Q: Supabase là gì và tại sao chọn nó làm backend?**

**A:** Supabase là Backend-as-a-Service (BaaS), cung cấp đầy đủ backend services:

**Supabase cung cấp**:
- **PostgreSQL Database**: Database quan hệ mạnh mẽ với Row Level Security (RLS)
- **Authentication**: Email/password, OAuth, Magic Links, PKCE flow
- **Real-time**: WebSocket subscriptions cho live updates
- **Storage**: File storage (images, audio) tương tự AWS S3
- **Auto-generated APIs**: REST và GraphQL APIs tự động từ schema
- **Edge Functions**: Serverless functions (tương tự AWS Lambda)

**Lý do chọn**:
1. **Giảm thời gian phát triển**: Không cần tự build backend, database, auth từ đầu
2. **Security**: Row Level Security (RLS) bảo vệ data ở database level, không thể bypass
3. **Real-time**: Cập nhật access control, maintenance mode real-time không cần polling
4. **Cost-effective**: Free tier đủ cho MVP, pricing hợp lý khi scale
5. **Developer experience**: SDK tốt, documentation đầy đủ, dễ sử dụng
6. **Open source**: Có thể self-host nếu cần (Supabase là open source)

**Trong dự án này**:
- Auth: `authService.js` dùng Supabase Auth
- Database: Tables (profiles, books, lessons, exams, etc.) với RLS policies
- Storage: Avatar uploads, exam audio files
- Real-time: Access control sync, maintenance mode updates

**Q: IndexedDB vs localStorage - khi nào dùng cái nào?**

**A:** So sánh chi tiết:

| Tính năng | localStorage | IndexedDB |
|-----------|-------------|-----------|
| **Dung lượng** | 5-10MB | Hàng trăm MB đến GB |
| **Cấu trúc** | Key-value (chỉ string) | Object store (structured data) |
| **API** | Đồng bộ (blocking) | Bất đồng bộ (non-blocking) |
| **Query** | Không có | Có (indexes, cursors) |
| **Browser support** | Rộng rãi | Rộng rãi (IE10+) |
| **Performance** | Nhanh cho data nhỏ | Tốt cho data lớn |
| **Complexity** | Đơn giản | Phức tạp hơn |

**Khi nào dùng localStorage**:
- Dữ liệu nhỏ (<5MB): Settings, config, user preferences
- Cần truy cập nhanh: Auth tokens, language preference
- Dữ liệu đơn giản: Key-value pairs, không cần query
- Ví dụ trong dự án: `language`, `theme`, `accessControl` config

**Khi nào dùng IndexedDB**:
- Dữ liệu lớn (>10MB): Books, lessons, quizzes (có thể hàng trăm MB)
- Cần query: Tìm kiếm, filter, sort
- Structured data: JSON objects phức tạp
- Offline support: Cache để dùng khi không có internet
- Ví dụ trong dự án: Cache books, lessons, exams để load nhanh và offline

**Chiến lược trong dự án (multi-tier storage)**:
1. **Supabase (Cloud)**: Source of truth, sync giữa devices
2. **IndexedDB (Cache)**: Cache data lớn để load nhanh, offline support
3. **localStorage (Fallback)**: Settings, config nhỏ, cần truy cập nhanh

**Unified Interface**: Dự án có `localStorageManager.js` để tự động chọn storage phù hợp:
```javascript
// Component chỉ cần gọi:
const books = await storageManager.getBooks('n5');

// StorageManager tự động:
// 1. Try IndexedDB (nếu data lớn)
// 2. Fallback localStorage (nếu IndexedDB fail)
// 3. Fallback Supabase (nếu cả hai fail)
```

#### 1.2. Kiến trúc hệ thống
- **File**: `docs/ARCHITECTURE.md`
- **Nội dung**:
  - 3-layer architecture: Presentation → Application → Data
  - Storage strategy: Supabase (cloud) → IndexedDB (cache) → localStorage (fallback)
  - Data flow: Read/Write operations
  - Security: Authentication, Authorization, RLS

**Câu hỏi tự kiểm tra**:
- Tại sao cần 3 lớp storage? Lợi ích của mỗi lớp?
- Row Level Security (RLS) là gì? Hoạt động như thế nào?
- Real-time subscriptions hoạt động trên nguyên lý gì?

#### 1.3. Cấu trúc thư mục
- **Thực hành**: Duyệt qua toàn bộ cấu trúc thư mục `src/`
- **Quan sát**:
  - `components/` - UI components tái sử dụng
  - `features/` - Feature modules (books, jlpt)
  - `services/` - Business logic layer
  - `contexts/` - React Context providers
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `pages/` - Route-level pages

**Bài tập**:
1. Vẽ sơ đồ cấu trúc thư mục
2. Giải thích tại sao tổ chức như vậy (separation of concerns)

---

## 🚀 Giai Đoạn 2: Khởi Tạo & Entry Point

### Mục tiêu học tập
- Hiểu luồng khởi tạo ứng dụng từ khi browser load HTML
- Nắm được cách React render và mount vào DOM
- Hiểu Provider pattern và Context API

### Nội dung cần đọc

#### 2.1. HTML Entry Point
- **File**: `index.html`
- **Nội dung**:
  - Meta tags, viewport settings
  - Google Analytics integration
  - Google Fonts preload
  - Root div (`<div id="root">`)

**Câu hỏi**:
- Tại sao preload fonts? Lợi ích performance?
- Viewport-fit=cover dùng để làm gì?

#### 2.2. JavaScript Entry Point
- **File**: `src/main.jsx`
- **Nội dung**:
  - ReactDOM.createRoot() - React 18+ API
  - Provider hierarchy: ErrorBoundary → AuthProvider → LanguageProvider → ToastProvider → DictionaryProvider → RouterProvider
  - Lazy loading với React.lazy() và Suspense
  - Route configuration với React Router v7

**Phân tích chi tiết**:

```javascript
// Dòng 412-426: Provider hierarchy
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <DictionaryProvider>
              <RouterProvider router={router} />
            </DictionaryProvider>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Câu hỏi**:
- Tại sao thứ tự Provider quan trọng? (AuthProvider phải ở ngoài cùng)
- React.StrictMode làm gì? Tại sao dùng trong development?
- ErrorBoundary bắt lỗi ở đâu? Có bắt được lỗi trong event handlers không?

#### 2.3. Code Splitting & Lazy Loading
- **File**: `src/main.jsx` (dòng 17-75)
- **Nội dung**:
  - Critical pages: HomePage (load ngay)
  - Non-critical: Lazy load với `lazy(() => import(...))`
  - Suspense fallback: PageLoader component

**Câu hỏi**:
- Tại sao HomePage không lazy load?
- Lazy loading giúp gì cho performance?
- Suspense hoạt động như thế nào?

#### 2.4. Route Configuration
- **File**: `src/main.jsx` (dòng 177-408)
- **Nội dung**:
  - Route structure: Level routes, JLPT routes, Admin routes
  - Dynamic routes với `:levelId`, `:bookId`, etc.
  - Protected routes với `<ProtectedRoute>`
  - Access control với `<AccessGuard>`

**Phân tích**:
- Route matching order: Cụ thể hơn → Tổng quát hơn
- DynamicLevelPage: Switch case để chọn component theo levelId
- Nested routes: Admin và Editor có children routes

**Câu hỏi**:
- Tại sao route `/jlpt/:levelId/:examId/knowledge` phải đặt TRƯỚC `/jlpt/:levelId/:examId`?
- ProtectedRoute vs AccessGuard khác nhau như thế nào?

#### 2.5. App Component
- **File**: `src/App.jsx`
- **Nội dung**:
  - Layout structure: Header, Footer, Main content
  - Background image preloading
  - Maintenance mode check
  - Access control sync từ Supabase
  - JLPT Dictionary initialization

**Phân tích chi tiết**:

```javascript
// Dòng 119-130: Dictionary initialization
useEffect(() => {
  initJLPTDictionary()
    .then(() => console.log('✅ Dictionary loaded'))
    .catch((error) => console.error('❌ Failed:', error));
}, []); // Empty deps = run once on mount
```

**Câu hỏi**:
- Tại sao init dictionary trong App.jsx thay vì trong DictionaryProvider?
- Maintenance mode check mỗi 30s - tại sao không dùng real-time?
- Access control sync hoạt động như thế nào?

**Bài tập**:
1. Trace luồng từ khi browser load `index.html` đến khi HomePage render
2. Vẽ sơ đồ Provider hierarchy và giải thích data flow
3. Giải thích tại sao cần sync access control từ Supabase về localStorage

---

## 🔐 Giai Đoạn 3: Authentication & Authorization

### Mục tiêu học tập
- Hiểu cách Supabase Auth hoạt động
- Nắm được luồng đăng nhập/đăng ký
- Hiểu Role-Based Access Control (RBAC)
- Hiểu Row Level Security (RLS) policies

### Nội dung cần đọc

#### 3.1. Supabase Client Configuration
- **File**: `src/services/supabaseClient.js`
- **Nội dung**:
  - Khởi tạo Supabase client với URL và anon key
  - Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - isSupabaseConfigured() check

**Câu hỏi**:
- Anon key là gì? Có an toàn không khi expose trong client?
- Tại sao cần check `isSupabaseConfigured()`?

#### 3.2. Auth Service
- **File**: `src/services/authService.js`
- **Nội dung**:
  - `signUp()`: Đăng ký user mới
  - `signIn()`: Đăng nhập
  - `signOut()`: Đăng xuất
  - `getCurrentUser()`: Lấy user hiện tại
  - `getUserProfile()`: Lấy profile từ `profiles` table
  - `updateUserProfile()`: Cập nhật profile
  - `updatePassword()`: Đổi mật khẩu

**Phân tích chi tiết**:

```javascript
// signUp flow:
// 1. supabase.auth.signUp() → Tạo user trong Supabase Auth
// 2. Tự động trigger database function → Tạo profile trong `profiles` table
// 3. Return user + profile
```

**Câu hỏi**:
- Tại sao cần `profiles` table riêng? Không dùng trực tiếp từ `auth.users`?
- Database trigger tự động tạo profile - xem trong migrations
- Password hashing: Supabase làm ở đâu? (Server-side)

#### 3.3. Auth Context
- **File**: `src/contexts/AuthContext.jsx`
- **Nội dung**:
  - `AuthProvider`: Wrap toàn bộ app, quản lý auth state
  - `useAuth()`: Hook để access auth state
  - State: `user`, `profile`, `isLoading`, `isAuthenticated`
  - Methods: `login`, `logout`, `register`, `updateProfile`
  - Helpers: `isAdmin`, `isEditor`, `hasPermission`

**Phân tích**:

```javascript
// Dòng ~40-60: Session management
useEffect(() => {
  // Listen to auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session) {
        // Load profile from database
        const profile = await getUserProfile(session.user.id);
        setUser(session.user);
        setProfile(profile);
      } else {
        // Clear state
        setUser(null);
        setProfile(null);
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

**Câu hỏi**:
- `onAuthStateChange` trigger khi nào? (Login, logout, token refresh, etc.)
- Tại sao cần unsubscribe trong cleanup?
- Session được lưu ở đâu? (localStorage)

#### 3.4. Protected Routes
- **File**: `src/components/ProtectedRoute.jsx`
- **Nội dung**:
  - Check authentication
  - Check role (adminOnly, editorOnly)
  - Redirect to login nếu chưa auth

**Câu hỏi**:
- Tại sao cần ProtectedRoute ở frontend? Backend đã có RLS rồi mà?
- (Trả lời: UX - redirect ngay, không cần đợi API call fail)

#### 3.5. Access Control
- **File**: `src/components/AccessGuard.jsx`
- **File**: `src/services/accessControlService.js`
- **Nội dung**:
  - Module-level access: Level system, JLPT exams
  - Level-level access: N1, N2, N3, N4, N5
  - Config từ Supabase: `app_settings` table
  - Real-time sync với `subscribeToAccessControl()`

**Phân tích**:

```javascript
// Access control config structure:
{
  levelConfigs: {
    n5: { public: true, requireLogin: false },
    n4: { public: false, requireLogin: true },
    n3: { public: false, requireLogin: true, premium: true }
  },
  jlptConfigs: { ... },
  levelModuleConfig: { enabled: true, maintenanceMode: false },
  jlptModuleConfig: { enabled: true, maintenanceMode: false }
}
```

**Câu hỏi**:
- Tại sao sync access control về localStorage? (Performance - không cần query mỗi lần)
- Real-time subscription hoạt động như thế nào? (Supabase Realtime)

#### 3.6. Row Level Security (RLS)
- **File**: `migrations/*.sql`
- **Nội dung**:
  - RLS policies trên các tables
  - Policies cho SELECT, INSERT, UPDATE, DELETE
  - Role-based policies: admin, editor, user

**Câu hỏi**:
- RLS policies được evaluate ở đâu? (Database level)
- Tại sao RLS quan trọng hơn frontend checks? (Security - không thể bypass)

**Bài tập**:
1. Trace luồng đăng ký từ UI → AuthService → Supabase → Database trigger → Profile creation
2. Vẽ sơ đồ authentication flow
3. Giải thích tại sao cần cả frontend guards và RLS policies
4. Tìm và đọc RLS policies trong migrations, giải thích từng policy

---

## 🧭 Giai Đoạn 4: Routing & Navigation

### Mục tiêu học tập
- Hiểu React Router v7 hoạt động như thế nào
- Nắm được nested routes và route guards
- Hiểu code splitting với lazy loading

### Nội dung cần đọc

#### 4.1. Router Configuration
- **File**: `src/main.jsx` (dòng 177-408)
- **Nội dung**:
  - `createBrowserRouter()`: Khởi tạo router
  - Route structure: Flat routes với nested children
  - Route params: `:levelId`, `:bookId`, `:chapterId`, etc.

**Phân tích**:

```javascript
// Route structure:
/ (App component)
├── / (HomePage)
├── /level (LevelPage)
├── /level/:levelId (DynamicLevelPage)
│   ├── /level/:levelId/:bookId (BookDetailPage)
│   └── /level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId (LessonPage)
├── /jlpt (JLPTPage)
├── /dashboard (UserDashboard)
└── /admin (AdminLayout - nested routes)
    ├── /admin (AdminDashboardPage)
    ├── /admin/users (UsersManagementPage)
    └── ...
```

**Câu hỏi**:
- `createBrowserRouter` vs `createHashRouter` - khác nhau gì?
- Tại sao dùng nested routes cho Admin? (Layout chung)

#### 4.2. Dynamic Routes
- **File**: `src/main.jsx` (dòng 124-175)
- **Nội dung**:
  - `DynamicLevelPage`: Switch case để chọn component theo levelId
  - `DynamicJLPTLevelPage`: Tương tự cho JLPT

**Câu hỏi**:
- Tại sao không dùng route `/level/:levelId` trực tiếp với component?
- (Trả lời: Cần AccessGuard wrapper, và có thể có logic khác)

#### 4.3. Route Guards
- **File**: `src/components/ProtectedRoute.jsx`
- **File**: `src/components/AccessGuard.jsx`
- **Nội dung**:
  - ProtectedRoute: Check auth + role
  - AccessGuard: Check module/level access

**Phân tích**:

```javascript
// AccessGuard usage:
<AccessGuard module="level" levelId="n5">
  <LevelN5Page />
</AccessGuard>

// Inside AccessGuard:
// 1. Check module enabled
// 2. Check level access (public, requireLogin, premium)
// 3. Check user permissions
// 4. Render children or AccessDenied
```

**Câu hỏi**:
- Tại sao cần cả ProtectedRoute và AccessGuard?
- AccessGuard check ở đâu? (localStorage + Supabase)

#### 4.4. Navigation Components
- **File**: `src/components/Header.jsx`
- **Nội dung**:
  - Navigation links với React Router `Link`
  - Active route highlighting
  - User menu với role-based items

**Câu hỏi**:
- `Link` vs `<a>` tag - khác nhau gì?
- Tại sao dùng `useLocation()` để check active route?

**Bài tập**:
1. Vẽ sơ đồ route tree với tất cả routes
2. Trace navigation từ HomePage → Level N5 → Book → Lesson
3. Giải thích cách AccessGuard hoạt động khi user navigate

---

## 💾 Giai Đoạn 5: Storage Layer

### Mục tiêu học tập
- Hiểu multi-tier storage strategy
- Nắm được IndexedDB API và cách sử dụng
- Hiểu localStorage limitations và fallback strategy
- Hiểu sync mechanism giữa cloud và local

### Nội dung cần đọc

#### 5.1. Storage Strategy Overview
- **File**: `docs/ARCHITECTURE.md` (dòng 75-116)
- **Nội dung**:
  - Priority: Supabase (cloud) → IndexedDB (cache) → localStorage (fallback)
  - Read: Check local first, fallback to cloud
  - Write: Save to cloud, then cache locally

**Câu hỏi**:
- Tại sao cần 3 lớp storage?
- IndexedDB capacity? (Không giới hạn, nhưng browser có thể xóa)
- localStorage limit? (5-10MB)

#### 5.2. IndexedDB Manager
- **File**: `src/utils/indexedDBManager.js`
- **Nội dung**:
  - Khởi tạo database và object stores
  - CRUD operations: get, set, delete
  - Schema: books, chapters, lessons, quizzes, exams

**Phân tích**:

```javascript
// IndexedDB schema:
const DB_NAME = 'jlpt_elearning_db';
const DB_VERSION = 1;

const stores = {
  books: { keyPath: ['level', 'id'] },
  chapters: { keyPath: ['bookId', 'level', 'id'] },
  lessons: { keyPath: ['bookId', 'chapterId', 'level', 'id'] },
  quizzes: { keyPath: ['bookId', 'chapterId', 'lessonId', 'level'] },
  exams: { keyPath: ['level', 'examId'] }
};
```

**Câu hỏi**:
- KeyPath là gì? Composite key `['level', 'id']` nghĩa là gì?
- IndexedDB transactions - tại sao cần?
- Async API - tại sao không đồng bộ?

#### 5.3. IndexedDB Helpers
- **File**: `src/utils/indexedDBHelpers.js`
- **Nội dung**:
  - Wrapper functions cho IndexedDB operations
  - Error handling và retry logic
  - Batch operations

**Câu hỏi**:
- Tại sao cần wrapper? (Simplify API, error handling)

#### 5.4. LocalStorage Manager
- **File**: `src/utils/localStorageManager.js`
- **Nội dung**:
  - Unified interface cho tất cả storage operations
  - Automatic fallback: IndexedDB → localStorage
  - Export/Import functionality
  - Storage info (size, count)

**Phân tích**:

```javascript
// Unified API:
await storageManager.getBooks('n5');
// 1. Try IndexedDB
// 2. If fail, try localStorage
// 3. If fail, return null

await storageManager.saveBooks('n5', books, userId);
// 1. Save to Supabase (if userId)
// 2. Save to IndexedDB
// 3. Save to localStorage (fallback)
```

**Câu hỏi**:
- Tại sao cần unified interface?
- Khi nào dùng IndexedDB vs localStorage?

#### 5.5. Secure Storage
- **File**: `src/utils/secureStorage.js`
- **File**: `src/utils/secureUserStorage.js`
- **Nội dung**:
  - Encryption cho sensitive data (passwords, tokens)
  - Migration từ plaintext → encrypted
  - Secure key management

**Câu hỏi**:
- Encryption key được lưu ở đâu? (localStorage - có an toàn không?)
- Tại sao cần encrypt passwords trong localStorage? (Defense in depth)

#### 5.6. Data Sync Service
- **File**: `src/services/dataSyncService.js`
- **Nội dung**:
  - Sync từ Supabase → IndexedDB
  - Conflict resolution
  - Background sync

**Câu hỏi**:
- Conflict resolution: Server wins hay Client wins?
- Background sync hoạt động như thế nào? (Service Worker?)

**Bài tập**:
1. Trace luồng đọc books: Component → storageManager → IndexedDB/localStorage → Supabase
2. Vẽ sơ đồ storage layers và data flow
3. Implement một function để migrate data từ localStorage sang IndexedDB
4. Giải thích tại sao cần encrypt sensitive data trong client storage

---

## 🔧 Giai Đoạn 6: Services Layer

### Mục tiêu học tập
- Hiểu Service pattern và separation of concerns
- Nắm được cách các services tương tác với Supabase
- Hiểu error handling pattern
- Hiểu real-time subscriptions

### Nội dung cần đọc

#### 6.1. Service Pattern Overview
- **File**: `docs/API_SERVICES.md`
- **Nội dung**:
  - Consistent return format: `{ success, data, error }`
  - Error handling pattern
  - Service organization

**Câu hỏi**:
- Tại sao cần consistent return format?
- Service pattern vs direct Supabase calls - lợi ích?

#### 6.2. Auth Service
- **File**: `src/services/authService.js`
- **Đã học ở Giai đoạn 3**, nhưng cần đọc lại để hiểu service pattern

#### 6.3. Content Service
- **File**: `src/services/contentService.js`
- **Nội dung**:
  - CRUD cho books, chapters, lessons, quizzes
  - Supabase queries với RLS
  - Batch operations

**Phân tích**:

```javascript
// Get books:
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('level', level)
  .order('order_index');

// RLS policy tự động filter theo user permissions
```

**Câu hỏi**:
- Tại sao không cần check permissions trong service? (RLS làm rồi)
- Batch operations: Insert nhiều records cùng lúc - lợi ích?

#### 6.4. Exam Service
- **File**: `src/services/examService.js`
- **Nội dung**:
  - Get exams by level
  - Get exam detail
  - Save exam (admin only)
  - Exam results storage

**Câu hỏi**:
- Exam questions được lưu ở đâu? (JSONB column trong PostgreSQL)
- Tại sao dùng JSONB thay vì normalized tables?

#### 6.5. Access Control Service
- **File**: `src/services/accessControlService.js`
- **Nội dung**:
  - Get access control config từ Supabase
  - Save access control (admin only)
  - Real-time subscription với `subscribeToAccessControl()`

**Phân tích**:

```javascript
// Real-time subscription:
const subscription = supabase
  .channel('access_control_changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'app_settings',
      filter: 'key=eq.access_control'
    },
    (payload) => {
      // Update localStorage
      // Dispatch event to components
    }
  )
  .subscribe();
```

**Câu hỏi**:
- Real-time subscription hoạt động như thế nào? (WebSocket)
- Tại sao cần filter `key=eq.access_control`?

#### 6.6. App Settings Service
- **File**: `src/services/appSettingsService.js`
- **Nội dung**:
  - Get/set app settings (maintenance mode, etc.)
  - Global settings vs user settings

**Câu hỏi**:
- Settings được lưu ở đâu? (`app_settings` table)
- Tại sao cần poll maintenance mode mỗi 30s thay vì real-time?

#### 6.7. SRS Algorithm Service
- **File**: `src/services/srsAlgorithm.js`
- **Nội dung**:
  - SuperMemo SM-2 algorithm implementation
  - Calculate next review date
  - Card state management (new, learning, review, graduated)
  - Ease factor calculation

**Phân tích chi tiết**:

```javascript
// SM-2 Algorithm:
// Ease factor adjustment:
newEF = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))

// Interval calculation:
if (repetition === 1) interval = 1 day
if (repetition === 2) interval = 6 days
if (repetition > 2) interval = previousInterval * easeFactor

// Card states:
// - new: Never studied
// - learning: <3 repetitions
// - review: >=3 repetitions
// - graduated: interval >21 days
```

**Câu hỏi**:
- SM-2 algorithm là gì? Tại sao dùng nó?
- Ease factor điều chỉnh như thế nào?
- Tại sao cần card states?

#### 6.8. Learning Progress Service
- **File**: `src/services/learningProgressService.js`
- **Nội dung**:
  - Track lesson completion
  - Save progress to Supabase
  - Get user progress

**Câu hỏi**:
- Progress được lưu ở đâu? (`lesson_completions` table)
- Tại sao cần track progress? (Resume learning, analytics)

#### 6.9. File Upload Service
- **File**: `src/services/fileUploadService.js`
- **Nội dung**:
  - Upload files to Supabase Storage
  - Image optimization
  - Avatar upload

**Câu hỏi**:
- Supabase Storage là gì? (Object storage như S3)
- Tại sao cần optimize images? (Performance)

**Bài tập**:
1. Trace một service call từ component → service → Supabase → response
2. Implement một service mới cho notifications
3. Giải thích SM-2 algorithm với ví dụ cụ thể
4. Vẽ sơ đồ real-time subscription flow

---

## 📚 Giai Đoạn 7: Features - Level System

### Mục tiêu học tập
- Hiểu cấu trúc phân cấp: Level → Books → Chapters → Lessons → Quizzes
- Nắm được cách render và navigate qua các levels
- Hiểu lesson types và quiz question types
- Hiểu progress tracking

### Nội dung cần đọc

#### 7.1. Level System Overview
- **File**: `docs/FEATURES.md` (dòng 5-34)
- **Nội dung**:
  - Hierarchy: Level → Books → Chapters → Lessons → Quizzes
  - Lesson types: theory, flashcard, quiz, mixed
  - Quiz question types: multiple choice, fill in blank, matching, ordering

**Câu hỏi**:
- Tại sao cần hierarchy này?
- Lesson types khác nhau render như thế nào?

#### 7.2. Level Pages
- **File**: `src/features/books/pages/LevelPage.jsx`
- **File**: `src/features/books/pages/LevelN5Page.jsx` (và N1-N4)
- **Nội dung**:
  - Hiển thị danh sách levels (N1-N5)
  - Level cards với progress indicators
  - Navigation to level detail

**Phân tích**:
- LevelN5Page load books từ đâu? (Supabase → IndexedDB cache)
- Progress calculation: Completed lessons / Total lessons

**Câu hỏi**:
- Tại sao có cả LevelPage và LevelN5Page riêng?
- Progress được tính như thế nào?

#### 7.3. Book Detail Page
- **File**: `src/features/books/pages/BookDetailPage.jsx`
- **Nội dung**:
  - Hiển thị book info và chapters
  - Chapter navigation
  - Chapter progress

**Câu hỏi**:
- Book data structure như thế nào?
- Chapter order được quản lý như thế nào? (`order_index`)

#### 7.4. Lesson Page
- **File**: `src/features/books/pages/LessonPage.jsx`
- **Nội dung**:
  - Render lesson content theo type (theory, flashcard, quiz)
  - Rich text rendering cho theory lessons
  - Flashcard component
  - Quiz integration
  - Progress tracking

**Phân tích chi tiết**:

```javascript
// Lesson types:
switch (lesson.type) {
  case 'theory':
    return <RichTextContent content={lesson.content} />;
  case 'flashcard':
    return <FlashcardComponent cards={lesson.cards} />;
  case 'quiz':
    return <QuizComponent quiz={lesson.quiz} />;
  case 'mixed':
    return <MixedLessonContent lesson={lesson} />;
}
```

**Câu hỏi**:
- Rich text content được lưu ở đâu? (JSON hoặc HTML string)
- Flashcard component hoạt động như thế nào?
- Progress được mark complete khi nào?

#### 7.5. Quiz Page
- **File**: `src/features/books/pages/QuizPage.jsx`
- **Nội dung**:
  - Render quiz questions
  - Handle user answers
  - Calculate score
  - Show results

**Phân tích**:

```javascript
// Quiz question structure:
{
  id: 'q1',
  type: 'multiple_choice', // or 'fill_blank', 'matching', 'ordering'
  question: 'What is こんにちは?',
  options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
  correctAnswer: 0,
  explanation: 'こんにちは means Hello in Japanese'
}
```

**Câu hỏi**:
- Score calculation như thế nào?
- Quiz results được lưu ở đâu? (`quiz_results` table)

#### 7.6. Book Components
- **File**: `src/features/books/components/BookCard.jsx`
- **Nội dung**:
  - Book card UI
  - Progress visualization
  - Navigation

**Câu hỏi**:
- BookCard được dùng ở đâu?
- Progress visualization: Progress bar vs percentage?

#### 7.7. Data Structure
- **File**: `src/data/level/n5/books.js`
- **File**: `src/data/level/n5/books-metadata.js`
- **Nội dung**:
  - Static data structure cho N5
  - Book metadata

**Câu hỏi**:
- Tại sao có static data? (Fallback khi Supabase không available?)
- Data structure: JSON format

**Bài tập**:
1. Trace luồng từ LevelPage → BookDetailPage → LessonPage → QuizPage
2. Implement một lesson type mới (ví dụ: video)
3. Vẽ sơ đồ data structure cho Level System
4. Giải thích cách progress tracking hoạt động

---

## 📝 Giai Đoạn 8: Features - JLPT Exam

### Mục tiêu học tập
- Hiểu cấu trúc JLPT exam (Knowledge + Listening sections)
- Nắm được exam flow và timing
- Hiểu scoring system
- Hiểu answer explanations

### Nội dung cần đọc

#### 8.1. JLPT Exam Overview
- **File**: `docs/FEATURES.md` (dòng 35-64)
- **Nội dung**:
  - Exam structure: Knowledge Section + Listening Section
  - Knowledge: Vocabulary, Grammar, Reading
  - Listening: Audio-based questions
  - Timing simulation
  - Auto-save progress

**Câu hỏi**:
- Tại sao chia thành 2 sections?
- Timing simulation hoạt động như thế nào?

#### 8.2. JLPT Pages
- **File**: `src/features/jlpt/pages/JLPTPage.jsx`
- **File**: `src/features/jlpt/pages/JLPTLevelN5Page.jsx` (và N1-N4)
- **Nội dung**:
  - Hiển thị danh sách exams cho level
  - Exam cards với metadata (year, month)
  - Navigation to exam detail

**Câu hỏi**:
- Exam metadata: Year, month - tại sao cần?
- Exam list được load từ đâu?

#### 8.3. Exam Detail Page
- **File**: `src/features/jlpt/pages/JLPTExamDetailPage.jsx`
- **Nội dung**:
  - Exam overview
  - Instructions
  - Start exam button
  - Previous results (nếu có)

**Câu hỏi**:
- Exam instructions: Có thể customize không?
- Previous results: Lưu ở đâu?

#### 8.4. Knowledge Section Page
- **File**: `src/features/jlpt/pages/ExamKnowledgePage.jsx`
- **Nội dung**:
  - Render knowledge questions (Vocabulary, Grammar, Reading)
  - Section navigation
  - Timer
  - Auto-save answers
  - Submit section

**Phân tích chi tiết**:

```javascript
// Question structure:
{
  id: 'q1',
  section: 'vocabulary', // or 'grammar', 'reading'
  question: '...',
  options: [...],
  correctAnswer: 0,
  explanation: '...'
}

// Auto-save:
useEffect(() => {
  const timer = setInterval(() => {
    saveAnswersToLocalStorage(answers);
  }, 30000); // Every 30 seconds
  return () => clearInterval(timer);
}, [answers]);
```

**Câu hỏi**:
- Timer hoạt động như thế nào? (useState + useEffect)
- Auto-save: Lưu ở đâu? (localStorage)
- Section navigation: Có thể quay lại section trước không?

#### 8.5. Listening Section Page
- **File**: `src/features/jlpt/pages/ExamListeningPage.jsx`
- **Nội dung**:
  - Audio playback
  - Listening questions
  - Audio controls (play, pause, replay)
  - Submit section

**Câu hỏi**:
- Audio files được lưu ở đâu? (Supabase Storage)
- Audio playback: HTML5 Audio API?
- Tại sao cần replay button?

#### 8.6. Exam Result Page
- **File**: `src/features/jlpt/pages/JLPTExamResultPage.jsx`
- **Nội dung**:
  - Calculate total score
  - Show pass/fail
  - Section scores breakdown
  - Navigation to answers page

**Phân tích**:

```javascript
// Scoring:
const knowledgeScore = calculateSectionScore(knowledgeAnswers, knowledgeQuestions);
const listeningScore = calculateSectionScore(listeningAnswers, listeningQuestions);
const totalScore = knowledgeScore + listeningScore;

// Pass criteria (example):
const passScore = {
  n5: 80, // out of 180
  n4: 90,
  // ...
};
const passed = totalScore >= passScore[level];
```

**Câu hỏi**:
- Scoring algorithm: Đúng = 1 điểm, sai = 0 điểm?
- Pass criteria: Dựa trên JLPT official criteria?

#### 8.7. Exam Answers Page
- **File**: `src/features/jlpt/pages/ExamAnswersPage.jsx`
- **Nội dung**:
  - Show all questions với user answers
  - Highlight correct/incorrect answers
  - Show explanations
  - Review mode

**Câu hỏi**:
- Answers page: Chỉ xem được sau khi submit?
- Explanations: Có thể customize không?

#### 8.8. Exam Service
- **File**: `src/services/examService.js`
- **Đã học ở Giai đoạn 6**, nhưng cần đọc lại với focus vào exam operations

#### 8.9. Exam Results Service
- **File**: `src/services/examResultsService.js`
- **Nội dung**:
  - Save exam results
  - Get user exam history
  - Statistics

**Câu hỏi**:
- Exam results được lưu ở đâu? (`exam_results` table)
- Statistics: Average score, pass rate, etc.

**Bài tập**:
1. Trace luồng từ JLPTPage → ExamDetail → Knowledge → Listening → Result → Answers
2. Implement timer với pause/resume functionality
3. Vẽ sơ đồ exam data structure
4. Giải thích scoring algorithm chi tiết

---

## 📊 Giai Đoạn 9: Dashboard & SRS

### Mục tiêu học tập
- Hiểu Dashboard structure và components
- Nắm được SRS (Spaced Repetition System) hoạt động như thế nào
- Hiểu progress tracking và statistics
- Hiểu streak system

### Nội dung cần đọc

#### 9.1. Dashboard Overview
- **File**: `docs/FEATURES.md` (dòng 101-111)
- **Nội dung**:
  - Progress overview
  - Due reviews (SRS)
  - Statistics
  - Activity feed
  - Streak counter

**Câu hỏi**:
- Dashboard data được load từ đâu?
- Real-time updates: Có cần không?

#### 9.2. User Dashboard
- **File**: `src/pages/UserDashboard.jsx`
- **Nội dung**:
  - Dashboard layout
  - Progress cards
  - Due reviews widget
  - Statistics charts
  - Activity feed
  - Streak counter

**Phân tích**:

```javascript
// Dashboard data:
const {
  progress,        // Overall progress
  dueReviews,      // SRS cards due
  statistics,      // Learning stats
  activities,      // Recent activities
  streak           // Current streak
} = useDashboardData();
```

**Câu hỏi**:
- `useDashboardData()`: Custom hook? Implement như thế nào?
- Progress calculation: Dựa trên lesson completions?

#### 9.3. Dashboard Access Guard
- **File**: `src/components/DashboardAccessGuard.jsx`
- **Nội dung**:
  - Check dashboard access permission
  - Redirect nếu không có quyền

**Câu hỏi**:
- Dashboard access: Cần login không?
- Access control: Module-level hay user-level?

#### 9.4. SRS Widget
- **File**: `src/components/SRSWidget.jsx`
- **Nội dung**:
  - Show due cards count
  - Quick review button
  - Card statistics

**Câu hỏi**:
- Due cards: Tính như thế nào? (SRS algorithm)
- Quick review: Navigate đến đâu?

#### 9.5. Flashcard Review Page
- **File**: `src/pages/FlashcardReviewPage.jsx`
- **Nội dung**:
  - Render flashcards
  - Show front/back
  - Grade user response (Again, Hard, Good, Easy)
  - Update SRS progress
  - Navigate to next card

**Phân tích chi tiết**:

```javascript
// SRS Review Flow:
// 1. Load due cards
// 2. Show card front
// 3. User clicks "Show Answer"
// 4. User grades: Again (0), Hard (2), Good (3), Easy (4)
// 5. Calculate next review date (SRS algorithm)
// 6. Update card progress
// 7. Move to next card
```

**Câu hỏi**:
- Card front/back: Lưu ở đâu? (Flashcard data structure)
- Grade buttons: Tại sao có 4 levels?
- Next review date: Tính như thế nào? (SM-2 algorithm)

#### 9.6. SRS Algorithm
- **File**: `src/services/srsAlgorithm.js`
- **Đã học ở Giai đoạn 6**, nhưng cần đọc lại với focus vào SRS

#### 9.7. Statistics Dashboard
- **File**: `src/pages/StatisticsDashboard.jsx`
- **Nội dung**:
  - Learning statistics charts
  - Progress over time
  - Card statistics (new, learning, review, graduated)
  - Retention rate

**Câu hỏi**:
- Statistics data: Tính real-time hay cached?
- Charts: Dùng library gì? (Có thể là Chart.js hoặc Recharts)

#### 9.8. Streak Counter
- **File**: `src/components/StreakCounter.jsx`
- **Nội dung**:
  - Calculate daily streak
  - Display streak count
  - Streak notifications

**Phân tích**:

```javascript
// Streak calculation:
// 1. Get last activity date
// 2. Check if activity today
// 3. If yes: streak continues
// 4. If no: streak resets
// 5. If gap > 1 day: streak breaks
```

**Câu hỏi**:
- Streak data: Lưu ở đâu?
- Streak notification: Khi nào trigger?

#### 9.9. Activity Logger
- **File**: `src/utils/activityLogger.js`
- **Nội dung**:
  - Log user activities (lesson completed, exam taken, etc.)
  - Save to Supabase
  - Query activities for feed

**Câu hỏi**:
- Activity log: Lưu ở đâu? (`user_activities` table)
- Activity feed: Hiển thị bao nhiêu activities?

**Bài tập**:
1. Trace SRS review flow: Dashboard → FlashcardReview → Grade → Update → Next
2. Implement streak calculation với edge cases (timezone, etc.)
3. Vẽ sơ đồ SRS card states và transitions
4. Giải thích SM-2 algorithm với ví dụ cụ thể

---

## 👨‍💼 Giai Đoạn 10: Admin Panel

### Mục tiêu học tập
- Hiểu Admin Panel structure và navigation
- Nắm được CRUD operations cho content
- Hiểu user management
- Hiểu access control configuration
- Hiểu exam management

### Nội dung cần đọc

#### 10.1. Admin Panel Overview
- **File**: `docs/FEATURES.md` (dòng 128-209)
- **Nội dung**:
  - Content Management (CRUD)
  - Exam Management
  - User Management
  - Access Control
  - Settings
  - Notifications

**Câu hỏi**:
- Admin Panel: Chỉ admin mới access?
- Editor role: Có quyền gì?

#### 10.2. Admin Layout
- **File**: `src/components/admin/AdminLayout.jsx`
- **Nội dung**:
  - Admin sidebar navigation
  - Admin header
  - Protected routes
  - Role-based menu items

**Câu hỏi**:
- Admin Layout: Dùng ở đâu? (Wrap admin routes)
- Sidebar: Responsive? (Mobile menu?)

#### 10.3. Admin Dashboard
- **File**: `src/pages/admin/AdminDashboardPage.jsx`
- **Nội dung**:
  - System overview
  - Statistics (users, content, exams)
  - Recent activities
  - Quick actions

**Câu hỏi**:
- Dashboard statistics: Real-time hay cached?
- Quick actions: Những gì?

#### 10.4. Content Management
- **File**: `src/pages/admin/ContentManagementPage.jsx`
- **File**: `src/components/admin/content/*.jsx`
- **Nội dung**:
  - CRUD cho books, chapters, lessons, quizzes
  - Rich text editor cho lesson content
  - File upload (images, audio)
  - Preview mode

**Phân tích chi tiết**:

```javascript
// Content CRUD Flow:
// 1. List content (books/chapters/lessons)
// 2. Create/Edit form
// 3. Rich text editor (ContentEditable component)
// 4. Save to Supabase
// 5. Invalidate cache (IndexedDB)
// 6. Show success/error
```

**Câu hỏi**:
- Rich text editor: Dùng library gì? (Có thể là custom ContentEditable)
- File upload: Supabase Storage?
- Preview mode: Render như user sẽ thấy?

#### 10.5. Quiz Editor
- **File**: `src/pages/admin/QuizEditorPage.jsx`
- **Nội dung**:
  - Create/edit quiz questions
  - Question types: multiple choice, fill blank, matching, ordering
  - Question ordering
  - Preview quiz

**Câu hỏi**:
- Quiz editor: Drag & drop để reorder?
- Question validation: Required fields?

#### 10.6. Exam Management
- **File**: `src/pages/admin/ExamManagementPage.jsx`
- **Nội dung**:
  - Create/edit JLPT exams
  - Add questions by section (Vocabulary, Grammar, Reading, Listening)
  - Configure timing
  - Preview exam

**Câu hỏi**:
- Exam questions: Import từ file không?
- Timing configuration: Per section hay total?

#### 10.7. User Management
- **File**: `src/pages/admin/UsersManagementPage.jsx`
- **File**: `src/hooks/useUserManagement.jsx`
- **File**: `src/services/userManagementService.js`
- **Nội dung**:
  - List all users
  - Change user role (admin/editor/user)
  - Ban/unban users
  - Delete users
  - User statistics

**Câu hỏi**:
- User deletion: Soft delete hay hard delete?
- Ban user: Block login hay chỉ hide content?

#### 10.8. Access Control Management
- **File**: `src/pages/admin/NewControlPage.jsx`
- **File**: `src/services/accessControlService.js`
- **Nội dung**:
  - Configure level access (N1-N5)
  - Configure module access (Level system, JLPT)
  - Public/Login required/Premium settings
  - Real-time sync

**Phân tích**:

```javascript
// Access Control Config:
{
  levelConfigs: {
    n5: { public: true, requireLogin: false },
    n4: { public: false, requireLogin: true },
    n3: { public: false, requireLogin: true, premium: true }
  },
  jlptConfigs: { ... },
  levelModuleConfig: { enabled: true, maintenanceMode: false },
  jlptModuleConfig: { enabled: true, maintenanceMode: false }
}
```

**Câu hỏi**:
- Access control: Lưu ở đâu? (`app_settings` table)
- Real-time sync: Tất cả users nhận update ngay?

#### 10.9. Settings Page
- **File**: `src/pages/admin/SettingsPage.jsx`
- **File**: `src/services/appSettingsService.js`
- **Nội dung**:
  - Maintenance mode toggle
  - System settings
  - Exam default settings

**Câu hỏi**:
- Maintenance mode: Global hay per-module?
- Settings: Lưu ở đâu?

#### 10.10. Notification Management
- **File**: `src/pages/admin/NotificationManagementPage.jsx`
- **Nội dung**:
  - Create announcements
  - Target users (all, specific, role-based)
  - Set expiration dates
  - Notification display

**Câu hỏi**:
- Notifications: Lưu ở đâu?
- Display: Toast notification hay banner?

#### 10.11. Export/Import
- **File**: `src/pages/admin/ExportImportPage.jsx`
- **Nội dung**:
  - Export all content
  - Export by level
  - Import content
  - Backup/restore

**Câu hỏi**:
- Export format: JSON?
- Import: Validation?

**Bài tập**:
1. Trace CRUD flow: List → Create → Edit → Delete
2. Implement một content type mới (ví dụ: videos)
3. Vẽ sơ đồ admin panel navigation
4. Giải thích access control configuration và real-time sync

---

## 🛠️ Giai Đoạn 11: Utilities & Helpers

### Mục tiêu học tập
- Hiểu các utility functions và helpers
- Nắm được validation, error handling, logging
- Hiểu i18n (internationalization)
- Hiểu UI helpers

### Nội dung cần đọc

#### 11.1. Validation Utilities
- **File**: `src/utils/validation.js`
- **File**: `src/utils/emailValidator.js`
- **Nội dung**:
  - Email validation
  - Form validation helpers
  - Input sanitization

**Câu hỏi**:
- Email validation: Regex pattern?
- Input sanitization: Prevent XSS?

#### 11.2. Error Handling
- **File**: `src/utils/sanitizeError.js`
- **File**: `src/utils/uiErrorHandler.js`
- **File**: `src/components/ErrorBoundary.jsx`
- **Nội dung**:
  - Error sanitization (hide sensitive info)
  - UI error display
  - Error boundary for React errors

**Câu hỏi**:
- Error sanitization: Tại sao cần?
- Error boundary: Bắt được lỗi gì? (Render errors, không bắt event handlers)

#### 11.3. Logging
- **File**: `src/utils/logger.js`
- **File**: `src/utils/debugLogger.js`
- **Nội dung**:
  - Console logging với levels (debug, info, warn, error)
  - Debug console filter
  - Production logging

**Câu hỏi**:
- Logging levels: Khi nào dùng level nào?
- Debug filter: Ẩn logs trong production?

#### 11.4. Internationalization (i18n)
- **File**: `src/contexts/LanguageContext.jsx`
- **File**: `src/translations/vi.js`, `en.js`, `ja.js`
- **File**: `src/translations/index.js`
- **Nội dung**:
  - Language switching
  - Translation function `t(key)`
  - Translation files structure

**Phân tích**:

```javascript
// Translation structure:
{
  common: {
    welcome: 'Chào mừng',
    login: 'Đăng nhập',
    // ...
  },
  level: {
    n5: 'N5',
    // ...
  }
}

// Usage:
const { t } = useLanguage();
<h1>{t('common.welcome')}</h1>
```

**Câu hỏi**:
- Translation keys: Nested structure - tại sao?
- Language switching: Lưu preference ở đâu?

#### 11.5. Storage Helpers
- **File**: `src/utils/localStorageManager.js` (đã học ở Giai đoạn 5)
- **File**: `src/utils/indexedDBHelpers.js` (đã học ở Giai đoạn 5)
- **File**: `src/utils/indexedDBManager.js` (đã học ở Giai đoạn 5)

#### 11.6. Settings Manager
- **File**: `src/utils/settingsManager.js`
- **Nội dung**:
  - Get/set app settings
  - Settings persistence
  - Settings events

**Câu hỏi**:
- Settings: Lưu ở đâu? (localStorage)
- Settings events: CustomEvent để notify components?

#### 11.7. Activity Logger
- **File**: `src/utils/activityLogger.js`
- **Nội dung**:
  - Log user activities
  - Save to Supabase
  - Query activities

**Câu hỏi**:
- Activity log: Tất cả actions đều log?
- Performance: Logging có ảnh hưởng performance không?

#### 11.8. Analytics Tracker
- **File**: `src/utils/analyticsTracker.js`
- **Nội dung**:
  - Track user events
  - Google Analytics integration
  - Vercel Analytics

**Câu hỏi**:
- Analytics events: Track những gì?
- Privacy: Có track PII không?

#### 11.9. Badge System
- **File**: `src/utils/badgeSystem.js`
- **Nội dung**:
  - Achievement badges
  - Badge unlocking logic
  - Badge display

**Câu hỏi**:
- Badges: Có những loại gì?
- Badge unlocking: Trigger khi nào?

#### 11.10. Notification Manager
- **File**: `src/utils/notificationManager.js`
- **File**: `src/components/ToastNotification.jsx`
- **Nội dung**:
  - Toast notifications
  - Notification queue
  - Auto-dismiss

**Câu hỏi**:
- Toast notifications: Library hay custom?
- Notification queue: Limit số lượng?

#### 11.11. Rich Text Editor Utils
- **File**: `src/utils/richTextEditorUtils.js`
- **File**: `src/components/ContentEditable.jsx`
- **Nội dung**:
  - Rich text editing
  - HTML sanitization
  - Formatting helpers

**Câu hỏi**:
- Rich text: HTML hay Markdown?
- HTML sanitization: Prevent XSS?

#### 11.12. Progress Tracker
- **File**: `src/utils/lessonProgressTracker.js`
- **File**: `src/services/progressTracker.js`
- **Nội dung**:
  - Track lesson progress
  - Calculate completion percentage
  - Progress persistence

**Câu hỏi**:
- Progress tracking: Real-time hay batch?
- Completion criteria: 100% hay có threshold?

**Bài tập**:
1. Implement một utility function mới (ví dụ: date formatter)
2. Trace error handling flow: Error → Sanitize → Display
3. Implement i18n cho một component mới
4. Giải thích logging strategy và debug filter

---

## ⚡ Giai Đoạn 12: Performance & Optimization

### Mục tiêu học tập
- Hiểu các optimization techniques được sử dụng
- Nắm được code splitting và lazy loading
- Hiểu caching strategy
- Hiểu bundle optimization

### Nội dung cần đọc

#### 12.1. Code Splitting
- **File**: `src/main.jsx` (lazy loading)
- **Nội dung**:
  - React.lazy() cho non-critical pages
  - Suspense boundaries
  - Route-based code splitting

**Câu hỏi**:
- Code splitting: Giảm initial bundle size bao nhiêu?
- Lazy loading: Có trade-off không? (Loading delay)

#### 12.2. Caching Strategy
- **File**: `docs/ARCHITECTURE.md` (dòng 251-269)
- **Nội dung**:
  - Supabase data → IndexedDB cache
  - Background image preload
  - JLPT Dictionary preload
  - Service Worker (PWA)

**Câu hỏi**:
- Cache invalidation: Khi nào?
- Service Worker: Cache những gì?

#### 12.3. Image Optimization
- **File**: `public/` (images)
- **Nội dung**:
  - WebP format
  - Image preloading
  - Lazy loading images

**Câu hỏi**:
- WebP: Browser support?
- Image preloading: Tất cả images hay chỉ critical?

#### 12.4. Bundle Optimization
- **File**: `vite.config.js`
- **Nội dung**:
  - Vite build configuration
  - Tree shaking
  - Minification
  - Chunk splitting

**Câu hỏi**:
- Vite: Tại sao nhanh hơn Webpack?
- Chunk splitting: Strategy?

#### 12.5. Performance Monitoring
- **File**: `src/App.jsx` (Vercel Analytics, Speed Insights)
- **Nội dung**:
  - Vercel Speed Insights
  - Vercel Analytics
  - Performance metrics

**Câu hỏi**:
- Speed Insights: Track những metrics gì?
- Analytics: Privacy concerns?

#### 12.6. React Optimizations
- **File**: Various components
- **Nội dung**:
  - React.memo() for component memoization
  - useMemo() for expensive calculations
  - useCallback() for function memoization
  - Virtual scrolling (nếu có)

**Câu hỏi**:
- React.memo(): Khi nào dùng?
- useMemo vs useCallback: Khác nhau?

#### 12.7. Database Query Optimization
- **File**: Services (Supabase queries)
- **Nội dung**:
  - Select only needed columns
  - Use indexes
  - Batch operations
  - Pagination

**Câu hỏi**:
- Supabase indexes: Tự động hay manual?
- Pagination: Limit bao nhiêu records?

**Bài tập**:
1. Analyze bundle size với Vite build
2. Implement code splitting cho một feature mới
3. Optimize một component với React.memo
4. Giải thích caching strategy và cache invalidation

---

## 🚀 Giai Đoạn 13: Deployment & CI/CD

### Mục tiêu học tập
- Hiểu deployment process
- Nắm được Vercel configuration
- Hiểu environment variables
- Hiểu CI/CD pipeline

### Nội dung cần đọc

#### 13.1. Deployment Overview
- **File**: `docs/DEPLOYMENT.md`
- **Nội dung**:
  - Vercel deployment
  - Environment variables
  - Build process
  - Domain configuration

**Câu hỏi**:
- Vercel: Tại sao chọn?
- Deployment: Auto hay manual?

#### 13.2. Vercel Configuration
- **File**: `vercel.json` (nếu có)
- **File**: Vercel dashboard settings
- **Nội dung**:
  - Build command
  - Output directory
  - Environment variables
  - Headers configuration

**Câu hỏi**:
- Build command: `npm run build`?
- Output directory: `dist/`?

#### 13.3. Environment Variables
- **File**: `.env.example` (nếu có)
- **Nội dung**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - Production vs Development

**Câu hỏi**:
- Environment variables: Lưu ở đâu trong Vercel?
- VITE_ prefix: Tại sao? (Vite convention)

#### 13.4. CI/CD Pipeline
- **File**: `.github/workflows/*.yml` (nếu có)
- **Nội dung**:
  - Auto-deploy on push
  - Build verification
  - Testing (nếu có)

**Câu hỏi**:
- CI/CD: GitHub Actions?
- Auto-deploy: Tất cả branches hay chỉ main?

#### 13.5. Build Verification Scripts
- **File**: `scripts/verify-*.js`
- **Nội dung**:
  - `verify:deploy`: Verify deployment
  - `verify:headers`: Verify headers
  - `verify:cache`: Verify cache control
  - `verify:all`: Verify all

**Câu hỏi**:
- Verification scripts: Chạy khi nào?
- Verify headers: Check gì?

#### 13.6. Database Migrations
- **File**: `migrations/*.sql`
- **Nội dung**:
  - Database schema changes
  - RLS policies
  - Functions and triggers

**Câu hỏi**:
- Migrations: Chạy tự động hay manual?
- Migration order: Quan trọng không?

#### 13.7. Backup Scripts
- **File**: `scripts/backup-*.cjs`
- **Nội dung**:
  - Auto backup
  - Backup organization
  - Backup cleanup

**Câu hỏi**:
- Backup: Backup gì? (Database, files?)
- Backup frequency?

**Bài tập**:
1. Setup local development environment
2. Deploy một feature mới lên Vercel
3. Verify deployment với scripts
4. Giải thích CI/CD pipeline

---

## 📝 Tổng Kết & Next Steps

### Checklist Hoàn Thành

Sau khi hoàn thành tất cả các giai đoạn, bạn nên:

- [ ] Hiểu rõ kiến trúc tổng thể của hệ thống
- [ ] Nắm được luồng hoạt động từ entry point đến render
- [ ] Hiểu cách authentication và authorization hoạt động
- [ ] Nắm được storage strategy và sync mechanism
- [ ] Hiểu các services và business logic
- [ ] Nắm được các features chính (Level System, JLPT Exam, Dashboard, Admin)
- [ ] Hiểu utilities và helpers
- [ ] Nắm được performance optimizations
- [ ] Hiểu deployment process

### Tài Liệu Tham Khảo

1. **React Documentation**: https://react.dev
2. **Vite Documentation**: https://vitejs.dev
3. **Supabase Documentation**: https://supabase.com/docs
4. **React Router Documentation**: https://reactrouter.com
5. **Tailwind CSS Documentation**: https://tailwindcss.com
6. **Ant Design Documentation**: https://ant.design

### Các Chủ Đề Nâng Cao

Sau khi nắm vững cơ bản, bạn có thể tìm hiểu thêm:

1. **Testing**: Unit tests, Integration tests, E2E tests
2. **TypeScript Migration**: Chuyển từ JavaScript sang TypeScript
3. **Advanced Performance**: Virtual scrolling, Web Workers
4. **Accessibility**: ARIA labels, Keyboard navigation
5. **Security**: XSS prevention, CSRF protection, Content Security Policy
6. **Monitoring**: Error tracking (Sentry), Performance monitoring
7. **Advanced Features**: Offline-first, Background sync, Push notifications

### Câu Hỏi Tự Đánh Giá

1. Bạn có thể giải thích luồng từ khi browser load HTML đến khi HomePage render không?
2. Bạn có thể trace một user action (ví dụ: đăng nhập) qua tất cả các layers không?
3. Bạn có thể giải thích tại sao cần 3 lớp storage không?
4. Bạn có thể implement một feature mới từ đầu đến cuối không?
5. Bạn có thể debug một issue trong production không?

---

## 🎓 Lời Khuyên

1. **Đọc code từ trên xuống**: Bắt đầu từ entry point, trace theo luồng
2. **Đặt câu hỏi**: Tại sao code như vậy? Có cách nào tốt hơn không?
3. **Thực hành**: Không chỉ đọc, hãy code và test
4. **Debug**: Sử dụng browser DevTools để hiểu runtime behavior
5. **Đọc documentation**: React, Vite, Supabase docs rất hữu ích
6. **Tham khảo best practices**: React best practices, security best practices

Chúc bạn học tập hiệu quả! 🚀
