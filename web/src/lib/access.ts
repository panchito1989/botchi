/**
 * Centralized feature/module gating.
 *
 * Beta: everything is free. This is the single switch for future monetization —
 * when paid plans launch, change `canUseModule` to compare the parent's
 * subscription tier against `module.min_tier` (data already in the DB). No other
 * file should branch on subscription status; route all gating through here.
 */

export const MONETIZATION_ENABLED = false;

type ModuleGate = { min_tier: string | null; is_premium: boolean };
type SubContext = { tierId: string };

export function canUseModule(_module: ModuleGate, _sub: SubContext): boolean {
  if (!MONETIZATION_ENABLED) return true;
  // Future: rank tiers and require sub.tierId >= module.min_tier.
  return true;
}

export function isLocked(module: ModuleGate, sub: SubContext): boolean {
  return !canUseModule(module, sub);
}
