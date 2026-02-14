import { NextResponse } from "next/server";
import { PolicyClient } from "@azure/arm-policy";
import { ClientSecretCredential } from "@azure/identity";

// Essential for Vercel deployment stability
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // 1. Destructure the credentials sent from your UI
    const { schema, tenantId, clientId, clientSecret, subscriptionId } = await req.json();

    // 2. Validation
    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      return NextResponse.json(
        { error: "Credentials missing from request body. Check System Settings." }, 
        { status: 400 }
      );
    }

    // 3. Use the dynamic credentials
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new PolicyClient(credential, subscriptionId);

    // 4. Convert UI Schema into Azure Policy 'Parameters'
    // This uses your working Subscription-scoped path format
    const policyDefinitions = schema.map((tag: any, index: number) => ({
      policyDefinitionId: `/subscriptions/${subscriptionId}/providers/Microsoft.Authorization/policyDefinitions/1e30110a-5ceb-460c-80fd-b19f3128996d`,
      parameters: { tagName: { value: tag.key } },
      // Added this only to prevent "Duplicate Reference" errors in the Initiative
      policyDefinitionReferenceId: `Tag_${tag.key.replace(/[^a-zA-Z0-9]/g, '')}_${index}`
    }));

    // 5. Update the Initiative
    await client.policySetDefinitions.createOrUpdate("phitag-manifesto-enforcement", {
      displayName: "PHItag Dynamic Manifesto",
      description: "Customized via PHItag Website",
      metadata: { category: "Tags" },
      policyDefinitions: policyDefinitions
    });

    return NextResponse.json({ success: true, message: "Azure Policy Updated!" });
  } catch (error: any) {
    console.error("Azure Sync Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}