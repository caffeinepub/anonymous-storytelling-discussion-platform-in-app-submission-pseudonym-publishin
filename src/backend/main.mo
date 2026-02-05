// No changes needed in backend for this task
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Comment = {
    commenterHandle : Text;
    comment : Text;
    timestamp : Time.Time;
  };

  public type CommentThread = {
    storyTitle : Text;
    comments : [Comment];
  };

  public type Story = {
    title : Text;
    authorPseudonym : Text;
    story : Text;
    timestamp : Time.Time;
    isAnonymous : Bool;
    authorName : ?Text;
  };

  public type UserProfile = {
    name : Text;
  };

  module Story {
    public func compare(story1 : Story, story2 : Story) : Order.Order {
      Text.compare(story1.title, story2.title);
    };
  };

  let stories = List.empty<Story>();
  let publishedTitles = Map.empty<Text, Story>();
  let commentThreads = Map.empty<Text, CommentThread>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // System Info
  public type SystemInfo = { version : Text };

  public query func systemInfo() : async SystemInfo {
    { version = "0.1.0" };
  };

  // User Profile Management
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

  // Story Submission (anyone can submit)
  public shared ({ caller }) func submitStory(
    title : Text,
    authorPseudonym : Text,
    story : Text,
    isAnonymous : Bool,
    authorName : ?Text,
  ) : async () {
    let newStory : Story = {
      title;
      authorPseudonym;
      story;
      timestamp = Time.now();
      isAnonymous;
      authorName;
    };
    stories.add(newStory);
  };

  // Commenting (anyone can comment)
  public shared ({ caller }) func addComment(storyTitle : Text, commenterHandle : Text, comment : Text) : async () {
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

  // Moderation (Admin only) - List submitted stories for moderation
  public query ({ caller }) func getAllStories() : async [Story] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view submitted stories for moderation");
    };
    stories.toArray().sort();
  };

  // Admin function to publish and reword stories
  public shared ({ caller }) func adminRewordAndPublishStory(title : Text, rewordedStory : Text, rewordedPseudonym : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let storyIndex = stories.toArray().findIndex(func(story) { story.title == title });
    switch (storyIndex) {
      case (null) { Runtime.trap("Admin: Could not find story to reword and publish") };
      case (?index) {
        let storiesArray = stories.toArray();
        let storyToPublish = storiesArray[index];
        let publishedStory = {
          title = storyToPublish.title;
          authorPseudonym = rewordedPseudonym;
          story = rewordedStory;
          timestamp = storyToPublish.timestamp;
          isAnonymous = storyToPublish.isAnonymous;
          authorName = storyToPublish.authorName;
        };
        publishedTitles.add(publishedStory.title, publishedStory);
      };
    };
  };

  // Public - View published stories (no auth required)
  public query func getPublishedStory(title : Text) : async Story {
    switch (publishedTitles.get(title)) {
      case (?publishedStory) { publishedStory };
      case (null) { Runtime.trap("Published story not found") };
    };
  };

  public query func getPublishedStories() : async [Story] {
    publishedTitles.values().toArray().sort();
  };
};

