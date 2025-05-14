import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ImageId = string;
export type ImageObject = Uint8Array | number[];
export interface _SERVICE {
  'create' : ActorMethod<[ImageObject], ImageId>,
  'delete' : ActorMethod<[ImageId], undefined>,
  'getImageById' : ActorMethod<[ImageId], [] | [ImageObject]>,
}
