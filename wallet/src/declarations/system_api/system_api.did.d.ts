import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type canister_id = Principal;
export type vetkd_curve = { 'bls12_381' : null };
export interface _SERVICE {
  'vetkd_encrypted_key' : ActorMethod<
    [
      {
        'key_id' : { 'name' : string, 'curve' : vetkd_curve },
        'derivation_id' : Uint8Array | number[],
        'encryption_public_key' : Uint8Array | number[],
        'public_key_derivation_path' : Array<Uint8Array | number[]>,
      },
    ],
    { 'encrypted_key' : Uint8Array | number[] }
  >,
  'vetkd_public_key' : ActorMethod<
    [
      {
        'key_id' : { 'name' : string, 'curve' : vetkd_curve },
        'canister_id' : [] | [canister_id],
        'derivation_path' : Array<Uint8Array | number[]>,
      },
    ],
    { 'public_key' : Uint8Array | number[] }
  >,
}
