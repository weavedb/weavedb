import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal"

actor {
  type key = HashMap.HashMap<Text, Blob>;
  var data = HashMap.HashMap<Principal, Blob>(0, Principal.equal, Principal.hash);
  var keys = HashMap.HashMap<Principal, key>(0, Principal.equal, Principal.hash);

  public query func listKeys(name : Text) : async [Text] {
    let principal = Principal.fromText(name);
    let _keys = keys.get(principal);
    switch (_keys) {
      case (null) {
        return [];
      };
      case (?key) {
        let size = key.size();
        let buffer = Buffer.Buffer<Text>(size);
        for (v in key.keys()) {
          buffer.add(v);
        };
        Buffer.toArray(buffer);
      };
    };

  };
  public query func getKey(name : Text, id : Text) : async ?Blob {
    let principal = Principal.fromText(name);
    var _key : ?key = keys.get(principal);
    switch (_key) {
      case (null) {
        return null;
      };
      case (?key) {
        return key.get(id);
      };
    };
  };

  public shared(msg) func setKey(id : Text, val : Blob) : async () {
    var _key : ?key = keys.get(msg.caller);
    switch (_key) {
      case (null) {
        keys.put(msg.caller, HashMap.HashMap<Text, Blob>(0, Text.equal, Text.hash));
      };
      case _ {};
    };
    var _key2 : ?key = keys.get(msg.caller);
    switch (_key2) {
      case (?key) { key.put(id, val) };
      case _ {};
    };
  };

  public query func get(name : Text) : async ?Blob {
    let principal = Principal.fromText(name);
    data.get(principal);
  };

  public shared(msg) func save(val : Blob) : async () {
    data.put(msg.caller, val);
  };
};
