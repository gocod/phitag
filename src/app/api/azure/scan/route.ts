import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

// 1. The "Gold Standard" from your Healthcare Tagging Manifesto
const MANDATORY_TAGS = [
  "BusinessUnit",
  "ApplicationName",
  "Environment",
  "Owner",
  "CostCenter",
  "DataClassification",
  "Criticality",
  "ContainsPHI",
  "BackupPolicy",
  "DRClass",
  "SecurityZone",
  "ComplianceScope"
];

export async function POST(req: Request) {
  try {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      return NextResponse.json(
        { error: "Azure credentials missing in environment" },
        { status: 400 }
      );
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, subscriptionId);

    const resources = [];
    let compliantCount = 0;

    // Iterate through all resources in the subscription
    for await (const resource of client.resources.list()) {
      const tags = resource.tags || {};
      
      // Check for the base 12 mandatory tags
      let missingTags = MANDATORY_TAGS.filter(tag => !tags[tag]);

      // 2. CONDITIONAL LOGIC: If PHI is present, ensure extra security tags exist
      const hasPHI = tags["ContainsPHI"]?.toLowerCase() === "yes";
      if (hasPHI) {
        if (!tags["HIPAAZone"]) missingTags.push("HIPAAZone");
        if (!tags["EncryptionRequired"]) missingTags.push("EncryptionRequired");
      }

      const isCompliant = missingTags.length === 0;
      if (isCompliant) compliantCount++;

      resources.push({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        location: resource.location,
        tags: tags,
        isCompliant: isCompliant,
        missingRequirements: missingTags,
        phiStatus: hasPHI ? "High Risk (PHI)" : "Standard"
      });
    }

    // 3. CALCULATE PROFESSIONAL METRICS
    const total = resources.length;
    const nonCompliant = total - compliantCount;
    const score = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalResources: total,
      compliantResources: compliantCount,
      nonCompliantResources: nonCompliant,
      complianceScore: score,
      resources: resources,
    });

  } catch (error: any) {
    console.error("Azure Scan Error:", error);
    return NextResponse.json(
      { error: "Azure Connection Failed", details: error.message },
      { status: 500 }
    );
  }
}