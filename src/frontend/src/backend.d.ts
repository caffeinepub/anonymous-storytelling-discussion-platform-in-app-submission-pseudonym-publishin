import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CommentThread {
    storyTitle: string;
    comments: Array<Comment>;
}
export type Time = bigint;
export interface Rating {
    reviewerHandle: string;
    comment?: string;
    timestamp: Time;
    rating: number;
}
export interface ReviewThread {
    reviews: Array<Rating>;
    storyTitle: string;
}
export interface SubmissionStatus {
    status: Variant_pending_published;
    story: Story;
}
export interface Story {
    title: string;
    authorName?: string;
    isAnonymous: boolean;
    story: string;
    timestamp: Time;
    authorPseudonym: string;
    authorPrincipal?: Principal;
}
export interface Comment {
    comment: string;
    timestamp: Time;
    commenterHandle: string;
}
export interface SystemInfo {
    version: string;
}
export interface UserProfile {
    name: string;
}
export interface Discussions {
    reviews: Array<ReviewThread>;
    comments: Array<CommentThread>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_published {
    pending = "pending",
    published = "published"
}
export interface backendInterface {
    addComment(storyTitle: string, commenterHandle: string, comment: string): Promise<void>;
    addReview(storyTitle: string, reviewerHandle: string, rating: number, comment: string | null): Promise<void>;
    adminCreateAndPublishArticle(title: string, authorPseudonym: string, story: string, isAnonymous: boolean, authorName: string | null, authorPrincipal: Principal | null): Promise<void>;
    adminDeleteAllArticles(): Promise<void>;
    adminDeletePublishedArticle(title: string): Promise<void>;
    adminPublishStory(title: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    callerIsAdmin(): Promise<boolean>;
    checkBackendHeartbeat(): Promise<boolean>;
    getAllDiscussions(): Promise<Discussions>;
    getAllPendingStories(): Promise<Array<Story>>;
    getAllStoriesWithStatus(): Promise<Array<SubmissionStatus>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMySubmissions(): Promise<Array<SubmissionStatus>>;
    getPublishedStories(): Promise<Array<Story>>;
    getPublishedStory(title: string): Promise<Story>;
    getStoryComments(storyTitle: string): Promise<Array<Comment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitStory(title: string, authorPseudonym: string, story: string, isAnonymous: boolean, authorName: string | null): Promise<void>;
    systemInfo(): Promise<SystemInfo>;
}
