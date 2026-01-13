import { roleHierarchy, UserRole } from "@/enums/roles";

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}