import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'get' : ActorMethod<[string], [] | [Uint8Array | number[]]>,
  'getKey' : ActorMethod<[string, string], [] | [Uint8Array | number[]]>,
  'listKeys' : ActorMethod<[string], Array<string>>,
  'save' : ActorMethod<[Uint8Array | number[]], undefined>,
  'setKey' : ActorMethod<[string, Uint8Array | number[]], undefined>,
}
