import path from 'path';
import { MemoryBankManager } from '../../core/MemoryBankManager.js';
import { MigrationUtils } from '../../utils/MigrationUtils.js';
import { FileUtils } from '../../utils/FileUtils.js';
import os from 'os';

/**
 * Definition of the main Memory Bank tools
 */
export const coreTools = [
  {
    name: 'initialize_memory_bank',
    description: 'Initialize a Memory Bank in the specified directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path where the Memory Bank will be initialized',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'set_memory_bank_path',
    description: 'Set a custom path for the Memory Bank',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Custom path for the Memory Bank. If not provided, the current directory will be used.',
        },
      },
      required: [],
    },
  },
  {
    name: 'debug_mcp_config',
    description: 'Debug the current MCP configuration',
    inputSchema: {
      type: 'object',
      properties: {
        verbose: {
          type: 'boolean',
          description: 'Whether to include detailed information',
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: 'read_memory_bank_file',
    description: 'Read a file from the Memory Bank',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the file to read',
        },
      },
      required: ['filename'],
    },
  },
  {
    name: 'write_memory_bank_file',
    description: 'Write to a Memory Bank file',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the file to write',
        },
        content: {
          type: 'string',
          description: 'Content to write to the file',
        },
      },
      required: ['filename', 'content'],
    },
  },
  {
    name: 'list_memory_bank_files',
    description: 'List Memory Bank files',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools',
        },
      },
      required: ['random_string'],
    },
  },
  {
    name: 'get_memory_bank_status',
    description: 'Check Memory Bank status',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools',
        },
      },
      required: ['random_string'],
    },
  },
  {
    name: 'migrate_file_naming',
    description: 'Migrate Memory Bank files from camelCase to kebab-case naming convention',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools',
        },
      },
      required: ['random_string'],
    },
  },
];

/**
 * Processes the set_memory_bank_path tool
 * @param memoryBankManager Memory Bank Manager
 * @param customPath Custom path for the Memory Bank
 * @returns Operation result
 */
export async function handleSetMemoryBankPath(
  memoryBankManager: MemoryBankManager,
  customPath?: string
) {
  // Use the provided path, project path, or the current directory
  const basePath = customPath || memoryBankManager.getProjectPath();
  
  // Ensure the path is absolute
  const absolutePath = path.isAbsolute(basePath) ? basePath : path.resolve(process.cwd(), basePath);
  console.error('Using absolute path for Memory Bank:', absolutePath);
  
  // Set the custom path and check for a memory-bank directory
  await memoryBankManager.setCustomPath(absolutePath);
  
  // Check if a memory-bank directory was found
  const memoryBankDir = memoryBankManager.getMemoryBankDir();
  if (memoryBankDir) {
    return {
      content: [
        {
          type: 'text',
          text: `Memory Bank path set to ${memoryBankDir}`,
        },
      ],
    };
  }
  
  // If we get here, no valid Memory Bank was found
  return {
    content: [
      {
        type: 'text',
        text: `Memory Bank not found in the provided directory. Use initialize_memory_bank to create one.`,
      },
    ],
  };
}

/**
 * Processes the initialize_memory_bank tool
 * @param memoryBankManager Memory Bank Manager
 * @param dirPath Directory path where the Memory Bank will be initialized
 * @returns Operation result
 */
