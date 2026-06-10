
/**
 * Converts pregnancy week to month based on common Israeli medical standards.
 * Source: Clalit / Sheba Medical Center guidelines.
 * 
 * Mapping:
 * Month 1: Weeks 1-6
 * Month 2: Weeks 7-10
 * Month 3: Weeks 11-15
 * Month 4: Weeks 16-19
 * Month 5: Weeks 20-23
 * Month 6: Weeks 24-27
 * Month 7: Weeks 28-32
 * Month 8: Weeks 33-36
 * Month 9: Weeks 37-42+
 */
export const getPregnancyMonth = (week) => {
    if (week <= 6) return 1;
    if (week <= 10) return 2;
    if (week <= 15) return 3;
    if (week <= 19) return 4;
    if (week <= 23) return 5;
    if (week <= 27) return 6;
    if (week <= 32) return 7;
    if (week <= 36) return 8;
    return 9;
};
