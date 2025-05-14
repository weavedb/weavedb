import {
  createActor as createHelloActor,
  canisterId as helloCanisterId,
} from "../declarations/hello"

import {
  createActor as createImageActor,
  canisterId as imageCanisterId,
} from "../declarations/image"

import {
  createActor as createBackendActor,
  canisterId as backendCanisterId,
} from "../declarations/app_backend"

export const makeActor = (canisterId, createActor, identity) => {
  let agentOptions = {
    host: process.env.NEXT_PUBLIC_IC_HOST,
  }
  if (identity) agentOptions.identity = identity
  return createActor(canisterId, {
    agentOptions,
  })
}

export function makeHelloActor(identity) {
  return makeActor(helloCanisterId, createHelloActor, identity)
}

export function makeImageActor(identity) {
  return makeActor(imageCanisterId, createImageActor, identity)
}

export function makeBackendActor(identity) {
  return makeActor(backendCanisterId, createBackendActor, identity)
}
