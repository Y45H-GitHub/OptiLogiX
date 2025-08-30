import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
    value: {
        VITE_GOOGLE_MAPS_API_KEY: 'test-api-key'
    }
});