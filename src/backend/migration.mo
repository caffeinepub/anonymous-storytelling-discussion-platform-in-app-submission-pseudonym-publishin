import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldStory = {
    title : Text;
    authorPseudonym : Text;
    story : Text;
    timestamp : Int;
    isAnonymous : Bool;
    authorName : ?Text;
    // authorPrincipal was missing in old version
  };

  type OldActor = {
    stories : List.List<OldStory>;
    publishedTitles : Map.Map<Text, OldStory>;
  };

  type NewStory = {
    title : Text;
    authorPseudonym : Text;
    story : Text;
    timestamp : Int;
    isAnonymous : Bool;
    authorName : ?Text;
    authorPrincipal : ?Principal;
  };

  type NewActor = {
    stories : List.List<NewStory>;
    publishedTitles : Map.Map<Text, NewStory>;
  };

  public func run(old : OldActor) : NewActor {
    let newStories = old.stories.map<OldStory, NewStory>(
      func(oldStory) {
        {
          oldStory with
          authorPrincipal = null; // Default legacy data to null
        };
      }
    );

    let newPublishedTitles = old.publishedTitles.map<Text, OldStory, NewStory>(
      func(_title, oldStory) {
        {
          oldStory with
          authorPrincipal = null;
        };
      }
    );

    {
      old with
      stories = newStories;
      publishedTitles = newPublishedTitles;
    };
  };
};
