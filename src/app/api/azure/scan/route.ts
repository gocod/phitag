// src/app/api/azure/scan/route.ts
import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

// 🏥 FULL 16-TAG MANIFESTO (Default fallback)
const MANIFESTO_DEFAULTS = [
  "BusinessUnit", "ApplicationName", "Environment", "Owner", 
  "CostCenter", "DataClassification", "Criticality", "ContainsPHI", 
  "HIPAAZone", "EncryptionRequired", "BackupPolicy", "DRClass", 
  "SecurityZone", "ComplianceScope", "ProjectCode", "BudgetOwner"
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // 1. DESTRUCTURE CREDENTIALS FROM UI
    const { 
      subscriptionId: dynamicSubId, 
      schema: frontendSchema,
      tenantId: dynamicTenantId,
      clientId: dynamicClientId,
      clientSecret: dynamicClientSecret
    } = body;

    // 2. VALIDATION
    const tenantId = dynamicTenantId || process.env.AZURE_TENANT_ID;
    const clientId = dynamicClientId || process.env.AZURE_CLIENT_ID;
    const clientSecret = dynamicClientSecret || process.env.AZURE_CLIENT_SECRET;
    const activeSubscriptionId = dynamicSubId || process.env.AZURE_SUBSCRIPTION_ID;

    if (!tenantId || !clientId || !clientSecret || !activeSubscriptionId) {
      return NextResponse.json(
        { error: "Missing Azure credentials. Please check System Settings." }, 
        { status: 400 }
      );
    }

    // 3. DETERMINE THE POLICY (From Frontend or Defaults)
    let mandatoryKeys: string[] = [];
    if (frontendSchema && Array.isArray(frontendSchema) && frontendSchema.length > 0) {
      mandatoryKeys = frontendSchema
        .filter((item: any) => item.requirement === "Mandatory")
        .map((item: any) => item.key);
    } else {
      mandatoryKeys = MANIFESTO_DEFAULTS;
    }

    // 4. AUTHENTICATION & CLIENT INITIALIZATION
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new ResourceManagementClient(credential, activeSubscriptionId);

    const fullInventory = [];
    let compliantCount = 0;
    let totalPHIResources = 0;

    // --- REUSABLE COMPLIANCE ENGINE ---
    const analyzeItem = (item: any, typeLabel: string) => {
      const tags = item.tags || {};
      let missingTags = mandatoryKeys.filter(tag => !tags[tag]);

      const hasPHI = tags["ContainsPHI"]?.toLowerCase() === "yes";
      if (hasPHI) {
        totalPHIResources++;
        // HIPAA Specific rules
        if (!tags["HIPAAZone"]) missingTags.push("HIPAAZone");
        if (!tags["EncryptionRequired"]) missingTags.push("EncryptionRequired");
      }

      missingTags = Array.from(new Set(missingTags));
      const isCompliant = missingTags.length === 0;
      if (isCompliant) compliantCount++;

      return {
        id: item.id,
        name: item.name,
        type: typeLabel,
        isCompliant,
        missingRequirements: missingTags,
        currentTags: tags
      };
    };

    // 5. SCAN BOTH SCOPES
    // Scan Resource Groups
    for await (const rg of client.resourceGroups.list()) {
      fullInventory.push(analyzeItem(rg, "Resource Group"));
    }

    // Scan Individual Resources
    for await (const res of client.resources.list()) {
      fullInventory.push(analyzeItem(res, res.type || "Resource"));
    }

    const total = fullInventory.length;

    // 6. RETURN RESULTS
    return NextResponse.json({
      totalResources: total,
      phiCount: totalPHIResources,
      compliantResources: compliantCount,
      complianceScore: total > 0 ? Math.round((compliantCount / total) * 100) : 100,
      details: fullInventory,
      policyApplied: mandatoryKeys 
    });

  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}