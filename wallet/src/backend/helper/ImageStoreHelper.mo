import Trie "mo:base/Trie";
import Text "mo:base/Text";

import ImageType "../model/ImageType";

module ImageStoreHelper {

  type ImageStore = Trie.Trie<ImageId, ImageObject>;
  type ImageObject = ImageType.ImageObject;
  type ImageId = ImageType.ImageId;

  public func addNewImage(imageObjectStore: ImageStore, image: ImageObject, imageId: ImageId) : ImageStore {
    let newStore = Trie.put(
                    imageObjectStore,
                    ImageType.imageIdKey(imageId),
                    Text.equal,
                    image
                  ).0;

    return newStore;
  };

  public func removeImage(imageObjectStore: ImageStore, imageId: ImageId) : ImageStore {
    let newStore = Trie.remove(
                    imageObjectStore,
                    ImageType.imageIdKey(imageId),
                    Text.equal,
                  ).0;

    return newStore;
  };

  public func getImageById(id: ImageId, imageObjectStore: Trie.Trie<ImageId, ImageObject>) : ?ImageObject {
    return Trie.find<ImageId, ImageObject>(imageObjectStore, ImageType.imageIdKey(id), Text.equal);
  };

}