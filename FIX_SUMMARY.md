# ✅ Tóm Tắt Fix Lỗi `Cannot read properties of undefined (reading 'version')`

## 🔍 Nguyên Nhân

Lỗi xảy ra vì:
1. **Source code trong `node_modules`** truy cập `React.version` ngay khi module được evaluate
2. Code này chạy **TRƯỚC** khi import từ `react-vendor` chunk hoàn thành
3. Kết quả: `React` (hoặc `_react`) là `undefined` khi code cố truy cập `React.version`

## 📁 Files Gây Lỗi

1. `node_modules/antd/es/config-provider/UnstableContext.js` (line 11)
   - Code: `Number.parseInt(React.version.split('.')[0], 10)`

2. `node_modules/rc-util/lib/ref.js` (line 13)
   - Code: `Number(_react.version.split('.')[0])`

## ✅ Giải Pháp

### 1. Tạo Vite Transform Plugin
- Transform code trong `node_modules` **TRƯỚC** khi bundle
- Thay thế unsafe access bằng safe version với null check

### 2. Code Transform

**Trước:**
```javascript
Number(_react.version.split('.')[0])
Number.parseInt(React.version.split('.')[0], 10)
```

**Sau:**
```javascript
Number((_react && _react.version ? _react.version.split(".")[0] : "19"))
Number.parseInt(React && React.version ? React.version.split(".")[0] : "19", 10)
```

### 3. Plugin Implementation

```javascript
const reactVersionTransformPlugin = () => {
  return {
    name: 'react-version-transform',
    enforce: 'pre', // Run before other transforms
    transform(code, id) {
      if (id.includes('node_modules') && 
          (id.includes('antd') || id.includes('rc-util')) &&
          code.includes('version.split')) {
        
        // Fix Number(_react.version.split('.')[0])
        code = code.replace(
          /Number\((_react|react)\.version\.split\(['"]\.['"]\)\[0\]\)/g,
          'Number(($1 && $1.version ? $1.version.split(".")[0] : "19"))'
        );
        
        // Fix Number.parseInt(React.version.split('.')[0], 10)
        code = code.replace(
          /Number\.parseInt\(React\.version\.split\(['"]\.['"]\)\[0\]/g,
          'Number.parseInt(React && React.version ? React.version.split(".")[0] : "19"'
        );
        
        // Fix direct access: _react.version.split('.')[0]
        code = code.replace(
          /(_react|react)\.version\.split\(['"]\.['"]\)\[0\]/g,
          '($1 && $1.version ? $1.version.split(".")[0] : "19")'
        );
      }
      
      return code;
    }
  }
}
```

## 🎯 Kết Quả

- ✅ Code được transform ở **source level** (không phải build output)
- ✅ Fix persistent qua mỗi lần build
- ✅ Safe fallback về `"19"` nếu React chưa load
- ✅ Không cần patch `node_modules` manually

## 📝 Next Steps

1. Test trên production
2. Verify không còn lỗi trong console
3. Monitor để đảm bảo fix hoạt động

