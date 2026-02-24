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
  // Note: If the pilot sets tier to 'pro' in the DB, this remains seamless.
  const userTier: Tier = (session?.user?.tier as Tier) || 'free';

  // 🛡️ Logic Gates
  const permissions: Permissions = {
    // Both Pro and Elite (and thus Pilot users) get Deny mode
    canEnforceDeny: userTier === 'pro' || userTier === 'elite',

    // Only Elite can export the HIPAA Audit Vault. 
    // (If you want Pilot users to have this, add 'pro' here)
    canExportAudit: userTier === 'elite',

    // Pro and Elite get full history access
    canAccessHistory: userTier !== 'free',

    // Pilot/Pro/Elite get the full 16-tag healthcare schema
    maxTags: userTier === 'free' ? 5 : 16,

    // Display "PRO" even if they are in the Pilot phase
    tierName: userTier.toUpperCase(),

    // Helper function for the UI "Locks"
    isUpgradeRequired: (featureTier: Tier) => {
      const hierarchy = { free: 0, pro: 1, elite: 2 };
      
      // Safety check for unexpected tier strings
      const currentLevel = hierarchy[userTier] ?? 0;
      const requiredLevel = hierarchy[featureTier] ?? 0;
      
      return currentLevel < requiredLevel;
    }
  };

  return permissions;
}