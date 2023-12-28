export const idlFactory = ({ IDL }) => {
  const vetkd_curve = IDL.Variant({ 'bls12_381' : IDL.Null });
  const canister_id = IDL.Principal;
  return IDL.Service({
    'vetkd_encrypted_key' : IDL.Func(
        [
          IDL.Record({
            'key_id' : IDL.Record({ 'name' : IDL.Text, 'curve' : vetkd_curve }),
            'derivation_id' : IDL.Vec(IDL.Nat8),
            'encryption_public_key' : IDL.Vec(IDL.Nat8),
            'public_key_derivation_path' : IDL.Vec(IDL.Vec(IDL.Nat8)),
          }),
        ],
        [IDL.Record({ 'encrypted_key' : IDL.Vec(IDL.Nat8) })],
        [],
      ),
    'vetkd_public_key' : IDL.Func(
        [
          IDL.Record({
            'key_id' : IDL.Record({ 'name' : IDL.Text, 'curve' : vetkd_curve }),
            'canister_id' : IDL.Opt(canister_id),
            'derivation_path' : IDL.Vec(IDL.Vec(IDL.Nat8)),
          }),
        ],
        [IDL.Record({ 'public_key' : IDL.Vec(IDL.Nat8) })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
