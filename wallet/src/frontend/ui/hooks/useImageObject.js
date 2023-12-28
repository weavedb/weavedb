import { useState, useEffect } from "react"
import { loadImage } from "../service/image-service"

export const useImageObject = imageId => {
  const [imgSrc, setImgSrc] = useState("")
  const [imgId, setImgId] = useState("")

  useEffect(() => {
    async function fetchImage() {
      if (imageId && imageId != "") {
        if (imageId == imgId) {
          // return existing src
          return imgSrc
        }

        const imageSource = await loadImage(imageId)

        // Make sure to revoke the data uris to avoid memory leaks
        if (imgSrc && imgSrc != "") URL.revokeObjectURL(imgSrc)

        setImgSrc(imageSource)
        setImgId(imageId)
      } else {
        setImgSrc(null)
      }
    }

    fetchImage()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId])

  return imgSrc
}
