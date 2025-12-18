
import { query } from '../db.ts';

export const fixSystemOrg = async () => {
    try {
        console.log('Checking for system organization...');
        const res = await query("SELECT id FROM organizations WHERE id = '11111111-1111-1111-1111-111111111111'");

        if (res.rows.length === 0) {
            console.log("Creating 'system' organization...");
            await query(
                "INSERT INTO organizations (id, name, slug, tier, created_at) VALUES ('11111111-1111-1111-1111-111111111111', 'System', 'system', 'enterprise', NOW())"
            );
            console.log("'system' organization created.");
        } else {
            console.log("'system' organization already exists.");
        }
    } catch (e) {
        console.error('Failed to fix system org:', e);
    }
};

fixSystemOrg();
