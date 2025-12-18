
import { query } from '../db.ts';

const activatePlans = async () => {
    try {
        console.log('Activating all pricing plans...');
        const result = await query(
            "UPDATE pricing_plans SET is_active = true WHERE tenant_id = '11111111-1111-1111-1111-111111111111'"
        );
        console.log(`Activated ${result.rowCount} plans.`);
    } catch (e) {
        console.error('Failed to activate plans:', e);
    }
};

activatePlans();
