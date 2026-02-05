import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SystemInfo {
    version: string;
}
export interface UserProfile {
    name: string;
}
export interface Story {
    title: string;
    authorName?: string;
    isAnonymous: boolean;
    story: string;
    timestamp: bigint;
    authorPseudonym: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(storyTitle: string, commenterHandle: string, comment: string): Promise<void>;
    adminRewordAndPublishStory(title: string, rewordedStory: string, rewordedPseudonym: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllStories(): Promise<Array<Story>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPublishedStories(): Promise<Array<Story>>;
    getPublishedStory(title: string): Promise<Story>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    requireAdmin(caller: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitStory(title: string, authorPseudonym: string, story: string, isAnonymous: boolean, authorName: string | null): Promise<void>;
    systemInfo(): Promise<SystemInfo>;
}
