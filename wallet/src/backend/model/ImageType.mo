import Time "mo:base/Time";
import Int "mo:base/Int";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Buffer "mo:base/Buffer";

module ImageType {

  public type ImageObject = [Nat8];
  public type ImageId = Text;

  public func generateNewRemoteObjectId() : ImageId {
    return Int.toText(Time.now());
  };

  public func imageIdKey (x: ImageId) : Trie.Key<ImageId>{
    { key=x; hash = Text.hash(x) }
  };

}