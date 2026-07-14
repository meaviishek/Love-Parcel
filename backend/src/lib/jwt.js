import jwt from "jsonwebtoken";


const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;


export const generateAccessToken = (payload) => {
    return jwt.sign( payload, ACCESS_SECRET, {
        expiresIn: "15min"
    }
)};

export const generateRefreshToken = (payload) => {
    return jwt.sign( payload, REFRESH_SECRET, {
        expiresIn: "30d"
    })
};


/**
 * VERIFY TOKEN
**/

export const verifyRefreshToken = (token) => {
    if (!REFRESH_SECRET ) {
      throw new Error("JWT_REFRESH_KEY is not defined");
    }
    return jwt.verify(token, REFRESH_SECRET );
  };

export const verifyAccessToken = (token) => {
    if(!ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_KEY is not defined");
    }
    return jwt.verify(token, ACCESS_SECRET);
};
