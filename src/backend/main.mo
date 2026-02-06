import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func checkBackendHeartbeat() : async Bool {
    true;
  };

  // *** Story Type ***
  public type Story = {
    title : Text;
    authorPseudonym : Text;
    story : Text;
    timestamp : Time.Time;
    isAnonymous : Bool;
    authorName : ?Text;
    authorPrincipal : ?Principal; // To track submitter for "My Submissions"
  };

  module Story {
    public func compare(story1 : Story, story2 : Story) : Order.Order {
      Text.compare(story1.title, story2.title);
    };
  };

  // *** Comment Type & Thread ***
  public type Comment = {
    commenterHandle : Text;
    comment : Text;
    timestamp : Time.Time;
  };

  // Review/Rating Types
  public type Rating = {
    reviewerHandle : Text;
    rating : Nat8; // 1-5 stars
    comment : ?Text;
    timestamp : Time.Time;
  };

  // Comment Thread per Story
  public type CommentThread = {
    storyTitle : Text;
    comments : [Comment];
  };

  public type ReviewThread = {
    storyTitle : Text;
    reviews : [Rating];
  };

  public type Discussions = {
    comments : [CommentThread];
    reviews : [ReviewThread];
  };

  // User Profiles
  public type UserProfile = {
    name : Text;
  };

  // *** Persistent State Structures ***
  let publishedTitles = Map.empty<Text, Story>();
  let commentThreads = Map.empty<Text, CommentThread>();
  let reviewThreads = Map.empty<Text, ReviewThread>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // *** Pending Stories Storage ***
  let pendingStories = List.empty<Story>();

  // *** System Info ***
  public type SystemInfo = { version : Text };

  public query func systemInfo() : async SystemInfo {
    { version = "0.2.0" };
  };

  // *** User Profile Management ***
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // *** Story Submission (Authenticated Users only) ***
  public shared ({ caller }) func submitStory(
    title : Text,
    authorPseudonym : Text,
    story : Text,
    isAnonymous : Bool,
    authorName : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit stories");
    };

    let newStory : Story = {
      title;
      authorPseudonym;
      story;
      timestamp = Time.now();
      isAnonymous;
      authorName;
      authorPrincipal = ?caller;
    };
    pendingStories.add(newStory);
  };

  // *** New Function: Create and Publish Article ***
  public shared ({ caller }) func adminCreateAndPublishArticle(
    title : Text,
    authorPseudonym : Text,
    story : Text,
    isAnonymous : Bool,
    authorName : ?Text,
    authorPrincipal : ?Principal,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can publish stories");
    };

    let article : Story = {
      title;
      authorPseudonym;
      story;
      timestamp = Time.now();
      isAnonymous;
      authorName;
      authorPrincipal;
    };
    publishedTitles.add(title, article);
  };

  // *** Commenting ***
  public shared ({ caller }) func addComment(storyTitle : Text, commenterHandle : Text, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let newComment : Comment = {
      commenterHandle;
      comment;
      timestamp = Time.now();
    };

    let currentComments = switch (commentThreads.get(storyTitle)) {
      case (null) { [] };
      case (?thread) { thread.comments };
    };

    let updatedCommentThread : CommentThread = {
      storyTitle;
      comments = currentComments.concat([newComment]);
    };

    commentThreads.add(storyTitle, updatedCommentThread);
  };

  // *** Add Review/Rating ***
  public shared ({ caller }) func addReview(storyTitle : Text, reviewerHandle : Text, rating : Nat8, comment : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let newReview : Rating = {
      reviewerHandle;
      rating;
      comment;
      timestamp = Time.now();
    };

    let currentReviews = switch (reviewThreads.get(storyTitle)) {
      case (null) { [] };
      case (?thread) { thread.reviews };
    };

    let updatedReviewThread : ReviewThread = {
      storyTitle;
      reviews = currentReviews.concat([newReview]);
    };

    reviewThreads.add(storyTitle, updatedReviewThread);
  };

  // *** Moderation (Admin only) - List submitted stories for moderation ***
  public query ({ caller }) func getAllPendingStories() : async [Story] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view submitted stories for moderation");
    };
    pendingStories.toArray().sort();
  };

  // *** Admin Function to Publish and Reword Stories ***
  public shared ({ caller }) func adminPublishStory(title : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let storiesArray = pendingStories.toArray();
    let storyIndex = storiesArray.findIndex(func(story) { story.title == title });
    switch (storyIndex) {
      case (null) { Runtime.trap("Could not find story to publish") };
      case (?index) {
        let storyToPublish = storiesArray[index];
        let remainingPendingStories = storiesArray.filter(
          func(story) { story != storyToPublish }
        );
        pendingStories.clear();
        pendingStories.addAll(remainingPendingStories.values());
        publishedTitles.add(storyToPublish.title, storyToPublish);
      };
    };
  };

  // *** Admin Unpublish/Delete Published Articles ***
  public shared ({ caller }) func adminDeletePublishedArticle(title : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete published articles");
    };

    switch (publishedTitles.get(title)) {
      case (null) {
        Runtime.trap("No published article found with the title: " # title);
      };
      case (?_) {
        publishedTitles.remove(title);
      };
    };
  };

  // *** Public Endpoints ***

  // Get specific published story or error
  public query func getPublishedStory(title : Text) : async Story {
    switch (publishedTitles.get(title)) {
      case (?publishedStory) { publishedStory };
      case (null) { Runtime.trap("Published story not found") };
    };
  };

  // Get all published stories (no auth required)
  public query func getPublishedStories() : async [Story] {
    publishedTitles.values().toArray().sort();
  };

  // Get comments for a specific story (for Detail page)
  public query func getStoryComments(storyTitle : Text) : async [Comment] {
    switch (commentThreads.get(storyTitle)) {
      case (null) { Runtime.trap("No comments found for this story") };
      case (?thread) { thread.comments };
    };
  };

  // Get all discussion threads (comments and reviews) for new Discussions page (required by frontend)
  public query func getAllDiscussions() : async Discussions {
    let commentThreadsArr = commentThreads.values().toArray();
    let reviewThreadsArr = reviewThreads.values().toArray();

    {
      comments = commentThreadsArr;
      reviews = reviewThreadsArr;
    };
  };

  // *** My Submissions Page ***
  public type SubmissionStatus = {
    story : Story;
    status : { #published; #pending };
  };

  public query ({ caller }) func getMySubmissions() : async [SubmissionStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };

    let allPendingStories = pendingStories.toArray();
    let pendingSubmissions = allPendingStories.filter(
      func(story) {
        switch (story.authorPrincipal) {
          case (?author) { author == caller };
          case (null) { false };
        };
      }
    ).map(
        func(story) {
          {
            story;
            status = #pending;
          };
        }
      );

    let allPublishedIter = publishedTitles.values();
    let allPublished = allPublishedIter.toArray();
    let publishedSubmissions = allPublished.filter(
      func(story) {
        switch (story.authorPrincipal) {
          case (?author) { author == caller };
          case (null) { false };
        };
      }
    ).map(
        func(story) {
          {
            story;
            status = #published;
          };
        }
      );

    pendingSubmissions.concat(publishedSubmissions);
  };

  // *** Get All Stories with Status (Admin) ***
  public query ({ caller }) func getAllStoriesWithStatus() : async [SubmissionStatus] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all stories with status");
    };

    let allPendingStories = pendingStories.toArray();
    let allPublishedStories = publishedTitles.values().toArray();

    // Map all to status variants
    let pendingWithStatus = allPendingStories.map(
      func(story) {
        {
          story;
          status = #pending;
        };
      }
    );

    let publishedWithStatus = allPublishedStories.map(
      func(story) {
        {
          story;
          status = #published;
        };
      }
    );

    pendingWithStatus.concat(publishedWithStatus);
  };
};
