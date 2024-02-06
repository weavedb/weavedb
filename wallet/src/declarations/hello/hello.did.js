export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'get' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'getKey' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'listKeys' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'save' : IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    'setKey' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
