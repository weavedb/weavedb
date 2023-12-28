import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Trie "mo:base/Trie";
import Text "mo:base/Text";

import ImageType "../model/ImageType";
import ImageStoreHelper "../helper/ImageStoreHelper";

actor ImageBucket {

  type ImageId = ImageType.ImageId;
  type ImageObject = ImageType.ImageObject;

  stable var imageObjectStore : Trie.Trie<ImageId, ImageObject> = Trie.empty();

  // atomic, no await allowed
  public func create(image: ImageObject) : async ImageId {
    let imageId = ImageType.generateNewRemoteObjectId();
    imageObjectStore := ImageStoreHelper.addNewImage(imageObjectStore, image, imageId);

    return imageId;
  };

  public query func getImageById(id: ImageId) : async ?ImageObject {
    return ImageStoreHelper.getImageById(id, imageObjectStore);
  };

  // atomic, no await allowed
  public func delete(id: ImageId) : async () {
    imageObjectStore := ImageStoreHelper.removeImage(imageObjectStore, id);
  };

};