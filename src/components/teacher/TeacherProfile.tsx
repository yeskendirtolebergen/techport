'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils/formatters';
import type { Teacher, Certification, TeacherSkill, TeacherGoal, StudentResult } from '@/types';
import styles from './TeacherProfile.module.css';

interface TeacherProfileProps {
    teacher: Teacher;
    certifications?: Certification;
    teacherSkills: TeacherSkill[];
    teacherGoals: TeacherGoal[];
    studentResults: StudentResult[];
}

export function TeacherProfile({
    teacher,
    certifications,
    teacherSkills,
    teacherGoals,
    studentResults,
}: TeacherProfileProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.profileSection}>
                    <div className={styles.avatar}>
                        {teacher.photo_url ? (
                            <img src={teacher.photo_url} alt={`${teacher.first_name} ${teacher.last_name}`} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {teacher.first_name[0]}{teacher.last_name[0]}
                            </div>
                        )}
                    </div>
                    <div className={styles.profileInfo}>
                        <h1 className={styles.name}>{teacher.first_name} {teacher.last_name}</h1>
                        <p className={styles.subject}>{teacher.subject || 'Subject not specified'}</p>
                        {teacher.current_workplace && (
                            <p className={styles.workplace}>{teacher.current_workplace}</p>
                        )}
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button variant="primary" onClick={() => window.location.href = '/teacher/profile'}>
                        Edit Profile
                    </Button>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Email:</span>
                                <span className={styles.value}>{teacher.email}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Phone:</span>
                                <span className={styles.value}>{teacher.phone || 'Not provided'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Date of Birth:</span>
                                <span className={styles.value}>
                                    {teacher.date_of_birth ? formatDate(teacher.date_of_birth) : 'Not provided'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Experience:</span>
                                <span className={styles.value}>{teacher.total_experience_years || 0} years</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Category:</span>
                                <span className={styles.value}>{teacher.category || 'Not assigned'}</span>
                            </div>
                            {teacher.advanced_degree && (
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>Advanced Degree:</span>
                                    <span className={styles.value}>{teacher.advanced_degree}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Certifications */}
                {certifications && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Certifications & Qualifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.certGrid}>
                                {certifications.tat_2026 && (
                                    <div className={styles.certItem}>
                                        <span className={styles.certLabel}>TAT 2026:</span>
                                        <span className={styles.certValue}>{certifications.tat_2026}%</span>
                                    </div>
                                )}
                                {certifications.tat_2025 && (
                                    <div className={styles.certItem}>
                                        <span className={styles.certLabel}>TAT 2025:</span>
                                        <span className={styles.certValue}>{certifications.tat_2025}%</span>
                                    </div>
                                )}
                                {certifications.tat_2024 && (
                                    <div className={styles.certItem}>
                                        <span className={styles.certLabel}>TAT 2024:</span>
                                        <span className={styles.certValue}>{certifications.tat_2024}%</span>
                                    </div>
                                )}
                                {certifications.ielts_score && (
                                    <div className={styles.certItem}>
                                        <span className={styles.certLabel}>IELTS:</span>
                                        <span className={styles.certValue}>{certifications.ielts_score}</span>
                                    </div>
                                )}
                                {certifications.toefl_score && (
                                    <div className={styles.certItem}>
                                        <span className={styles.certLabel}>TOEFL:</span>
                                        <span className={styles.certValue}>{certifications.toefl_score}</span>
                                    </div>
                                )}
                                {certifications.tesol && (
                                    <div className={styles.certBadge}>✓ TESOL</div>
                                )}
                                {certifications.celta && (
                                    <div className={styles.certBadge}>✓ CELTA</div>
                                )}
                                {certifications.ib_certificate && (
                                    <div className={styles.certBadge}>✓ IB Certificate</div>
                                )}
                                {certifications.ap_certificate && (
                                    <div className={styles.certBadge}>✓ AP Certificate</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Skills */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skills Development</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {teacherSkills.length === 0 ? (
                            <p className={styles.emptyState}>No skills assigned yet.</p>
                        ) : (
                            <div className={styles.skillsList}>
                                {teacherSkills.map((ts) => (
                                    <div key={ts.id} className={styles.skillItem}>
                                        <div className={styles.skillHeader}>
                                            <span className={styles.skillName}>{ts.skill?.name}</span>
                                            <span className={`badge badge-${getStatusColor(ts.status)}`}>
                                                {formatStatus(ts.status)}
                                            </span>
                                        </div>
                                        {ts.skill?.description && (
                                            <p className={styles.skillDescription}>{ts.skill.description}</p>
                                        )}
                                        {ts.started_at && (
                                            <p className={styles.skillDate}>Started: {formatDate(ts.started_at)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Goals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Yearly Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {teacherGoals.length === 0 ? (
                            <p className={styles.emptyState}>No goals assigned yet.</p>
                        ) : (
                            <div className={styles.goalsList}>
                                {teacherGoals.map((tg) => (
                                    <div key={tg.id} className={styles.goalItem}>
                                        <div className={styles.goalHeader}>
                                            <span className={styles.goalTitle}>{tg.goal?.title}</span>
                                            <span className={`badge badge-${getStatusColor(tg.status)}`}>
                                                {formatStatus(tg.status)}
                                            </span>
                                        </div>
                                        {tg.goal?.description && (
                                            <p className={styles.goalDescription}>{tg.goal.description}</p>
                                        )}
                                        {tg.progress_notes && (
                                            <p className={styles.progressNotes}><strong>Progress:</strong> {tg.progress_notes}</p>
                                        )}
                                        {tg.target_date && (
                                            <p className={styles.goalDate}>Target: {formatDate(tg.target_date)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
