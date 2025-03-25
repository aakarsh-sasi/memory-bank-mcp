import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MemoryBankManager } from '../core/MemoryBankManager.js';
import { ProgressTracker } from '../core/ProgressTracker.js';
import { setupToolHandlers } from './tools/index.js';
import { setupResourceHandlers } from './resources/index.js';
import { ModeManagerEvent } from '../utils/ModeManager.js';
import { coreTools } from './tools/CoreTools.js';
import { progressTools } from './tools/ProgressTools.js';
import { contextTools } from './tools/ContextTools.js';
import { decisionTools } from './tools/DecisionTools.js';
import { modeTools } from './tools/ModeTools.js';

/**
 * Main MCP server class for Memory Bank
 * 
 * This class is responsible for setting up and running the MCP server
 * that provides tools and resources for managing memory banks.
 */
export class MemoryBankServer {
  private server: Server;
  private memoryBankManager: MemoryBankManager;
  private isRunning: boolean = false;

  /**
   * Creates a new MemoryBankServer instance
   * 
   * Initializes the MCP server with the necessary handlers for tools and resources.
   * @param initialMode Initial mode (optional)
   * @param projectPath Project path (optional)
   * @param userId GitHub profile URL for tracking changes (optional)
   * @param folderName Memory Bank folder name (optional, default: 'memory-bank')
   * @param debugMode Enable debug mode (optional, default: false)
   * @param remoteConfig Remote server configuration (optional)
   */
  constructor(
    initialMode?: string, 
    projectPath?: string, 
    userId?: string, 
    folderName?: string, 
    debugMode?: boolean,
    remoteConfig?: {
      sshKeyPath: string;
      remoteUser: string;
      remoteHost: string;
      remotePath: string;
    }
  ) {
    this.memoryBankManager = new MemoryBankManager(
      projectPath, 
      userId, 
      folderName, 
      debugMode,
      remoteConfig
    );
    
    // Combine all tools
    const allTools = [
      ...coreTools,
      ...progressTools,
      ...contextTools,
      ...decisionTools,
      ...modeTools,
    ];
    
    this.server = new Server(
      {
        name: '@aakarsh-sasi/memory-bank-mcp',
        version: '0.5.0',
      },
      {
        capabilities: {
          tools: {
            tools: allTools,
          },
          resources: {},
        },
      }
    );

    // Set up tool and resource handlers
    setupToolHandlers(
      this.server, 
      this.memoryBankManager, 
      () => this.memoryBankManager.getProgressTracker()
    );
    setupResourceHandlers(this.server, this.memoryBankManager);

    // Initialize the mode manager
    this.memoryBankManager.initializeModeManager(initialMode).catch(error => {
      console.error('Error initializing mode manager:', error);
    });

    // Set up listeners for mode manager events
    const modeManager = this.memoryBankManager.getModeManager();
    if (modeManager) {
      modeManager.on(ModeManagerEvent.MODE_CHANGED, (modeState) => {
        console.error(`Mode changed to: ${modeState.name}`);
        console.error(`Memory Bank status: ${modeState.memoryBankStatus}`);
      });

      modeManager.on(ModeManagerEvent.MODE_TRIGGER_DETECTED, (triggeredModes) => {
        console.error(`Mode triggers detected: ${triggeredModes.join(', ')}`);
      });

      modeManager.on(ModeManagerEvent.UMB_TRIGGERED, () => {
        console.error('UMB mode activated');
      });

      modeManager.on(ModeManagerEvent.UMB_COMPLETED, () => {
        console.error('UMB mode deactivated');
      });
    }

    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
      // Log additional details if available
      if (error instanceof Error && error.stack) {
        console.error('[MCP Error Stack]', error.stack);
      }
    };

    // Handle process termination
    process.on('SIGINT', async () => {
      await this.shutdown();
    });
    
    process.on('SIGTERM', async () => {
      await this.shutdown();
    });
  }

  /**
   * Starts the MCP server
   * 
   * Connects the server to the stdio transport and begins listening for requests.
   */
  async run() {
    if (this.isRunning) {
      console.error('Server is already running');
      return;
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.isRunning = true;
      console.error('Memory Bank MCP server running on stdio');
      
      // Display information about available modes
      const modeManager = this.memoryBankManager.getModeManager();
      if (modeManager) {
        const availableModes = modeManager.getCurrentModeState();
        console.error(`Current mode: ${availableModes.name}`);
        console.error(`Memory Bank status: ${availableModes.memoryBankStatus}`);
      }
    } catch (error) {
      console.error('Failed to start Memory Bank server:', error);
      throw error;
    }
  }

  /**
   * Gracefully shuts down the server
   */
  async shutdown() {
    if (!this.isRunning) {
      return;
    }
    
    console.error('Shutting down Memory Bank server...');
    try {
      // Clean up mode manager resources
      const modeManager = this.memoryBankManager.getModeManager();
      if (modeManager) {
        modeManager.dispose();
      }
      
      await this.server.close();
      this.isRunning = false;
      console.error('Memory Bank server shut down successfully');
    } catch (error) {
      console.error('Error during shutdown:', error);
    } finally {
      process.exit(0);
    }
  }
}