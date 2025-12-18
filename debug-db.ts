
import { query } from './backend/db.ts';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const debug = async () => {
    try {
        console.log('Checking organizations...');
        const orgs = await query('SELECT * FROM organizations');
        console.log('Orgs:', orgs.rows);

        console.log('Checking pricing_plans...');
        const plans = await query('SELECT * FROM pricing_plans');
        console.log('Plans:', plans.rows);

        // Check if 'system' org exists
        const systemOrg = orgs.rows.find((o: any) => o.id === 'system');
        if (!systemOrg) {
            console.log("System org does not exist!");
        }

    } catch (e) {
        console.error('Error:', e);
    }
};

debug();
