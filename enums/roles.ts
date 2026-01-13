export enum UserRole {
    USER = "user",
    ADMIN = "admin",
    SUPERADMIN = "superadmin",
}

export const roleHierarchy: Record<UserRole, number> = {
    [UserRole.USER]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPERADMIN]: 3,
};