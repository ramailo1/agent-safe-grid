/**
 * Test User Fixtures for E2E Testing
 * 
 * These credentials match the seeded admin user in the database.
 * For production tests, these should be created via a test setup script.
 */

export const testUsers = {
    admin: {
        email: 'admin@agentgrid.com',
        password: 'SecureAdminPassword123!',
        role: 'owner',
        organization: 'Platform HQ'
    },

    // Additional test users can be added here
    // Note: These need to be seeded in the database first
};

export const TEST_TIMEOUTS = {
    navigation: 10000,
    apiCall: 5000,
    pageLoad: 30000,
};
