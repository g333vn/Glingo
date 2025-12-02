// src/data/level/bookData.js
// CLEAN MODE: Central bookData map with no hard-coded content.
// All real content should come from Supabase / admin tools.

import { n1Books } from './n1/books.js';
import { n2Books } from './n2/books.js';
import { n3Books } from './n3/books.js';
import { n4Books } from './n4/books.js';
import { n5Books } from './n5/books.js';

export const bookData = {
  ...n1Books,
  ...n2Books,
  ...n3Books,
  ...n4Books,
  ...n5Books,
  default: {
    title: 'Book Not Found',
    imageUrl: null,
    contents: []
  }
};

export default bookData;


