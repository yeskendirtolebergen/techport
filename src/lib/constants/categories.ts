// Teacher categories based on Kazakhstan education system
export const CATEGORIES = [
    'Teacher',
    'Teacher-Moderator',
    'Teacher-Researcher',
    'Teacher-Expert',
    'Teacher-Master',
] as const;

export type TeacherCategory = typeof CATEGORIES[number];
