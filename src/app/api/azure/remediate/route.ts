import { NextResponse } from "next/server";
import { ResourceManagementClient } from "@azure/arm-resources";
import { ClientSecretCredential } from "@azure/identity";

export async function POST(req: Request) {
  try {
    const { resourceId, missingTags, tenantId, clientId, clientSecret, subscriptionId } = await req.json();

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, subscriptionId);

    // 1. Get existing tags first (to avoid overwriting existing ones)
    const resource = await client.resources.getById(resourceId, "2021-04-01");
    const updatedTags = { ...(resource.tags || {}) };

    // 2. Add missing tags with placeholder values
    missingTags.forEach((tag: string) => {
      updatedTags[tag] = "PHITAG-AUTO-FIXED";
    });

    // 3. Update the resource
    await client.resources.beginUpdateByIdAndWait(resourceId, "2021-04-01", { tags: updatedTags });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}