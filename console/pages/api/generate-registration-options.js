const { generateRegistrationOptions } = require("@simplewebauthn/server")

export default function handler(req, res) {
  // Human-readable title for your website
  const rpName = "WeaveDB"
  // A unique identifier for your website
  const rpID = "localhost"
  // The URL at which registrations and authentications should occur
  const origin = `http://${rpID}`
  const user = { id: "weavedb", username: "weave_db" }
  const options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.username,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: "none",
    residentKey: "required",
    // Prevent users from re-registering existing authenticators
    excludeCredentials: [],
    /*excludeCredentials: userAuthenticators.map(authenticator => ({
      id: authenticator.credentialID,
      type: "public-key",
      // Optional
      transports: authenticator.transports,
    })),*/
  })
  res.status(200).json(options)
}
