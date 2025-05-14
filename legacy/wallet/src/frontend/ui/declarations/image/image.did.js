export const idlFactory = ({ IDL }) => {
  const ImageObject = IDL.Vec(IDL.Nat8);
  const ImageId = IDL.Text;
  return IDL.Service({
    'create' : IDL.Func([ImageObject], [ImageId], []),
    'delete' : IDL.Func([ImageId], [], []),
    'getImageById' : IDL.Func([ImageId], [IDL.Opt(ImageObject)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
