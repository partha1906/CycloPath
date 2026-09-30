import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'cyclopath-in-memory-demo-secret-key-2026';

export interface UserProfile {
  username: string;
  role: string;
  title: string;
  agency: string;
}

export const DEMO_USERS: Record<string, UserProfile> = {
  admin: {
    username: 'admin',
    role: 'Disaster Management Authority',
    title: 'State Incident Commander',
    agency: 'Odisha State Disaster Management Authority (OSDMA)',
  },
  municipal: {
    username: 'municipal',
    role: 'Municipal Officer',
    title: 'Municipal Commissioner',
    agency: 'Puri Municipal Corporation',
  },
  responder: {
    username: 'responder',
    role: 'Emergency Responder',
    title: 'ODRAF Rapid Action Lead',
    agency: 'Odisha Disaster Rapid Action Force (ODRAF)',
  },
  citizen: {
    username: 'citizen',
    role: 'Public Citizen',
    title: 'Coastal Community Resident',
    agency: 'General Public',
  },
};

export const ROLE_ALIASES: Record<string, string> = {
  Disaster_Authority: 'Disaster Management Authority',
  'Disaster Management Authority': 'Disaster Management Authority',
  Municipal_Officer: 'Municipal Officer',
  'Municipal Officer': 'Municipal Officer',
  First_Responder: 'Emergency Responder',
  Emergency_Responder: 'Emergency Responder',
  'Emergency Responder': 'Emergency Responder',
  Public_Citizen: 'Public Citizen',
  'Public Citizen': 'Public Citizen',
};

function base64urlEncode(data: string | Buffer): string {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
  return buf.toString('base64url');
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

export function createAccessToken(payloadData: Record<string, any>, expiresInSeconds = 86400): string {
  const payload = {
    ...payloadData,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(signingInput).digest();
  const signatureB64 = signature.toString('base64url');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

export function verifyToken(token: string): Record<string, any> {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 segments');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(signingInput).digest();
  const actualSignature = Buffer.from(signatureB64, 'base64url');

  if (actualSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(actualSignature, expectedSignature)) {
    throw new Error('Signature verification failed: invalid token signature');
  }

  const payloadJson = base64urlDecode(payloadB64);
  const payload = JSON.parse(payloadJson);

  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token has expired');
  }

  return payload;
}

export function authenticateUser(username: string, password?: string): UserProfile | null {
  const userKey = username.toLowerCase().trim();
  const user = DEMO_USERS[userKey];
  if (!user || !password) return null;

  // If environment passwords are set, check them; otherwise permit demo fallback
  const passwordEnvMap: Record<string, string | undefined> = {
    admin: process.env.AUTH_DEMO_ADMIN_PASSWORD,
    municipal: process.env.AUTH_DEMO_MUNICIPAL_PASSWORD,
    responder: process.env.AUTH_DEMO_RESPONDER_PASSWORD,
    citizen: process.env.AUTH_DEMO_CITIZEN_PASSWORD,
  };

  const expectedPw = passwordEnvMap[userKey];
  if (expectedPw && expectedPw !== password) {
    return null;
  }
  return user;
}

export function issueTokenForUser(user: UserProfile): string {
  return createAccessToken({
    sub: user.username,
    role: user.role,
    title: user.title,
    agency: user.agency,
  });
}
