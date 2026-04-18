"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequiredGPAForNFT = exports.validateNFTType = exports.validateAchievementType = exports.validateGPA = exports.validateUniversityEmail = void 0;
const UNIVERSITY_DOMAINS = {
    'Eastern Michigan University': ['emich.edu', 'student.emich.edu'],
    'Eastern University': ['eastern.edu', 'student.eastern.edu'],
    'Thomas Edison State University': ['tesu.edu', 'student.tesu.edu'],
    'Oakland University': ['oakland.edu', 'student.oakland.edu'],
    'Virginia Tech': ['vt.edu', 'student.vt.edu']
};
const validateUniversityEmail = (email, university) => {
    const domains = UNIVERSITY_DOMAINS[university];
    if (!domains)
        return false;
    const emailDomain = email.split('@')[1]?.toLowerCase();
    return domains.some(domain => emailDomain === domain.toLowerCase());
};
exports.validateUniversityEmail = validateUniversityEmail;
const validateGPA = (gpa) => {
    return gpa >= 0 && gpa <= 4.0;
};
exports.validateGPA = validateGPA;
const validateAchievementType = (type) => {
    return ['gpa', 'research', 'leadership'].includes(type);
};
exports.validateAchievementType = validateAchievementType;
const validateNFTType = (type) => {
    return ['gpa_guardian', 'research_rockstar', 'leadership_legend'].includes(type);
};
exports.validateNFTType = validateNFTType;
const getRequiredGPAForNFT = (type) => {
    const requirements = {
        'gpa_guardian': 3.5,
        'research_rockstar': 0,
        'leadership_legend': 0
    };
    return requirements[type] || 0;
};
exports.getRequiredGPAForNFT = getRequiredGPAForNFT;
