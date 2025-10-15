import { prisma } from './db';

export interface XeroTokenData {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresAt: Date;
  tenantId?: string;
  tenantType?: string;
  tenantName?: string;
}

export async function saveXeroToken(tokenData: XeroTokenData) {
  try {
    // Delete existing token (only keep one active token)
    await prisma.xeroToken.deleteMany({});
    
    // Save new token
    const savedToken = await prisma.xeroToken.create({
      data: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenType: tokenData.tokenType || 'Bearer',
        expiresAt: tokenData.expiresAt,
        tenantId: tokenData.tenantId,
        tenantType: tokenData.tenantType,
        tenantName: tokenData.tenantName,
      },
    });
    
    return savedToken;
  } catch (error) {
    console.error('Error saving Xero token:', error);
    throw error;
  }
}

export async function getXeroToken() {
  try {
    const token = await prisma.xeroToken.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    
    return token;
  } catch (error) {
    console.error('Error retrieving Xero token:', error);
    return null;
  }
}

export async function isTokenExpired(token: { expiresAt: Date }): Promise<boolean> {
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return token.expiresAt.getTime() - bufferTime < now.getTime();
}

export async function deleteXeroToken() {
  try {
    await prisma.xeroToken.deleteMany({});
  } catch (error) {
    console.error('Error deleting Xero token:', error);
    throw error;
  }
}

export async function refreshXeroToken(refreshToken: string) {
  try {
    const response = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokenData = await response.json();
    
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    
    const newTokenData: XeroTokenData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken, // Use new refresh token if provided
      tokenType: tokenData.token_type || 'Bearer',
      expiresAt,
    };

    return await saveXeroToken(newTokenData);
  } catch (error) {
    console.error('Error refreshing Xero token:', error);
    throw error;
  }
}

export async function getValidXeroToken() {
  try {
    const token = await getXeroToken();
    
    if (!token) {
      return null;
    }
    
    if (await isTokenExpired(token)) {
      console.log('Token expired, attempting to refresh...');
      try {
        const refreshedToken = await refreshXeroToken(token.refreshToken);
        return refreshedToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        await deleteXeroToken();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting valid Xero token:', error);
    return null;
  }
}