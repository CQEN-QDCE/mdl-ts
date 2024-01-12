export enum COSEHeaders {
    RESERVED = 0,
    ALG = 1,
    CRITICAL = 2,
    CONTENT_TYPE = 3,
    KID = 4,
    //IV = 5, // Full Initialization Vector 
    HMAC256 = 5, // TODO: Cette valeur ne va pas ici
    PARTIAL_IV = 6,
    COUNTER_SIGN = 7,
    COUNTER_SIGN0 = 9,
    KID_CONTEXT = 10,
    X5_BAG = 32,
    X5_CHAIN = 33,
    X5_T = 34,
    X5_U = 35,
    EPHEMERAL_KEY = -1,
    STATIC_KEY = -2,
    STATIC_KEY_ID = -3,
    SALT = -20,
    PARTY_U_ID = -21,
    PARTY_U_NONCE = -22,
    PARTY_U_OTHER = -23,
    PARTY_V_ID = -24,
    PARTY_V_NONCE = -25,
    PARTY_V_OTHER = -26,

}