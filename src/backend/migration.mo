import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type Story = {
    title : Text;
    authorPseudonym : Text;
    story : Text;
    timestamp : Int;
    isAnonymous : Bool;
    authorName : ?Text;
    authorPrincipal : ?Principal;
  };

  type OldActor = {
    publishedTitles : Map.Map<Text, Story>;
    commentThreads : Map.Map<Text, { storyTitle : Text; comments : [Comment] }>;
    reviewThreads : Map.Map<Text, { storyTitle : Text; reviews : [Rating] }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    stories : List.List<Story>;
  };

  type Comment = {
    commenterHandle : Text;
    comment : Text;
    timestamp : Int;
  };

  type Rating = {
    reviewerHandle : Text;
    rating : Nat8;
    comment : ?Text;
    timestamp : Int;
  };

  type NewActor = {
    publishedTitles : Map.Map<Text, Story>;
    commentThreads : Map.Map<Text, { storyTitle : Text; comments : [Comment] }>;
    reviewThreads : Map.Map<Text, { storyTitle : Text; reviews : [Rating] }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    pendingStories : List.List<Story>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      pendingStories = old.stories;
    };
  };
};
