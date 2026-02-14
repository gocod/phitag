import { NextResponse } from "next/server";
import { ResourceManagementClient } from "@azure/arm-resources";
import { ClientSecretCredential } from "@azure/identity";

export async function POST(req: Request) {
  try {
    // 📥 Receive tagUpdates (an object like { DepartmentID: "DEPT-001" })
    const { 
      resourceId, 
      tagUpdates, 
      tenantId, 
      clientId, 
      clientSecret, 
      subscriptionId 
    } = await req.json();

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, subscriptionId);

    // 1. Fetch current resource state
    // We use the ID to get the existing tags so we don't wipe out other metadata
    const resource = await client.resources.getById(resourceId, "2021-04-01");
    
    // 2. Merge existing tags with the new compliant values
    // This priority ensures tagUpdates (your policy) overwrites any non-compliant values
    const finalTags = { 
      ...(resource.tags || {}), 
      ...tagUpdates 
    };

    // 3. Push the update back to Azure
    // beginUpdateByIdAndWait handles the 'Long Running Operation' for you
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
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}