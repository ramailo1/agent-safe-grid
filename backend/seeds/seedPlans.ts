
import { query } from '../db.ts';

export const seedPlans = async () => {
    try {
        console.log('🌱 [SEED] Checking pricing plans...');

        // Ensure system organization exists
        const systemOrg = await query("SELECT id FROM organizations WHERE id = '11111111-1111-1111-1111-111111111111'");
        if (systemOrg.rows.length === 0) {
            console.log('🌱 [SEED] Creating system organization...');
            await query(
                "INSERT INTO organizations (id, name, slug, tier, created_at) VALUES ('11111111-1111-1111-1111-111111111111', 'System', 'system', 'enterprise', NOW())"
            );
        }

        // Check if plans already exist
        const existingPlans = await query("SELECT * FROM pricing_plans WHERE tenant_id = '11111111-1111-1111-1111-111111111111'");

        if (existingPlans.rows.length > 0) {
            console.log(`🌱 [SEED] ${existingPlans.rows.length} pricing plans already exist.`);

            // Ensure all plans are active
            await query(
                "UPDATE pricing_plans SET is_active = true WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND is_active = false"
            );
            console.log('🌱 [SEED] Ensured all plans are active.');
            return;
        }

        console.log('🌱 [SEED] Seeding default pricing plans...');
        const defaultPlans = [
            {
                name: 'Starter Free',
                price: 0,
                limits: { tokens: 100000, users: 1, storageGB: 1 },
                features: {
                    standardSupport: false,
                    prioritySupport: false,
                    advancedAnalytics: false,
                    customIntegrations: false,
                    sso: false
                },
                isActive: true,
                tierId: 'free'
            },
            {
                name: 'Pro Security',
                price: 99,
                limits: { tokens: 5000000, users: 5, storageGB: 50 },
                features: {
                    standardSupport: true,
                    prioritySupport: false,
                    advancedAnalytics: true,
                    customIntegrations: false,
                    sso: false
                },
                isActive: true,
                tierId: 'pro'
            },
            {
                name: 'Enterprise Grid',
                price: 499,
                limits: { tokens: 'Unlimited', users: 'Unlimited', storageGB: 1000 },
                features: {
                    standardSupport: true,
                    prioritySupport: true,
                    advancedAnalytics: true,
                    customIntegrations: true,
                    sso: true
                },
                isActive: true,
                tierId: 'enterprise'
            }
        ];

        for (const plan of defaultPlans) {
            await query(
                'INSERT INTO pricing_plans (id, tenant_id, name, price, limits, features, is_active, tier_id, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())',
                ['11111111-1111-1111-1111-111111111111', plan.name, plan.price, plan.limits, plan.features, plan.isActive, plan.tierId]
            );
        }

        console.log('✅ [SEED] Successfully seeded 3 pricing plans.');
    } catch (e) {
        console.error('❌ [SEED] Failed to seed plans:', e);
    }
};