export async function handleInitializeMemoryBank(
  memoryBankManager: MemoryBankManager,
  dirPath: string
) {
  try {
    // If dirPath is not provided, use the project path
    const basePath = dirPath || memoryBankManager.getProjectPath();
    
    // Ensure the path is absolute
    const absolutePath = path.isAbsolute(basePath) ? basePath : path.resolve(process.cwd(), basePath);
    console.error('Using absolute path:', absolutePath);
    
    try {
      // Set the custom path first
      await memoryBankManager.setCustomPath(absolutePath);
      
      // Initialize the Memory Bank with createIfNotExists = true
      await memoryBankManager.initialize(true);
      
      // Get the Memory Bank directory
      const memoryBankDir = memoryBankManager.getMemoryBankDir();
      
      return {
        content: [
          {
            type: 'text',
            text: `Memory Bank initialized at ${memoryBankDir}`,
          },
        ],
      };
    } catch (initError) {
      // Check if the error is related to .clinerules files
      const errorMessage = String(initError);
      if (errorMessage.includes('.clinerules')) {
        console.warn('Warning: Error related to .clinerules files:', initError);
        console.warn('Continuing with Memory Bank initialization despite .clinerules issues.');
        
        // Use the provided path directly as the memory bank directory
        const memoryBankDir = absolutePath;
        try {
          await FileUtils.ensureDirectory(memoryBankDir);
          memoryBankManager.setMemoryBankDir(memoryBankDir);
          
          return {
            content: [
              {
                type: 'text',
                text: `Memory Bank initialized at ${memoryBankDir} (with warnings about .clinerules files)`,
              },
            ],
          };
        } catch (dirError) {
          console.error('Failed to create memory-bank directory:', dirError);
          
          // Try to use an existing memory-bank directory if it exists
          if (await FileUtils.fileExists(memoryBankDir) && await FileUtils.isDirectory(memoryBankDir)) {
            memoryBankManager.setMemoryBankDir(memoryBankDir);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Memory Bank initialized at ${memoryBankDir} (with warnings)`,
                },
              ],
            };
          }
          
          // If we can't create or find a memory-bank directory, return an error
          return {
            content: [
              {
                type: 'text',
                text: `Failed to initialize Memory Bank: ${dirError}`,
              },
            ],
          };
        }
      }
      
      // For other errors, return the error message
      return {
        content: [
          {
            type: 'text',
            text: `Failed to initialize Memory Bank: ${initError}`,
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error initializing Memory Bank: ${error}`,
        },
      ],
    };
  }
}

/**
 * Processes the read_memory_bank_file tool
 * @param memoryBankManager Memory Bank Manager
 * @param filename Name of the file to read
 * @returns Operation result
 */
export async function handleReadMemoryBankFile(
  memoryBankManager: MemoryBankManager,
  filename: string
) {
  try {
    const content = await memoryBankManager.readFile(filename);

    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error reading file ${filename}: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the write_memory_bank_file tool
 * @param memoryBankManager Memory Bank Manager
 * @param filename Name of the file to write
 * @param content Content to write to the file
 * @returns Operation result
 */
export async function handleWriteMemoryBankFile(
  memoryBankManager: MemoryBankManager,
  filename: string,
  content: string
) {
  try {
    await memoryBankManager.writeFile(filename, content);

    return {
      content: [
        {
          type: 'text',
          text: `File ${filename} successfully written to Memory Bank`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error writing file ${filename}: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the list_memory_bank_files tool
 * @param memoryBankManager Memory Bank Manager
 * @returns Operation result
 */
export async function handleListMemoryBankFiles(
  memoryBankManager: MemoryBankManager
) {
  try {
    const files = await memoryBankManager.listFiles();

    return {
      content: [
        {
          type: 'text',
          text: `Files in Memory Bank:\n${files.join('\n')}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error listing Memory Bank files: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the get_memory_bank_status tool
 * @param memoryBankManager Memory Bank Manager
 * @returns Operation result
 */
export async function handleGetMemoryBankStatus(
  memoryBankManager: MemoryBankManager
) {
  try {
    const status = await memoryBankManager.getStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error checking Memory Bank status: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Processes the migrate_file_naming tool
 * @param memoryBankManager Memory Bank Manager instance
 * @returns Operation result
 */
export async function handleMigrateFileNaming(
  memoryBankManager: MemoryBankManager
) {
  try {
    if (!memoryBankManager.getMemoryBankDir()) {
      return {
        content: [
          {
            type: "text",
            text: 'Memory Bank directory not found. Use initialize_memory_bank or set_memory_bank_path first.',
          },
        ],
      };
    }

    const result = await memoryBankManager.migrateFileNaming();
    return {
      content: [
        {
          type: "text",
          text: `Migration completed. ${result.migrated.length} files migrated.`,
        },
      ],
    };
  } catch (error) {
    console.error("Error in handleMigrateFileNaming:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error migrating file naming: ${error}`,
        },
      ],
    };
  }
}

/**
 * Processes the debug_mcp_config tool
 * 
 * This function collects and returns detailed information about the current
 * MCP configuration, including Memory Bank status, mode information, system details,
 * and other relevant configuration data.
 * 
 * @param memoryBankManager Memory Bank Manager instance
 * @param verbose Whether to include detailed information
 * @returns Operation result with configuration details
 */
export async function handleDebugMcpConfig(
  memoryBankManager: MemoryBankManager,
  verbose: boolean = false
) {
  try {
    // Get basic information
    const memoryBankDir = memoryBankManager.getMemoryBankDir();
    const projectPath = memoryBankManager.getProjectPath();
    const language = memoryBankManager.getLanguage();
    const folderName = memoryBankManager.getFolderName();
    
    // Get mode information
    const modeManager = memoryBankManager.getModeManager();
    let modeInfo = null;
    if (modeManager) {
      const currentModeState = modeManager.getCurrentModeState();
      modeInfo = {
        name: currentModeState.name,
        isUmbActive: currentModeState.isUmbActive,
        memoryBankStatus: currentModeState.memoryBankStatus
      };
    }
    
    // Get Memory Bank status
    let memoryBankStatus = null;
    try {
      if (memoryBankDir) {
        memoryBankStatus = await memoryBankManager.getStatus();
      }
    } catch (error) {
      console.error('Error getting Memory Bank status:', error);
    }
    
    // Get system information
    const systemInfo = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      nodeVersion: process.version,
      cwd: process.cwd(),
      env: verbose ? process.env : undefined
    };
    
    // Collect all information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      memoryBank: {
        directory: memoryBankDir,
        projectPath,
        language,
        folderName,
        status: memoryBankStatus
      },
      mode: modeInfo,
      system: systemInfo
    };
    
    return {
      content: [
        {
          type: "text",
          text: `MCP Configuration Debug Information:\n${JSON.stringify(debugInfo, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error in handleDebugMcpConfig:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error debugging MCP configuration: ${error}`,
        },
      ],
      isError: true
    };
  }
}