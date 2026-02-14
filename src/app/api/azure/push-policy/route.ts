import { NextResponse } from "next/server";
import { PolicyClient } from "@azure/arm-policy";
import { ClientSecretCredential } from "@azure/identity";

// Force Node.js runtime for Azure SDK compatibility
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { schema, tenantId, clientId, clientSecret, subscriptionId } = await req.json();

    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      return NextResponse.json(
        { error: "Credentials missing. Check System Settings in the sidebar." }, 
        { status: 400 }
      );
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new PolicyClient(credential, subscriptionId);

    // 🔗 Convert your 16-key manifesto into Azure Policy assignments
    // Note: We use the 'Require a tag on resources' built-in policy (ID: 1e30110a...)
    const policyDefinitions = schema
      .filter((tag: any) => tag.requirement === "Mandatory") // Only enforce mandatory tags
      .map((tag: any, index: number) => ({
        policyDefinitionId: "/providers/Microsoft.Authorization/policyDefinitions/1e30110a-5ceb-460c-80fd-b19f3128996d",
        parameters: { 
          tagName: { value: tag.key } 
        },
        // Azure requires a unique reference ID for each policy within an Initiative
        policyDefinitionReferenceId: `TagEnforcement_${tag.key.replace(/\s+/g, '')}_${index}`
      }));

    if (policyDefinitions.length === 0) {
      return NextResponse.json({ error: "No mandatory tags found to sync." }, { status: 400 });
    }

    // 🚀 Sync the Initiative to Azure
    await client.policySetDefinitions.createOrUpdate("phitag-manifesto-enforcement", {
      displayName: "PHItag Dynamic Manifesto",
      description: `Automated enforcement for ${policyDefinitions.length} mandatory tags.`,
      metadata: { 
        category: "Tags",
        source: "PHItag-Governance-Portal" 
      },
      policyType: "Custom",
      policyDefinitions: policyDefinitions
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${policyDefinitions.length} tags to Azure Policy!` 
    });

  } catch (error: any) {
    console.error("Azure Sync Error:", error.message);
    // Provide a more descriptive error if it's an Authentication issue
    const friendlyError = error.message.includes("Authentication") 
      ? "Azure Auth Failed: Check your Client Secret and Tenant ID." 
      : error.message;
      
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}