import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

const MANIFESTO_DEFAULTS = [
  "BusinessUnit", "ApplicationName", "Environment", "Owner", 
  "CostCenter", "DataClassification", "Criticality", "ContainsPHI", 
  "HIPAAZone", "EncryptionRequired", "BackupPolicy", "DRClass", 
  "SecurityZone", "ComplianceScope", "ProjectCode", "BudgetOwner"
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      subscriptionId: dynamicSubId, 
      schema: frontendSchema,
      tenantId: dynamicTenantId,
      clientId: dynamicClientId,
      clientSecret: dynamicClientSecret
    } = body;

    const tenantId = dynamicTenantId || process.env.AZURE_TENANT_ID;
    const clientId = dynamicClientId || process.env.AZURE_CLIENT_ID;
    const clientSecret = dynamicClientSecret || process.env.AZURE_CLIENT_SECRET;
    const activeSubscriptionId = dynamicSubId || process.env.AZURE_SUBSCRIPTION_ID;

    if (!tenantId || !clientId || !clientSecret || !activeSubscriptionId) {
      return NextResponse.json({ error: "Missing Azure credentials." }, { status: 400 });
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, activeSubscriptionId);

    const fullInventory = [];
    let compliantCount = 0;
    let totalPHIResources = 0;

    // --- 🛡️ IMPROVED VALUE-AWARE COMPLIANCE ENGINE ---
    const analyzeItem = (item: any, typeLabel: string) => {
      const tags = item.tags || {};
      const missingTags: string[] = [];

      // 1. Check Mandatory Tags from Frontend Schema (Value Matching)
      if (frontendSchema && Array.isArray(frontendSchema)) {
        frontendSchema.forEach((rule: any) => {
          if (rule.requirement === "Mandatory") {
            const actualValue = tags[rule.key];
            
            // Handle multiple allowed values (e.g., "DEPT-001, DEPT-002")
            const allowedValues = rule.values 
              ? rule.values.split(',').map((v: string) => v.trim()) 
              : [];

            // 🚩 THE LOGIC FIX: Check if tag is missing OR value is invalid/placeholder
            const isValueValid = actualValue && (allowedValues.length === 0 || allowedValues.includes(actualValue));

            if (!isValueValid) {
              missingTags.push(rule.key);
            }
          }
        });
      } else {
        // Fallback to existence check for 16 defaults if no schema provided
        MANIFESTO_DEFAULTS.forEach(key => {
          if (!tags[key]) missingTags.push(key);
        });
      }

      // 2. HIPAA Specific Logic
      const hasPHI = tags["ContainsPHI"]?.toLowerCase() === "yes";
      if (hasPHI) {
        totalPHIResources++;
        if (!tags["HIPAAZone"]) missingTags.push("HIPAAZone");
        if (!tags["EncryptionRequired"]) missingTags.push("EncryptionRequired");
      }

      const uniqueMissing = Array.from(new Set(missingTags));
      const isCompliant = uniqueMissing.length === 0;
      if (isCompliant) compliantCount++;

      return {
        id: item.id,
        name: item.name,
        type: typeLabel,
        isCompliant,
        missingRequirements: uniqueMissing,
        currentTags: tags
      };
    };

    // 5. SCAN RESOURCES
    for await (const rg of client.resourceGroups.list()) {
      fullInventory.push(analyzeItem(rg, "Resource Group"));
    }
    for await (const res of client.resources.list()) {
      fullInventory.push(analyzeItem(res, res.type || "Resource"));
    }

    const total = fullInventory.length;

    return NextResponse.json({
      totalResources: total,
      phiCount: totalPHIResources,
      compliantResources: compliantCount,
      complianceScore: total > 0 ? Math.round((compliantCount / total) * 100) : 100,
      details: fullInventory
    });

  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}