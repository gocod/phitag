"use client";

export type Tier = 'free' | 'pro' | 'elite';

interface Permissions {
  canEnforceDeny: boolean;
  canExportAudit: boolean;
  canAccessHistory: boolean;
  maxTags: number;
  tierName: string;
  isUpgradeRequired: (featureTier: Tier) => boolean;
}

export function usePermissions(session: any): Permissions {
  // 🎯 Extract tier from session. Default to 'free' if not set.
  const userTier: Tier = (session?.user?.tier as Tier) || 'free';

  // 🛡️ Logic Gates
  const permissions: Permissions = {
    // Only Pro and Elite can turn on "Deny" mode in settings
    canEnforceDeny: userTier === 'pro' || userTier === 'elite',

    // Only Elite can export the HIPAA Audit Vault to PDF/CSV
    canExportAudit: userTier === 'elite',

    // Free users only see the last 24h of infrastructure history
    canAccessHistory: userTier !== 'free',

    // Enforce the Healthcare Manifesto tag limit
    maxTags: userTier === 'free' ? 5 : 16,

    tierName: userTier.toUpperCase(),

    // Helper function to check if a user needs to upgrade for a specific feature
    isUpgradeRequired: (featureTier: Tier) => {
      const hierarchy = { free: 0, pro: 1, elite: 2 };
      return hierarchy[userTier] < hierarchy[featureTier];
    }
  };

  return permissions;
}