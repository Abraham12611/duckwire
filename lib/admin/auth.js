import crypto from 'crypto';

const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours

function getSecret() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) throw new Error('ADMIN_COOKIE_SECRET is not set');
  return secret;
}

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

export function signSession(username) {
  const iat = Math.floor(Date.now() / 1000);
  const payload = { u: username, iat };
  const payloadB64 = b64url(JSON.stringify(payload));
  const h = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${payloadB64}.${h}`;
}

export function verifySession(token) {
  try {
    if (!token || typeof token !== 'string' || !token.includes('.')) return { valid: false };
    const [payloadB64, sig] = token.split('.');
    const expected = crypto
      .createHmac('sha256', getSecret())
      .update(payloadB64)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (sig !== expected) return { valid: false };
    const payload = JSON.parse(b64urlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.iat + SESSION_TTL_SECONDS < now) return { valid: false };
    return { valid: true, username: payload.u };
  } catch {
    return { valid: false };
  }
}

export const cookieName = 'admin_session';
export const cookieMaxAge = SESSION_TTL_SECONDS;
