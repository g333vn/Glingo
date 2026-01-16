# Features Guide

## Learning Modules

### 1. Level System (N1-N5)

The Level system provides structured Japanese courses organized by JLPT levels.

#### Hierarchy

```
Level (N1-N5)
└── Books (e.g., Minna no Nihongo)
    └── Chapters (e.g., Chapter 1-10)
        └── Lessons (e.g., Lesson 1: Greetings)
            └── Quizzes
```

#### Lesson Types

| Type | Description |
|------|-------------|
| `theory` | Text/rich content lessons |
| `flashcard` | Vocabulary flashcards |
| `quiz` | Interactive quizzes |
| `mixed` | Combination of types |

#### Quiz Question Types

- **Multiple Choice**: Select one correct answer
- **Fill in the Blank**: Type the missing word
- **Matching**: Match pairs of items
- **Ordering**: Arrange items in correct order

### 2. JLPT Exam Practice

Real JLPT exam simulation for all levels (N1-N5).

#### Exam Structure

```
JLPT Exam
├── Knowledge Section (言語知識)
│   ├── Vocabulary (文字・語彙)
│   ├── Grammar (文法)
│   └── Reading (読解)
└── Listening Section (聴解)
    └── Audio-based questions
```

#### Features

- **Timed Practice**: Simulates real exam timing
- **Section Navigation**: Move between sections
- **Auto-save**: Progress saved during exam
- **Instant Scoring**: Results calculated immediately
- **Answer Explanations**: Review correct answers

#### Scoring

```
Total Score = Knowledge Score + Listening Score
Pass/Fail calculated based on JLPT criteria
```

### 3. SRS (Spaced Repetition System)

Based on SuperMemo SM-2 algorithm for efficient memorization.

#### Card States

| State | Description |
|-------|-------------|
| `new` | Never studied |
| `learning` | Currently learning (<3 repetitions) |
| `review` | Regular review (>=3 repetitions) |
| `relearning` | Forgot, relearning |
| `graduated` | Mastered (interval >21 days) |

#### Grade Scale

| Grade | Label | Effect |
|-------|-------|--------|
| 0 | Again | Reset to learning |
| 2 | Hard | Shorter interval |
| 3 | Good | Normal interval |
| 4 | Easy | Longer interval |

#### Algorithm

```javascript
// Ease factor adjustment (SM-2)
newEF = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))

// Interval calculation
if (repetition === 1) interval = 1 day
if (repetition === 2) interval = 6 days
if (repetition > 2) interval = previousInterval * easeFactor
```

## User Features

### Dashboard

Personal learning hub with:

- **Progress Overview**: Visual progress bars
- **Due Reviews**: Cards due for SRS review
- **Statistics**: Learning analytics
- **Activity Feed**: Recent activity log
- **Streak Counter**: Daily learning streak

### Profile Management

- Display name customization
- Avatar upload
- Language preference (Vi/En/Ja)
- Notification settings

### Access Control

Content access can be restricted by:

- **Level**: N1, N2, N3, N4, N5
- **Module**: Level system, JLPT exams
- **User role**: Public, registered, premium

## Admin Features

### Content Management

Full CRUD operations for:

```
├── Series (book collections)
├── Books
├── Chapters
├── Lessons
│   ├── Theory content (rich text)
│   ├── Flashcards
│   └── Quizzes
└── Quizzes (standalone)
```

#### Rich Text Editor

- Bold, italic, underline
- Headings (H1-H6)
- Lists (ordered, unordered)
- Links and images
- Code blocks
- Tables

### Exam Management

- Create/edit JLPT exams
- Add questions by section
- Configure timing and scoring
- Preview exam experience

### User Management

| Action | Description |
|--------|-------------|
| View users | List all registered users |
| Change role | Set admin/editor/user |
| Ban/unban | Block user access |
| Delete | Remove user account |

### Access Control

Configure content access:

```javascript
// Level access configuration
{
  n5: { public: true, requireLogin: false },
  n4: { public: false, requireLogin: true },
  n3: { public: false, requireLogin: true, premium: true }
}

// Module access configuration
{
  level: { enabled: true, maintenanceMode: false },
  jlpt: { enabled: true, maintenanceMode: false }
}
```

### Settings

- **Maintenance Mode**: Toggle site-wide maintenance
- **System Settings**: Global configurations
- **Exam Config**: Default exam settings

### Notifications

- Create announcements
- Target specific users or all
- Set expiration dates

## Editor Features

Limited admin access for content editors:

- Content editing (books, lessons, quizzes)
- Exam management
- No user management
- No system settings

## Additional Features

### JLPT Dictionary

Built-in dictionary with 8,292+ words:

- **Double-click lookup**: Click any word to search
- **Save words**: Add to personal word list
- **Review**: Review saved words as flashcards

### Google Translate Integration

- Quick translation popup
- Support for selected text
- Copy translation to clipboard

### Global Search

Search across all content:

- Books and lessons
- JLPT exams
- Dictionary words

Keyboard shortcut: `Ctrl/Cmd + K`

### Multi-language Support

UI available in:

- Vietnamese (vi) - Default
- English (en)
- Japanese (ja)

### Offline Support

- Content cached in IndexedDB
- Works without internet connection
- Syncs when back online

### Real-time Updates

- Access control changes sync immediately
- Maintenance mode updates in real-time
- No page refresh needed

## PWA Features

Progressive Web App support:

- Install to home screen
- Offline functionality
- Push notifications (planned)
- Background sync (planned)
