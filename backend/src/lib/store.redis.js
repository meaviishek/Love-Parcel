import { localRedisClient } from '../../config/redis.local.js';

export const storeRefreshTokenInLocalRedis = async (refreshToken, userId) => {
    const ttl = 30 * 24 * 60 * 60; // 30 days

    await localRedisClient.set(
      `rToken:${userId}`,
      refreshToken,
      "EX",
      ttl
    ); // 30 Day Expiry
};


export const getStoredRefreshTokenToLocalRedis = async (userId) => {
    const rtoken = await localRedisClient.get(`rToken:${userId}`);
    return rtoken;
};

export const deleteRedisToken = async (rToken) => {
  // const rToken = await localRedisClient.get(`rToken:${userId}`)
  if(rToken){
    await localRedisClient.del(`rToken:${userId}`)
  }
}
