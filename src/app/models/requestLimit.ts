export interface RequestLimit {
    isLimitReached: boolean;
    remainingLimit?: number;
    limitPerHour?: number;
    currentLimitExpiration?: number;
}
