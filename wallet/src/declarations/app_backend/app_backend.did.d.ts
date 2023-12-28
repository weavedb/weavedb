import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'app_vetkd_public_key' : ActorMethod<[Array<Uint8Array | number[]>], string>,
  'encrypted_ibe_decryption_key_for_caller' : ActorMethod<
    [Uint8Array | number[]],
    string
  >,
  'encrypted_symmetric_key_for_caller' : ActorMethod<
    [Uint8Array | number[]],
    string
  >,
  'ibe_encryption_key' : ActorMethod<[], string>,
  'symmetric_key_verification_key' : ActorMethod<[], string>,
}
