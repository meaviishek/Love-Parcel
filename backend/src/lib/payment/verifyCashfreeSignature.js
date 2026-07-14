import crypto from "node:crypto";

export function verifyCashfreeSignature({
  payload,
  timestamp,
  signature,
  secret,
}) {
  try {
    const signedPayload = timestamp + payload.toString("utf8");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("base64");


    return expectedSignature === signature;
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature),
    //   Buffer.from(expectedSignature)
    // );
  } catch {
    return false;
  }
}
