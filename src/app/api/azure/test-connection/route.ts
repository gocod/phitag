import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tenantId, clientId, clientSecret } = await req.json();

    if (!tenantId || !clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // 🔐 Microsoft OAuth 2.0 Token Endpoint
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('scope', 'https://management.azure.com/.default');
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await response.json();

    if (response.ok && data.access_token) {
      // If we got a token, the credentials are valid!
      return NextResponse.json({ success: true });
    } else {
      // Return the specific error from Microsoft for easier debugging
      console.error('Azure Validation Error:', data);
      return NextResponse.json({ 
        success: false, 
        error: data.error_description || 'Invalid credentials' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}