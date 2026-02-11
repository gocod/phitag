import { NextResponse } from "next/server";
import { PolicyClient } from "@azure/arm-policy";
import { ClientSecretCredential } from "@azure/identity";

export async function POST(req: Request) {
  try {
    const { schema, subscriptionId } = await req.json();
    const subId = subscriptionId || process.env.AZURE_SUBSCRIPTION_ID!;
    
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!
    );
    const client = new PolicyClient(credential, subId);

    // 1. Convert your UI Schema into Azure Policy 'Parameters'
    const policyDefinitions = schema.map((tag: any) => ({
      policyDefinitionId: "/providers/Microsoft.Authorization/policyDefinitions/1e30110a-5ceb-460c-80fd-b19f3128996d", // Built-in "Require a tag"
      parameters: { tagName: { value: tag.key } }
    }));

    // 2. Update the Initiative (Set Definition) in Azure
    // This 'overwrites' the old list of 16 with the customer's new list
    const result = await client.policySetDefinitions.createOrUpdate("phitag-manifesto-enforcement", {
      displayName: "PHItag Dynamic Manifesto",
      description: "Customized via PHItag Website",
      metadata: { category: "Tags" },
      policyDefinitions: policyDefinitions
    });

    return NextResponse.json({ success: true, message: "Azure Policy Updated!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}