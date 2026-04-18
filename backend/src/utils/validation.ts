const UNIVERSITY_DOMAINS = {
  'Eastern Michigan University': ['emich.edu', 'student.emich.edu'],
  'Eastern University': ['eastern.edu', 'student.eastern.edu'],
  'Thomas Edison State University': ['tesu.edu', 'student.tesu.edu'],
  'Oakland University': ['oakland.edu', 'student.oakland.edu'],
  'Virginia Tech': ['vt.edu', 'student.vt.edu']
};

export const validateUniversityEmail = (email: string, university: string): boolean => {
  const domains = UNIVERSITY_DOMAINS[university as keyof typeof UNIVERSITY_DOMAINS];
  if (!domains) return false;
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return domains.some(domain => emailDomain === domain.toLowerCase());
};

export const validateGPA = (gpa: number): boolean => {
  return gpa >= 0 && gpa <= 4.0;
};

export const validateAchievementType = (type: string): boolean => {
  return ['gpa', 'research', 'leadership'].includes(type);
};

export const validateNFTType = (type: string): boolean => {
  return ['gpa_guardian', 'research_rockstar', 'leadership_legend'].includes(type);
};

export const getRequiredGPAForNFT = (type: string): number => {
  const requirements = {
    'gpa_guardian': 3.5,
    'research_rockstar': 0, // No GPA requirement for research
    'leadership_legend': 0  // No GPA requirement for leadership
  };
  return requirements[type as keyof typeof requirements] || 0;
};