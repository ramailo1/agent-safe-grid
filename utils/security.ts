/**
 * Security utilities for the application
 */

/**
 * Clear sensitive data from localStorage on logout
 */
export const clearSensitiveData = (tenantId?: string): void => {
    const sensitiveKeys = [
        'agent_safe_bank_accounts',
        'agent_safe_payment_gateways',
        'agent_safe_api_keys',
        'agent_safe_credentials'
    ];

    sensitiveKeys.forEach(key => {
        if (tenantId) {
            localStorage.removeItem(`${key}_${tenantId}`);
        } else {
            // Clear all tenant variations
            Object.keys(localStorage).forEach(storageKey => {
                if (storageKey.startsWith(key)) {
                    localStorage.removeItem(storageKey);
                }
            });
        }
    });

    console.log('[Security] Cleared sensitive data from localStorage');
};

/**
 * Warn user about localStorage usage on first use
 */
export const warnAboutLocalStorage = (): boolean => {
    const hasWarned = localStorage.getItem('agent_safe_storage_warning_shown');

    if (!hasWarned) {
        console.warn(
            '⚠️ [Security Warning] This application uses localStorage for offline fallback. ' +
            'Sensitive data may be temporarily stored in your browser. ' +
            'For production use, ensure backend API is available for encrypted storage.'
        );
        localStorage.setItem('agent_safe_storage_warning_shown', 'true');
        return true;
    }

    return false;
};

/**
 * Check if sensitive data exists in localStorage
 */
export const hasSensitiveDataInLocalStorage = (): boolean => {
    const sensitiveKeys = [
        'agent_safe_bank_accounts',
        'agent_safe_payment_gateways',
        'agent_safe_api_keys'
    ];

    return Object.keys(localStorage).some(key =>
        sensitiveKeys.some(sensitive => key.includes(sensitive))
    );
};

/**
 * Get size of localStorage data in KB
 */
export const getLocalStorageSize = (): number => {
    let total = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return (total / 1024); // KB
};

/**
 * Migrate data from localStorage to backend
 * Returns number of items migrated
 */
export const migrateLocalStorageToBackend = async (
    tenantId: string,
    apiCall: (endpoint: string, options: any) => Promise<any>
): Promise<number> => {
    let migrated = 0;

    try {
        // Migrate bank accounts
        const bankAccountsKey = `agent_safe_bank_accounts_${tenantId}`;
        const bankAccounts = localStorage.getItem(bankAccountsKey);
        if (bankAccounts) {
            const accounts = JSON.parse(bankAccounts);
            for (const account of accounts) {
                try {
                    await apiCall('/payouts/accounts', {
                        method: 'POST',
                        body: JSON.stringify(account)
                    });
                    migrated++;
                } catch (e) {
                    console.error('Failed to migrate bank account:', e);
                }
            }
            localStorage.removeItem(bankAccountsKey);
        }

        // Migrate payment gateways
        const gatewaysKey = `agent_safe_payment_gateways_${tenantId}`;
        const gateways = localStorage.getItem(gatewaysKey);
        if (gateways) {
            const gatewayConfigs = JSON.parse(gateways);
            for (const gateway of gatewayConfigs) {
                try {
                    await apiCall('/gateways', {
                        method: 'POST',
                        body: JSON.stringify(gateway)
                    });
                    migrated++;
                } catch (e) {
                    console.error('Failed to migrate gateway:', e);
                }
            }
            localStorage.removeItem(gatewaysKey);
        }

        console.log(`[Security] Migrated ${migrated} items from localStorage to backend`);
    } catch (e) {
        console.error('[Security] Migration failed:', e);
    }

    return migrated;
};
