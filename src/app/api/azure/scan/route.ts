import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

// Define the "Gold Standard" for Healthcare Tags
const MANDATORY_HEALTHCARE_TAGS = [
  "ContainsPHI",
  "DataClassification",
  "Environment",
  "Owner"
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

    for await (const resource of client.resources.list()) {
      const tags = resource.tags || {};
      
      // 1. ADVANCED LOGIC: Check for specific Healthcare Keys
      const missingTags = MANDATORY_HEALTHCARE_TAGS.filter(tag => !tags[tag]);
      const isCompliant = missingTags.length === 0;

      if (isCompliant) {
        compliantCount++;
      }

      resources.push({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        location: resource.location,
        tags: tags,
        isCompliant: isCompliant,
        missingRequirements: missingTags, // Tell the UI exactly what's missing
        // 2. PHI Detection (Sales Feature)
        phiStatus: tags["ContainsPHI"] === "Yes" ? "High Risk (PHI)" : "Standard"
      });
    }

    // 3. ENHANCED RESPONSE: Professional metrics for the Dashboard
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalResources: resources.length,
      compliantResources: compliantCount,
      nonCompliantResources: resources.length - compliantCount,
      complianceScore: resources.length > 0 
        ? Math.round((compliantCount / resources.length) * 100) 
        : 100,
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