# ✅ DATA VALIDATION RULES

## 📋 Tổng quan

Tài liệu này định nghĩa tất cả các validation rules cho hệ thống dữ liệu.

---

## 🎯 EXAM RESULTS

### **Constraints**

```javascript
{
  // Scores
  knowledgeScore: { min: 0, max: 60, type: 'integer' },
  readingScore: { min: 0, max: 60, type: 'integer' },
  listeningScore: { min: 0, max: 60, type: 'integer' },
  totalScore: { min: 0, max: 180, type: 'integer' },
  
  // Correct answers
  knowledgeCorrect: { 
    min: 0, 
    max: knowledgeTotal, 
    type: 'integer',
    required: true
  },
  readingCorrect: { 
    min: 0, 
    max: readingTotal, 
    type: 'integer',
    required: true
  },
  listeningCorrect: { 
    min: 0, 
    max: listeningTotal, 
    type: 'integer',
    required: true
  },
  
  // Totals
  knowledgeTotal: { min: 1, type: 'integer', required: true },
  readingTotal: { min: 1, type: 'integer', required: true },
  listeningTotal: { min: 1, type: 'integer', required: true },
  
  // Other
  timeSpent: { min: 0, max: 10800, type: 'integer' }, // Max 3 hours
  isPassed: { type: 'boolean', required: true },
  
  // Calculated
  totalScore: {
    validate: (data) => {
      const calculated = data.knowledgeScore + data.readingScore + data.listeningScore;
      return calculated === data.totalScore;
    }
  }
}
```

### **Pass Criteria**

```javascript
const PASS_CRITERIA = {
  total: { min: 100, max: 180 },
  knowledge: { min: 19, max: 60 },
  reading: { min: 19, max: 60 },
  listening: { min: 19, max: 60 }
};

function isPassed(scores) {
  return scores.total >= PASS_CRITERIA.total.min &&
         scores.knowledge >= PASS_CRITERIA.knowledge.min &&
         scores.reading >= PASS_CRITERIA.reading.min &&
         scores.listening >= PASS_CRITERIA.listening.min;
}
```

---

## 📚 LEARNING PROGRESS

### **Constraints**

```javascript
{
  // Type
  type: {
    enum: ['lesson_complete', 'quiz_attempt', 'exam_attempt', 'flashcard_review'],
    required: true
  },
  
  // Status
  status: {
    enum: ['not_started', 'in_progress', 'completed', 'abandoned'],
    required: true
  },
  
  // Score
  score: {
    min: 0,
    max: total,
    type: 'integer',
    nullable: true,
    validate: (data) => {
      if (data.score !== null && data.total !== null) {
        return data.score <= data.total;
      }
      return true;
    }
  },
  
  // Total
  total: {
    min: 1,
    type: 'integer',
    nullable: true
  },
  
  // Attempts
  attempts: {
    min: 1,
    max: 100,
    type: 'integer',
    default: 1
  },
  
  // Time spent (seconds)
  timeSpent: {
    min: 0,
    max: 86400, // Max 24 hours
    type: 'integer',
    nullable: true
  },
  
  // Required fields based on type
  lesson_complete: {
    required: ['bookId', 'chapterId', 'lessonId'],
    optional: ['levelId', 'examId']
  },
  exam_attempt: {
    required: ['levelId', 'examId'],
    optional: ['bookId', 'chapterId', 'lessonId']
  },
  quiz_attempt: {
    required: ['bookId', 'chapterId', 'lessonId'],
    optional: ['levelId', 'examId']
  }
}
```

---

## 👤 USER DATA

### **Profile Constraints**

```javascript
{
  role: {
    enum: ['admin', 'editor', 'user'],
    required: true,
    default: 'user'
  },
  display_name: {
    minLength: 1,
    maxLength: 100,
    type: 'string',
    required: true
  },
  timezone: {
    type: 'string',
    pattern: /^[A-Za-z_]+\/[A-Za-z_]+$/,
    default: 'Asia/Ho_Chi_Minh'
  },
  language: {
    enum: ['vi', 'ja', 'en'],
    default: 'vi'
  },
  preferences: {
    type: 'object',
    default: {}
  }
}
```

---

## 🔍 VALIDATION FUNCTIONS

### **JavaScript Implementation**

```javascript
// src/utils/dataValidation.js

export const VALIDATION_RULES = {
  examResults: {
    knowledgeScore: { min: 0, max: 60, type: 'integer' },
    readingScore: { min: 0, max: 60, type: 'integer' },
    listeningScore: { min: 0, max: 60, type: 'integer' },
    totalScore: { min: 0, max: 180, type: 'integer' },
    // ... (see above)
  },
  learningProgress: {
    // ... (see above)
  }
};

export function validateExamResult(data) {
  const errors = [];
  
  // Validate scores
  if (data.knowledgeScore < 0 || data.knowledgeScore > 60) {
    errors.push('knowledgeScore must be between 0 and 60');
  }
  
  // Validate totals
  if (data.knowledgeCorrect > data.knowledgeTotal) {
    errors.push('knowledgeCorrect cannot exceed knowledgeTotal');
  }
  
  // Validate calculated total
  const calculatedTotal = data.knowledgeScore + data.readingScore + data.listeningScore;
  if (calculatedTotal !== data.totalScore) {
    errors.push('totalScore does not match sum of individual scores');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateLearningProgress(data) {
  const errors = [];
  
  // Validate type
  const validTypes = ['lesson_complete', 'quiz_attempt', 'exam_attempt', 'flashcard_review'];
  if (!validTypes.includes(data.type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate required fields based on type
  if (data.type === 'lesson_complete') {
    if (!data.bookId || !data.chapterId || !data.lessonId) {
      errors.push('lesson_complete requires bookId, chapterId, and lessonId');
    }
  }
  
  if (data.type === 'exam_attempt') {
    if (!data.levelId || !data.examId) {
      errors.push('exam_attempt requires levelId and examId');
    }
  }
  
  // Validate score
  if (data.score !== null && data.total !== null) {
    if (data.score < 0 || data.score > data.total) {
      errors.push('score must be between 0 and total');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 🚨 ERROR HANDLING

### **Error Codes**

```javascript
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  DATABASE_ERROR: 'DATABASE_ERROR'
};
```

### **Error Response Format**

```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid data provided',
    details: [
      'knowledgeScore must be between 0 and 60',
      'totalScore does not match sum of individual scores'
    ]
  }
}
```

---

## 📝 NOTES

- **Always validate on frontend** before sending to backend
- **Backend validation is mandatory** (defense in depth)
- **Database constraints** are the final layer of validation
- **Return clear error messages** to help users fix issues
- **Log validation errors** for debugging

