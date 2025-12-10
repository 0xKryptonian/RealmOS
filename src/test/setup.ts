import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock env vars
process.env.NEXT_PUBLIC_GLOBAL_CHAT_TOPIC_ID = '0.0.12345';
process.env.HEDERA_OPERATOR_ID = '0.0.123456';
process.env.HEDERA_OPERATOR_KEY = '302e0201...';
