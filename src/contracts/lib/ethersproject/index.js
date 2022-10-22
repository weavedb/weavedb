import { hashMessage } from "./message"
export function verifyMessage(message, signature) {
  return recoverAddress(hashMessage(message), signature)
}
