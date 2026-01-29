// Predefined list of workplaces (schools)
export const WORKPLACES = [
    'Nazarbayev Intellectual School of Physics and Mathematics',
    'Nazarbayev Intellectual School of Chemistry and Biology',
    'International School of Astana',
    'Miras International School',
    'Haileybury Almaty',
    'School #1',
    'School #2',
    'School #3',
    'Gymnasium #5',
    'Lyceum #7',
] as const;

export type Workplace = typeof WORKPLACES[number];
