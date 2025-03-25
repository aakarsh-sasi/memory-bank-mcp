/**
 * Memory Bank file and folder constants
 * 
 * This file contains constants for file names and folder names used in Memory Bank.
 */

/** Default Memory Bank folder name */
export const MEMORY_BANK_FOLDER = 'memory-bank';

/** Product Context file name */
export const PRODUCT_CONTEXT_FILE = 'product-context.md';

/** Active Context file name */
export const ACTIVE_CONTEXT_FILE = 'active-context.md';

/** Progress file name */
export const PROGRESS_FILE = 'progress.md';

/** Decision Log file name */
export const DECISION_LOG_FILE = 'decision-log.md';

/** System Patterns file name */
export const SYSTEM_PATTERNS_FILE = 'system-patterns.md';

/** Default modes configuration */
export const DEFAULT_MODES = {
  architect: {
    description: 'Help architect and design systems',
    prompt: 'I need help with system architecture and design.'
  },
  ask: {
    description: 'Ask general questions about the codebase or development',
    prompt: 'I have a question about the project.'
  },
  code: {
    description: 'Help write or fix code',
    prompt: 'I need help coding a feature or fixing a bug.'
  },
  debug: {
    description: 'Help debug issues in the codebase',
    prompt: 'I need help debugging an issue.'
  },
  test: {
    description: 'Help with writing tests',
    prompt: 'I need help writing tests.'
  }
};

/** Interface for Memory Bank files */
export interface MemoryBankFiles {
  productContext: string;
  activeContext: string;
  progress: string;
  decisionLog: string;
  systemPatterns: string;
}

/** Interface for mode configuration */
export interface ModeConfig {
  description: string;
  prompt: string;
}

/** Interface for product context data */
export interface ProductContext {
  projectName: string;
  description: string;
  objectives: string[];
  requirements: string[];
  constraints: string[];
  stackChoices: string[];
  userStories: string[];
}

/** Interface for active context data */
export interface ActiveContext {
  currentTasks: string[];
  nextSteps: string[];
  issues: string[];
  lastUpdated: string;
}

/** Interface for system patterns data */
export interface SystemPatterns {
  patterns: {
    name: string;
    description: string;
    implementation: string;
  }[];
  architecture: {
    components: string[];
    layers: string[];
    description: string;
  };
}

/** Interface for progress item */
export interface ProgressItem {
  timestamp: string;
  action: string;
  description: string;
  status?: string;
  details?: string;
}

/** Interface for decision */
export interface Decision {
  id: string;
  timestamp: string;
  title: string;
  context: string;
  decision: string;
  alternatives?: string[];
  consequences?: string[];
  status?: string;
}

/** Interface for remote server configuration */
export interface RemoteConfig {
  sshKeyPath: string;
  remoteUser: string;
  remoteHost: string;
  remotePath: string;
} 