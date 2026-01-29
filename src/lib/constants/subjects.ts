// Predefined list of subjects
export const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English Language',
    'Kazakh Language',
    'Russian Language',
    'History',
    'Geography',
    'Literature',
    'Art',
    'Music',
    'Physical Education',
    'Economics',
    'Social Studies',
] as const;

export type Subject = typeof SUBJECTS[number];
