export const recommended = [
  { 
    id: 'r1', 
    title: 'Create An LMS Website With LearnPress', 
    category: 'Photography', 
    author: 'Determined-Poitras',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    duration: '2 Weeks',
    studentCount: 156,
    price: 'Free',
    oldPrice: 29.0,
    rating: 4.6, 
    tags: ['WordPress', 'LMS'],
    difficulty: 'Beginner' 
  },
  { 
    id: 'r2', 
    title: 'Design A Website With ThimPress', 
    category: 'Photography', 
    author: 'Determined-Poitras',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    duration: '2 Weeks',
    studentCount: 156,
    price: 49.0,
    oldPrice: 59.0,
    rating: 4.5, 
    tags: ['Design', 'WordPress'],
    difficulty: 'Beginner' 
  },
  { 
    id: 'r3', 
    title: 'Create An LMS Website With LearnPress', 
    category: 'Photography', 
    author: 'Determined-Poitras',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    duration: '2 Weeks',
    studentCount: 156,
    price: 'Free',
    oldPrice: 29.0,
    rating: 4.7, 
    tags: ['LMS', 'Education'],
    difficulty: 'Intermediate' 
  },
  { 
    id: 'r4', 
    title: 'Create An LMS Website With LearnPress', 
    category: 'Photography', 
    author: 'Determined-Poitras',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    duration: '2 Weeks',
    studentCount: 156,
    price: 'Free',
    oldPrice: 29.0,
    rating: 4.6, 
    tags: ['WordPress', 'LMS'],
    difficulty: 'Beginner' 
  },
  { 
    id: 'r5', 
    title: 'Create An LMS Website With LearnPress', 
    category: 'Photography', 
    author: 'Determined-Poitras',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    duration: '2 Weeks',
    studentCount: 156,
    price: 'Free',
    oldPrice: 29.0,
    rating: 4.6, 
    tags: ['WordPress', 'LMS'],
    difficulty: 'Beginner' 
  },
  { 
    id: 'r6', 
    title: 'Create An LMS Website With LearnPress', 
    category: 'Photography', 
    author: 'Determined-Poitras',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    duration: '2 Weeks',
    studentCount: 156,
    price: 'Free',
    oldPrice: 29.0,
    rating: 4.6, 
    tags: ['WordPress', 'LMS'],
    difficulty: 'Beginner' 
  },
]

export const continueLearning = [
  { id: 'c1', title: 'Foundations of AI', tags: ['AI', 'ML'], progress: 42, rating: 4.8, difficulty: 'Beginner' },
  { id: 'c2', title: 'Operating Systems', tags: ['OS', 'Processes'], progress: 73, rating: 4.4, difficulty: 'Intermediate' },
]

export const upcoming = [
  { id: 'u1', title: 'Quiz: Arrays & Lists', course: 'Data Structures', due: Date.now() + 86400000 * 2 },
  { id: 'u2', title: 'Project Milestone 1', course: 'Web Dev', due: Date.now() + 86400000 * 5 },
]

// Full catalog (simple seed combining multiple sources)
export const allCourses = [
  { id: 'c-ai', title: 'Foundations of AI', tags: ['AI', 'ML'], rating: 4.8, difficulty: 'Beginner', progress: 34 },
  { id: 'c-os', title: 'Operating Systems', tags: ['OS', 'Processes'], rating: 4.4, difficulty: 'Intermediate', progress: 73 },
  { id: 'c-java-ds', title: 'Data Structures with Java', tags: ['Java', 'Algorithms'], rating: 4.6, difficulty: 'Intermediate' },
  { id: 'c-sql', title: 'Intro to Databases (MySQL)', tags: ['SQL', 'MySQL'], rating: 4.5, difficulty: 'Beginner' },
  { id: 'c-laravel', title: 'Web Dev with Laravel', tags: ['Laravel', 'PHP'], rating: 4.7, difficulty: 'Intermediate' },
  { id: 'c-net', title: 'Computer Networks', tags: ['Networks', 'TCP/IP'], rating: 4.3, difficulty: 'Intermediate' },
  { id: 'c-dsa', title: 'Algorithms & Complexity', tags: ['Algorithms', 'Theory'], rating: 4.6, difficulty: 'Advanced' },
]
