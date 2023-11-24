module.exports = {
  admin: "$ADMIN_PRIVATE_KEY",
  bundler: 
    {"kty":"$BUNDLER_KTY",
    "n":"$BUNDLER_N",
    "e":"$BUNDLER_E",
    "d":"$BUNDLER_D",
    "p":"$BUNDLER_P",
    "q":"$BUNDLER_Q",
    "dp":"$BUNDLER_DP",
    "dq":"$BUNDLER_DQ",
    "qi":"$BUNDLER_QI"
    },
  rollups: { }, // this can be empty or pre-defined
}

