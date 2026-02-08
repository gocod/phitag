import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

// 1. MANDATORY BASE KEYS (Items 1-7, 11-14 from Manifesto)
// These are always required regardless of data type.
const MANDATORY_BASE_TAGS = [
  "BusinessUnit",        // 1: Identifies the healthcare business unit [cite: 1]
  "ApplicationName",     // 2: Associated application or service [cite: 1]
  "Environment",         // 3: Defines operational/compliance controls [cite: 1]
  "Owner",               // 4: Accountable technical or business owner [cite: 1]
  "CostCenter",          // 5: Used for healthcare cost allocation [cite: 1, 2]
  "DataClassification",  // 6: Defines sensitivity of data 
  "Criticality",         // 7: Determines uptime and DR recovery 
  "ContainsPHI",         // 8: Identifies if PHI is stored/processed 
  "BackupPolicy",        // 11: Determines data protection strategy 
  "DRClass",             // 12: Disaster recovery tier 
  "SecurityZone",        // 13: Network exposure and security posture [cite: 4]
  "ComplianceScope"      // 14: Regulatory frameworks (HIPAA, HITRUST, etc) [cite: 4]
];

// 2. RECOMMENDED KEYS (Items 15-16 from Manifesto)
// These are recommended but do not impact the "Compliant" boolean.
const RECOMMENDED_TAGS = [
  "ProjectCode",         // 15: Tracks investment/initiative funding [cite: 4]
  "BudgetOwner"          // 16: Owner of cloud budget for forecasting 
];

export async function POST(req: Request) {
  try {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

    if (!tenantId || !clientId || !clientSecret || !subscriptionId) {
      return NextResponse.json({ error: "Azure credentials missing" }, { status: 400 });
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, subscriptionId);

    const resources = [];
    let compliantCount = 0;
    let totalPHIResources = 0;

    for await (const resource of client.resources.list()) {
      const tags = resource.tags || {};
      
      // Step A: Check base mandatory tags
      let missingTags = MANDATORY_BASE_TAGS.filter(tag => !tags[tag]);

      // Step B: PHI Conditional Logic (Items 9 & 10)
      // If ContainsPHI is "Yes", HIPAAZone and EncryptionRequired are required.
      const hasPHI = tags["ContainsPHI"]?.toLowerCase() === "yes";
      if (hasPHI) {
        totalPHIResources++;
        if (!tags["HIPAAZone"]) missingTags.push("HIPAAZone");           // 9 
        if (!tags["EncryptionRequired"]) missingTags.push("EncryptionRequired"); // 10 
      }

      const isCompliant = missingTags.length === 0;
      if (isCompliant) compliantCount++;

      // Step C: Identify missing recommended tags (for UI suggestions)
      const missingRecommended = RECOMMENDED_TAGS.filter(tag => !tags[tag]);

      resources.push({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        location: resource.location,
        isCompliant,
        phiStatus: hasPHI ? "High Risk (PHI)" : "Standard",
        missingRequirements: missingTags,
        missingRecommended: missingRecommended,
        tags: tags
      });
    }

    // 3. AGGREGATE METRICS FOR THE SNAPSHOT UI
    const total = resources.length;
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalResources: total,
      phiWorkloads: totalPHIResources,
      compliantResources: compliantCount,
      complianceScore: total > 0 ? Math.round((compliantCount / total) * 100) : 100,
      resources: resources
    });

  } catch (error: any) {
    console.error("Azure Scan Error:", error);
    return NextResponse.json(
      { error: "Scan Failed", details: error.message },
      { status: 500 }
    );
  }
}