import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollIntoView which isn't implemented in JSDOM
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.scrollTo = vi.fn();
