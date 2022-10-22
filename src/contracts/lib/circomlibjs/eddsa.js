import { Scalar } from "../ffjavascript"
import buildBabyJub from "./babyjub.js"

import { buildPoseidon } from "./poseidon_wasm.js"

/*
import buildPedersenHash from "./pedersen_hash.js"
import buildMimc7 from "./mimc7.js"
import { buildPoseidon } from "./poseidon_wasm.js"
import buildMimcSponge from "./mimcsponge.js"
import createBlakeHash from "blake-hash"
*/

export default async function buildEddsa(poseidonConstants) {
  const babyJub = await buildBabyJub("bn128")
  const poseidon = await buildPoseidon(poseidonConstants)
  /*
    const pedersenHash = await buildPedersenHash()
    const mimc7 = await buildMimc7();
    const poseidon = await buildPoseidon();
    const mimcSponge = await buildMimcSponge();
    return new Eddsa(babyJub, pedersenHash, mimc7, poseidon, mimcSponge);
  */
  return new Eddsa(babyJub, null, null, poseidon, null)
}

class Eddsa {
  constructor(babyJub, pedersenHash, mimc7, poseidon, mimcSponge) {
    this.babyJub = babyJub
    this.pedersenHash = pedersenHash
    this.mimc7 = mimc7
    this.poseidon = poseidon
    this.mimcSponge = mimcSponge
    this.F = babyJub.F
  }

  verifyPoseidon(msg, sig, A) {
    // Check parameters
    if (typeof sig != "object") return false
    if (!Array.isArray(sig.R8)) return false
    if (sig.R8.length != 2) return false
    if (!this.babyJub.inCurve(sig.R8)) return false
    if (!Array.isArray(A)) return false
    if (A.length != 2) return false
    if (!this.babyJub.inCurve(A)) return false
    if (sig.S >= this.babyJub.subOrder) return false

    const hm = this.poseidon([sig.R8[0], sig.R8[1], A[0], A[1], msg])
    const hms = Scalar.e(this.babyJub.F.toObject(hm))

    const Pleft = this.babyJub.mulPointEscalar(this.babyJub.Base8, sig.S)
    let Pright = this.babyJub.mulPointEscalar(A, Scalar.mul(hms, 8))
    Pright = this.babyJub.addPoint(sig.R8, Pright)

    if (!this.babyJub.F.eq(Pleft[0], Pright[0])) return false
    if (!this.babyJub.F.eq(Pleft[1], Pright[1])) return false
    return true
  }

  unpackSignature(sigBuff) {
    return {
      R8: this.babyJub.unpackPoint(sigBuff.slice(0, 32)),
      S: Scalar.fromRprLE(sigBuff, 32, 32),
    }
  }
}
