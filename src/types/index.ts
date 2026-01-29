// TypeScript type definitions for the Teacher Portfolio Platform

export type UserRole = 'teacher' | 'admin';

export interface Teacher {
  id: string;
  iin: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  graduated_school?: string;
  total_experience_years?: number;
  current_workplace?: string;
  current_school_experience?: number;
  subject?: string;
  category?: string;
  category_expiration?: string;
  is_homeroom_teacher: boolean;
  advanced_degree?: string;
  photo_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  teacher_id: string;
  tat_2026?: number;
  tat_2025?: number;
  tat_2024?: number;
  tor_score?: number;
  ielts_score?: number;
  toefl_score?: number;
  tesol: boolean;
  celta: boolean;
  ib_certificate: boolean;
  ap_certificate: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentResult {
  id: string;
  teacher_id: string;
  result_type: 'BTS' | 'KBO' | 'Regional Olympiad' | 'National Olympiad' | 'Laboratory Work';
  year: number;
  data: Record<string, any>; // Flexible JSON structure
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

export type SkillStatus = 'in_progress' | 'completed' | 'approved' | 'rejected';

export interface TeacherSkill {
  id: string;
  teacher_id: string;
  skill_id: string;
  status: SkillStatus;
  started_at?: string;
  completed_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  skill?: Skill;
}

export interface YearlyGoal {
  id: string;
  title: string;
  description?: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected';

export interface TeacherGoal {
  id: string;
  teacher_id: string;
  goal_id: string;
  status: GoalStatus;
  progress_notes?: string;
  target_date?: string;
  completed_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  goal?: YearlyGoal;
}

export interface TeacherProfile {
  teacher: Teacher;
  certifications?: Certification;
  student_results?: StudentResult[];
  teacher_skills?: TeacherSkill[];
  teacher_goals?: TeacherGoal[];
}

// Google Form Registration Data
export interface RegistrationData {
  // Personal Information
  iin: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  graduatedSchool?: string;
  totalExperience?: number;
  currentWorkplace?: string;
  currentSchoolExperience?: number;
  subject?: string;
  category?: string;
  categoryExpiration?: string;
  isHomeroomTeacher?: boolean;
  advancedDegree?: string;

  // Certifications
  tat2026?: number;
  tat2025?: number;
  tat2024?: number;
  torScore?: number;
  ieltsScore?: number;
  toeflScore?: number;
  tesol?: boolean;
  celta?: boolean;
  ibCertificate?: boolean;
  apCertificate?: boolean;

  // Student Results (flexible JSON)
  BTS?: Record<string, any>;
  KBO?: Record<string, any>;
  RegionalOlympiad?: Record<string, any>;
  NationalOlympiad?: Record<string, any>;
  LabWork?: Record<string, any>;
}
