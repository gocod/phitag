"use client";

/**
 * TIER HIERARCHY:
 * free (0) -> pro (1) -> elite (2)
 * * Note: Clinical Pilot users are assigned the 'pro' tier in Firestore
 * to unlock Governance features immediately.
 */

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
  // 🎯 Use the lowercase tier synced by our updated NextAuth logic
  const userTier: Tier = (session?.user?.tier as Tier) || 'free';

  const permissions: Permissions = {
    // Both Pro and Elite get 'Deny' enforcement capabilities.
    canEnforceDeny: userTier === 'pro' || userTier === 'elite',

    // 💡 TWEAK: Let's give Pro/Pilot users Export rights for the demo.
    // Healthcare stakeholders usually need to see the Excel/PDF output.
    canExportAudit: userTier === 'pro' || userTier === 'elite',

    // Pro and Elite get full history access beyond the default 7 days.
    canAccessHistory: userTier !== 'free',

    // Pilot/Pro/Elite get the full 16-tag HIPAA schema; Free tier is limited.
    maxTags: userTier === 'free' ? 5 : 16,

    // Friendly display name for the UI (e.g., "PRO", "ELITE")
    tierName: userTier.toUpperCase(),

    /**
     * @param featureTier The tier required to use a specific button or page.
     * @returns boolean - True if the user needs to pay more to see it.
     */
    isUpgradeRequired: (featureTier: Tier) => {
      const hierarchy: Record<Tier, number> = { 
        free: 0, 
        pro: 1, 
        elite: 2 
      };
      
      const currentLevel = hierarchy[userTier] ?? 0;
      const requiredLevel = hierarchy[featureTier] ?? 0;
      
      return currentLevel < requiredLevel;
    }
  };

  return permissions;
}