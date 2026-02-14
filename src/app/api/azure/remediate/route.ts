import { NextResponse } from "next/server";
import { ResourceManagementClient } from "@azure/arm-resources";
import { ClientSecretCredential } from "@azure/identity";

// Ensure Node.js runtime for Azure Identity/Crypto support
export const runtime = 'nodejs';
// Remediation can take a bit longer as it waits for Azure's confirmation
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { 
      resourceId, 
      tagUpdates, 
      tenantId: dTenantId, 
      clientId: dClientId, 
      clientSecret: dClientSecret, 
      subscriptionId: dSubId 
    } = await req.json();

    // Fallback to Env Vars if not provided in body (for Vercel safety)
    const tenantId = dTenantId || process.env.AZURE_TENANT_ID;
    const clientId = dClientId || process.env.AZURE_CLIENT_ID;
    const clientSecret = dClientSecret || process.env.AZURE_CLIENT_SECRET;
    const subscriptionId = dSubId || process.env.AZURE_SUBSCRIPTION_ID;

    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      return NextResponse.json({ error: "Missing credentials for remediation." }, { status: 400 });
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, subscriptionId);

    // 1. Fetch current resource state
    // We use a general API version. Note: Some specialized resources 
    // prefer their specific provider version, but 2021-04-01 is the stable standard for tags.
    const resource = await client.resources.getById(resourceId, "2021-04-01");
    
    // 2. Merge existing tags with the new compliant values
    const finalTags = { 
      ...(resource.tags || {}), 
      ...tagUpdates 
    };

    // 3. Push the update back to Azure
    // Using beginUpdateByIdAndWait ensures the API doesn't return 
    // until Azure has actually registered the change.
    await client.resources.beginUpdateByIdAndWait(
      resourceId, 
      "2021-04-01", 
      { tags: finalTags }
    );

    return NextResponse.json({ 
      success: true, 
      appliedTags: tagUpdates 
    });

  } catch (error: any) {
    console.error("Remediation Error:", error.message);
    
    // Catch common "Scope" errors (e.g., trying to tag a resource the Service Principal can't see)
    const errorMessage = error.message.includes("not found") 
      ? "Resource not found or Permission denied." 
      : error.message;

    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}