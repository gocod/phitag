import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

// 🏥 FALLBACK MANIFESTO (Used if the user hasn't customized anything)
const MANIFESTO_DEFAULTS = [
  "BusinessUnit", "ApplicationName", "Environment", "Owner", 
  "CostCenter", "DataClassification", "Criticality", "ContainsPHI", 
  "BackupPolicy", "DRClass", "SecurityZone", "ComplianceScope"
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subscriptionId: dynamicId, schema: frontendSchema } = body;

    // 1. DETERMINE THE POLICY TO ENFORCE
    // If frontend sent a custom schema, use only the 'Mandatory' keys from it.
    // Otherwise, use our hardcoded fallback list.
    let mandatoryKeys: string[] = [];

    if (frontendSchema && Array.isArray(frontendSchema) && frontendSchema.length > 0) {
      mandatoryKeys = frontendSchema
        .filter((item: any) => item.requirement === "Mandatory")
        .map((item: any) => item.key);
    } else {
      mandatoryKeys = MANIFESTO_DEFAULTS;
    }

    // 2. AUTHENTICATION
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const activeSubscriptionId = dynamicId || process.env.AZURE_SUBSCRIPTION_ID;

    if (!activeSubscriptionId || !tenantId || !clientId || !clientSecret) {
      return NextResponse.json({ error: "Configuration Missing" }, { status: 500 });
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, activeSubscriptionId);

    const resourcesList = [];
    let compliantCount = 0;
    let totalPHIResources = 0;

    // 3. SCAN RESOURCES
    for await (const resource of client.resources.list()) {
      const tags = resource.tags || {};
      
      // Check against the dynamically determined mandatoryKeys
      let missingTags = mandatoryKeys.filter(tag => !tags[tag]);

      // Keep the specific Healthcare PHI logic
      const hasPHI = tags["ContainsPHI"]?.toLowerCase() === "yes";
      if (hasPHI) {
        totalPHIResources++;
        // Check for the specific PHI conditional tags if they are in our policy
        if (!tags["HIPAAZone"]) missingTags.push("HIPAAZone");
        if (!tags["EncryptionRequired"]) missingTags.push("EncryptionRequired");
      }

      // Deduplicate in case HIPAAZone was already in mandatoryKeys
      missingTags = Array.from(new Set(missingTags));

      const isCompliant = missingTags.length === 0;
      if (isCompliant) compliantCount++;

      resourcesList.push({
        id: resource.id,
        name: resource.name,
        isCompliant,
        missingRequirements: missingTags,
      });
    }

    const total = resourcesList.length;
    return NextResponse.json({
      totalResources: total,
      phiCount: totalPHIResources,
      compliantResources: compliantCount,
      complianceScore: total > 0 ? Math.round((compliantCount / total) * 100) : 100,
      policyApplied: mandatoryKeys // Handy for debugging!
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}