import { arrayBufferToImgSrc } from "../utils/image"
import { makeImageActor } from "./actor-locator"

export const loadImage = async id => {
  const actorService = await makeImageActor()
  const result = await actorService.getImageById(id)
  if (result.length == 0) {
    return null
  }

  const imageArray = result[0]
  const imageSource = arrayBufferToImgSrc(imageArray)
  return imageSource
}
