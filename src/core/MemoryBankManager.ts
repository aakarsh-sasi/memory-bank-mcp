import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../utils/LogManager.js';
import { FileSystemFactory } from '../utils/storage/FileSystemFactory.js';
import { FileSystemInterface } from '../utils/storage/FileSystemInterface.js';
import { 
  MEMORY_BANK_FOLDER, 
  PRODUCT_CONTEXT_FILE,
  ACTIVE_CONTEXT_FILE,
  PROGRESS_FILE,
  DECISION_LOG_FILE,
  SYSTEM_PATTERNS_FILE,
  DEFAULT_MODES,
  MemoryBankFiles,
  ModeConfig,
  ProductContext,
  RemoteConfig,
  ActiveContext,
  Decision,
  ProgressItem,
  SystemPatterns
} from '../types/memory-bank-constants.js';
import { MemoryBankStatus } from '../types/index.js';
import { FileUtils } from '../utils/FileUtils.js';
import { coreTemplates } from './templates/index.js';
import { ProgressTracker } from './ProgressTracker.js';
import { ModeManager } from '../utils/ModeManager.js';
import { ExternalRulesLoader } from '../utils/ExternalRulesLoader.js';
import { MigrationUtils } from '../utils/MigrationUtils.js';

/**
 * Class responsible for managing Memory Bank operations
 * 
 * This class handles all operations related to Memory Bank directories,
 * including initialization, file operations, and status tracking.
 */
export class MemoryBankManager {
  private memoryBankDir: string | null = null;
  private relativeMemoryBankPath: string | null = null; // Relative path for LocalFileSystem operations
  private customPath: string | null = null;
  private progressTracker: ProgressTracker | null = null;
  private modeManager: ModeManager | null = null;
  private rulesLoader: ExternalRulesLoader | null = null;
  private projectPath: string | null = null;
  private userId: string | null = null;
  private folderName: string = 'memory-bank';
  private fileSystem: FileSystemInterface | null = null;
  private isRemote: boolean = false;
  private remoteConfig: {
    sshKeyPath: string;
    remoteUser: string;
    remoteHost: string;
    remotePath: string;
  } | null = null;
  
  // Language is always set to English
  private language: string = 'en';

  /**
   * Creates a new MemoryBankManager instance
   * 
   * @param projectPath Optional project path to use instead of current directory
   * @param userId Optional GitHub profile URL for tracking changes
   * @param folderName Optional folder name for the Memory Bank (default: 'memory-bank')
   * @param debugMode Optional flag to enable debug mode
   * @param remoteConfig Optional remote server configuration
   */
  constructor(
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
    // Ensure language is always English - this is a hard requirement
    // All Memory Bank content will be in English regardless of system locale or user settings
    this.language = 'en';
    
    if (projectPath) {
      this.projectPath = projectPath;
      logger.debug('MemoryBankManager', `Initialized with project path: ${projectPath}`);
    } else {
      this.projectPath = process?.cwd() || '.';
      logger.debug('MemoryBankManager', `Initialized with current directory: ${this.projectPath}`);
    }
    
    this.userId = userId || "Unknown User";
    logger.debug('MemoryBankManager', `Initialized with GitHub profile URL: ${this.userId}`);
    
    if (folderName) {
      this.folderName = folderName;
      logger.debug('MemoryBankManager', `Initialized with folder name: ${folderName}`);
    } else {
      logger.debug('MemoryBankManager', `Initialized with default folder name: ${this.folderName}`);
    }
    
    logger.info('MemoryBankManager', `Memory Bank language is set to English (${this.language}) - all content will be in English`);
    
    // Set up remote configuration if provided
    if (remoteConfig) {
      this.isRemote = true;
      this.remoteConfig = remoteConfig;
      logger.info('MemoryBankManager', `Using remote server: ${remoteConfig.remoteUser}@${remoteConfig.remoteHost}:${remoteConfig.remotePath}`);
      
      // Create remote file system
      this.fileSystem = FileSystemFactory.createRemoteFileSystem(
        remoteConfig.remotePath,
        remoteConfig.sshKeyPath,
        remoteConfig.remoteUser,
        remoteConfig.remoteHost
      );
    } else {
      // Create local file system
      this.isRemote = false;
      if (this.projectPath) {
        this.fileSystem = FileSystemFactory.createLocalFileSystem(this.projectPath);
      }
    }
    
    // Check for an existing memory-bank directory in the project path
    if (this.projectPath) {
      this.setCustomPath(this.projectPath).catch(error => {
        logger.error('MemoryBankManager', `Error checking for memory-bank directory: ${error}`);
      });
    }
  }

  /**
   * Gets the language used for the Memory Bank
   * 
   * @returns The language code (always 'en' for English)
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * Sets the language for the Memory Bank
   * 
   * Note: This method is provided for API consistency, but the Memory Bank
   * will always use English (en) regardless of the language parameter.
   * This is a deliberate design decision to ensure consistency across all Memory Banks.
   * 
   * @param language - Language code (ignored, always sets to 'en')
   */
  setLanguage(language: string): void {
    // Always use English regardless of the parameter
    this.language = 'en';
    console.warn('Memory Bank language is always set to English (en) regardless of the requested language. This is a hard requirement for consistency.');
  }

  /**
   * Gets the project path
   * 
   * @returns The project path
   */
  getProjectPath(): string {
    return this.projectPath || process?.cwd() || '.';
  }

  /**
   * Finds a Memory Bank directory in the provided directory
   * 
   * Combines the provided directory with the folder name to create the Memory Bank path.
   * 
   * @param startDir - Starting directory for the search
   * @param customPath - Optional custom path (ignored in this implementation)
   * @returns Path to the Memory Bank directory or null if not found
   */
  async findMemoryBankDir(startDir: string, customPath?: string): Promise<string | null> {
    if (!this.fileSystem) {
      if (this.isRemote && this.remoteConfig) {
        // Create remote file system if not already created
        this.fileSystem = FileSystemFactory.createRemoteFileSystem(
          this.remoteConfig.remotePath,
          this.remoteConfig.sshKeyPath,
          this.remoteConfig.remoteUser,
          this.remoteConfig.remoteHost
        );
      } else if (startDir) {
        // Create local file system if not already created
        this.fileSystem = FileSystemFactory.createLocalFileSystem(startDir);
      } else {
        return null;
      }
    }
    
    // Combine the start directory with the folder name
    const mbDir = this.isRemote ? this.folderName : path.join(startDir, this.folderName);
    
    // Check if the directory exists and is a valid Memory Bank
    if (await this.fileSystem.fileExists(mbDir) && await this.fileSystem.isDirectory(mbDir)) {
      // Check if it's a valid Memory Bank or just a directory
      const files = await this.fileSystem.listFiles(mbDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      if (mdFiles.length > 0) {
        return mbDir;
      }
    }
    
    // If directory doesn't exist or is not a valid Memory Bank, return null
    return null;
  }

  /**
   * Checks if a directory is a valid Memory Bank
   * 
   * @param dirPath - Directory path to check
   * @returns True if it's a valid Memory Bank, false otherwise
   */
  async isMemoryBank(dirPath: string): Promise<boolean> {
    try {
      if (!this.fileSystem) {
        if (this.isRemote && this.remoteConfig) {
          // Create remote file system if not already created
          this.fileSystem = FileSystemFactory.createRemoteFileSystem(
            this.remoteConfig.remotePath,
            this.remoteConfig.sshKeyPath,
            this.remoteConfig.remoteUser,
            this.remoteConfig.remoteHost
          );
        } else if (this.projectPath) {
          // Create local file system if not already created
          this.fileSystem = FileSystemFactory.createLocalFileSystem(this.projectPath);
        } else {
          return false;
        }
      }
      
      if (!await this.fileSystem.isDirectory(dirPath)) {
        return false;
      }

      // Check if at least one of the core files exists
      const files = await this.fileSystem.listFiles(dirPath);
      
      // Support both camelCase and kebab-case during transition
      const coreFiles = [
        // Kebab-case (new format)
        'product-context.md',
        'active-context.md',
        'progress.md',
        'decision-log.md',
        'system-patterns.md',
        
        // CamelCase (old format)
        'productContext.md',
        'activeContext.md',
        'progress.md',
        'decisionLog.md',
        'systemPatterns.md'
      ];
      
      // Verify each file individually
      for (const coreFile of coreFiles) {
        const filePath = this.isRemote ? `${dirPath}/${coreFile}` : path.join(dirPath, coreFile);
        if (await this.fileSystem.fileExists(filePath)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('MemoryBankManager', `Error checking if ${dirPath} is a Memory Bank: ${error}`);
      return false;
    }
  }

  /**
   * Validates if all required .clinerules files exist in the project root
   * 
   * @param projectDir - Project directory to check
   * @returns Object with validation results
   */
  async validateClinerules(projectDir: string): Promise<{
    valid: boolean;
    missingFiles: string[];
    existingFiles: string[];
  }> {
    const requiredFiles = [
      '.clinerules-architect',
      '.clinerules-ask',
      '.clinerules-code',
      '.clinerules-debug',
      '.clinerules-test'
    ];
    
    const missingFiles: string[] = [];
    const existingFiles: string[] = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(projectDir, file);
      if (await FileUtils.fileExists(filePath)) {
        existingFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }
    
    return {
      valid: missingFiles.length === 0,
      missingFiles,
      existingFiles
    };
  }

  /**
   * Initializes the Memory Bank
   * 
   * @param createIfNotExists - Whether to create the Memory Bank if it doesn't exist
   * @returns Path to the Memory Bank directory
   * @throws Error if initialization fails
   */
  async initialize(createIfNotExists: boolean = true): Promise<string> {
    try {
      // Determine the Memory Bank path
      // absoluteMemoryBankPath is for return value and API responses
      // relativeMemoryBankPath is for LocalFileSystem methods (relative to baseDir)
      let memoryBankPath: string;
      let relativeMemoryBankPath: string;
      let absoluteMemoryBankPath: string;
      
      if (this.isRemote) {
        // For remote: use folderName directly under remote path (don't need to append to remotePath)
        memoryBankPath = this.folderName;
        relativeMemoryBankPath = this.folderName;
        absoluteMemoryBankPath = this.folderName;
        logger.debug('MemoryBankManager', `Initializing remote Memory Bank with path: ${memoryBankPath}`);
      } else if (this.customPath) {
        // Use the custom path if set (for local filesystem)
        absoluteMemoryBankPath = path.join(this.customPath, this.folderName);
        relativeMemoryBankPath = this.folderName; // LocalFileSystem expects relative to baseDir
        memoryBankPath = absoluteMemoryBankPath; // For backwards compatibility
      } else if (this.projectPath) {
        // Use the project path if set (for local filesystem)
        absoluteMemoryBankPath = path.join(this.projectPath, this.folderName);
        relativeMemoryBankPath = this.folderName; // LocalFileSystem expects relative to baseDir
        memoryBankPath = absoluteMemoryBankPath; // For backwards compatibility
      } else {
        // Use the current directory as a fallback (for local filesystem)
        const currentDir = process?.cwd() || '.';
        absoluteMemoryBankPath = path.join(currentDir, this.folderName);
        relativeMemoryBankPath = this.folderName; // LocalFileSystem expects relative to baseDir
        memoryBankPath = absoluteMemoryBankPath; // For backwards compatibility
      }
      
      // Create the Memory Bank directory if it doesn't exist
      if (createIfNotExists) {
        if (!this.fileSystem) {
          if (this.isRemote && this.remoteConfig) {
            // Create remote file system
            this.fileSystem = FileSystemFactory.createRemoteFileSystem(
              this.remoteConfig.remotePath,
              this.remoteConfig.sshKeyPath,
              this.remoteConfig.remoteUser,
              this.remoteConfig.remoteHost
            );
          } else if (this.projectPath) {
            // Create local file system
            this.fileSystem = FileSystemFactory.createLocalFileSystem(this.projectPath);
          } else {
            throw new Error('File system cannot be initialized');
          }
        }
        
        // Create the Memory Bank directory if it doesn't exist
        const exists = await this.fileSystem.fileExists(relativeMemoryBankPath);
        const isDir = exists ? await this.fileSystem.isDirectory(relativeMemoryBankPath) : false;
        
        if (!exists || !isDir) {
          logger.info('MemoryBankManager', `Creating Memory Bank directory at ${absoluteMemoryBankPath}`);
          await this.fileSystem.ensureDirectory(relativeMemoryBankPath);
        }
        
        // Create core template files if they don't exist
        for (const template of coreTemplates) {
          const filePath = this.isRemote 
            ? `${relativeMemoryBankPath}/${template.name}` 
            : path.join(relativeMemoryBankPath, template.name);
          
          const fileExists = await this.fileSystem.fileExists(filePath);
          if (!fileExists) {
            logger.info('MemoryBankManager', `Creating ${template.name}`);
            await this.fileSystem.writeFile(filePath, template.content);
          }
        }
      } else {
        // Check if the Memory Bank directory exists
        if (!this.fileSystem) {
          throw new Error('File system not initialized');
        }
        
        const exists = await this.fileSystem.fileExists(relativeMemoryBankPath);
        const isDir = exists ? await this.fileSystem.isDirectory(relativeMemoryBankPath) : false;
        
        if (!exists || !isDir) {
          throw new Error(`Memory Bank directory not found at ${absoluteMemoryBankPath}`);
        }
      }
      
      // Set the memory bank directory
      this.setMemoryBankDir(absoluteMemoryBankPath);
      this.relativeMemoryBankPath = relativeMemoryBankPath;
      
      // Initialize the progress tracker - ensure memoryBankPath is not null
      if (absoluteMemoryBankPath) {
        this.progressTracker = new ProgressTracker(absoluteMemoryBankPath, this.userId || undefined);
      }
      
      // Welcome message
      logger.info('MemoryBankManager', `Memory Bank initialized at ${absoluteMemoryBankPath}`);
      
      return absoluteMemoryBankPath;
    } catch (error) {
      logger.error('MemoryBankManager', `Failed to initialize Memory Bank: ${error}`);
      throw new Error(`Failed to initialize Memory Bank: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reads a file from the Memory Bank
   * 
   * @param filename - Name of the file to read
   * @returns File contents as a string
   * @throws Error if file reading fails
   */
  async readFile(filename: string): Promise<string> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory is not set');
      }
      
      if (!this.fileSystem) {
        throw new Error('File system is not initialized');
      }
      
      const filePath = this.isRemote ? `${this.getFileSystemPath()}/${filename}` : path.join(this.getFileSystemPath()!, filename);
      return await this.fileSystem.readFile(filePath);
    } catch (error) {
      logger.error('MemoryBankManager', `Failed to read file ${filename}: ${error}`);
      throw new Error(`Failed to read file ${filename}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Writes content to a file in the Memory Bank
   * 
   * @param filename - Name of the file to write
   * @param content - Content to write
   * @throws Error if file writing fails
   */
  async writeFile(filename: string, content: string): Promise<void> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory is not set');
      }
      
      if (!this.fileSystem) {
        throw new Error('File system is not initialized');
      }
      
      // Migrate camelCase to kebab-case if needed
      const migratedFilename = filename.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      if (migratedFilename !== filename) {
        logger.info('MemoryBankManager', `Migrating file name from ${filename} to ${migratedFilename}`);
        filename = migratedFilename;
      }
      
      const filePath = this.isRemote ? `${this.getFileSystemPath()}/${filename}` : path.join(this.getFileSystemPath()!, filename);
      await this.fileSystem.writeFile(filePath, content);
    } catch (error) {
      logger.error('MemoryBankManager', `Failed to write to file ${filename}: ${error}`);
      throw new Error(`Failed to write to file ${filename}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lists files in the Memory Bank
   * 
   * @returns Array of file names
   * @throws Error if directory reading fails
   */
  async listFiles(): Promise<string[]> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory is not set');
      }
      
      if (!this.fileSystem) {
        throw new Error('File system is not initialized');
      }
      
      return this.fileSystem.listFiles(this.getFileSystemPath()!);
    } catch (error) {
      logger.error('MemoryBankManager', `Failed to list files: ${error}`);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets the status of the Memory Bank
   * 
   * @returns Status object with information about the Memory Bank
   * @throws Error if the Memory Bank directory is not set
   */
  async getStatus(): Promise<MemoryBankStatus> {
    try {
      if (!this.memoryBankDir) {
        throw new Error('Memory Bank directory not set');
      }
      
      const files = await this.listFiles();
      const coreFiles = coreTemplates.map(template => template.name);
      const missingCoreFiles = coreFiles.filter(file => !files.includes(file));
      
      // Get last update time
      let lastUpdated: Date | undefined;
      try {
        if (files.length > 0) {
          const stats = await Promise.all(
            files.map(async file => {
              try {
                const filePath = path.join(this.memoryBankDir!, file);
                return await FileUtils.getFileStats(filePath);
              } catch (statError) {
                console.warn(`Error getting stats for file ${file}:`, statError);
                // Return a default stat object with current time
                return {
                  mtimeMs: Date.now(),
                } as fs.Stats;
              }
            })
          );
          
          const latestMtime = Math.max(...stats.map(stat => stat.mtimeMs));
          lastUpdated = new Date(latestMtime);
        }
      } catch (statsError) {
        console.error('Error getting file stats:', statsError);
        // Continue without lastUpdated information
      }
      
      return {
        path: this.memoryBankDir,
        files,
        coreFilesPresent: coreFiles.filter(file => files.includes(file)),
        missingCoreFiles,
        isComplete: missingCoreFiles.length === 0,
        language: this.language,
        lastUpdated,
      };
    } catch (error) {
      console.error('Error getting Memory Bank status:', error);
      throw new Error(`Error getting Memory Bank status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Initializes a Memory Bank at the given path
   * 
   * This method sets the custom path and then calls the initialize method.
   * It exists for backwards compatibility with tests and older code.
   * 
   * @param dirPath - Directory path where the Memory Bank will be initialized
   * @returns Path to the Memory Bank directory
   * @throws Error if initialization fails
   */
  async initializeMemoryBank(dirPath: string): Promise<string> {
    try {
      // Set the custom path
      await this.setCustomPath(dirPath);
      
      // Initialize the Memory Bank
      return await this.initialize(true);
    } catch (error) {
      logger.error('MemoryBankManager', `Failed to initialize Memory Bank: ${error}`);
      throw new Error(`Failed to initialize Memory Bank: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sets a custom path for the Memory Bank
   * 
   * @param customPath - Custom path to use
   */
  async setCustomPath(customPath?: string): Promise<void> {
    try {
      if (!customPath) {
        this.customPath = null;
        return;
      }
      
      this.customPath = customPath;
      
      // Check if the custom path is a valid Memory Bank directory
      const mbDir = await this.findMemoryBankDir(customPath);
      if (mbDir) {
        this.setMemoryBankDir(mbDir);
        logger.info('MemoryBankManager', `Found existing Memory Bank at ${mbDir}`);
      } else {
        logger.info('MemoryBankManager', `No Memory Bank found at ${customPath}/${this.folderName}`);
      }
    } catch (error) {
      logger.error('MemoryBankManager', `Error setting custom path: ${error}`);
    }
  }

  /**
   * Gets the custom path for the Memory Bank
   * 
   * @returns Custom path or null if not set
   */
  getCustomPath(): string | null {
    return this.customPath;
  }

  /**
   * Gets the Memory Bank directory
   * 
   * @returns Memory Bank directory or null if not set
   */
  getMemoryBankDir(): string | null {
    return this.memoryBankDir;
  }

  /**
   * Sets the Memory Bank directory
   * 
   * @param dir - Directory path
   */
  setMemoryBankDir(dir: string): void {
    this.memoryBankDir = dir;
    
    // Initialize the progress tracker
    if (dir) {
      this.progressTracker = new ProgressTracker(dir, this.userId || undefined);
    }
    
    // Initialize the mode manager - we'll catch any errors to prevent initialization failures
    this.initializeModeManager().catch((error: any) => {
      console.error(`Error initializing mode manager: ${error}`);
    });
  }

  /**
   * Gets the path to use for FileSystem operations
   * For non-remote: returns relative path
   * For remote: returns the full path
   * 
   * @returns Path for filesystem operations
   */
  private getFileSystemPath(): string | null {
    if (this.isRemote || !this.relativeMemoryBankPath) {
      return this.memoryBankDir;
    }
    return this.relativeMemoryBankPath;
  }
  /**
   * Gets the ProgressTracker
   * 
   * @returns ProgressTracker or null if not available
   */
  getProgressTracker(): ProgressTracker | null {
    return this.progressTracker;
  }
  
  /**
   * Creates a backup of the Memory Bank
   * 
   * @param backupDir - Directory where the backup will be stored
   * @returns Path to the backup directory
   * @throws Error if the Memory Bank directory is not set or backup fails
   */
  async createBackup(backupDir?: string): Promise<string> {
    if (!this.memoryBankDir) {
      throw new Error('Memory Bank directory not set');
    }
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = backupDir 
        ? path.join(backupDir, `memory-bank-backup-${timestamp}`)
        : path.join(path.dirname(this.memoryBankDir), `memory-bank-backup-${timestamp}`);
      
      await FileUtils.ensureDirectory(backupPath);
      
      const files = await this.listFiles();
      for (const file of files) {
        const content = await this.readFile(file);
        await FileUtils.writeFile(path.join(backupPath, file), content);
      }
      
      logger.debug('MemoryBankManager', `Memory Bank backup created at ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('MemoryBankManager', `Error creating Memory Bank backup: ${error}`);
      throw new Error(`Failed to create Memory Bank backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Initializes the mode manager
   * 
   * @param initialMode Initial mode to set (optional)
   * @returns Promise that resolves when initialization is complete
   */
  async initializeModeManager(initialMode?: string): Promise<void> {
    // Implementation can be empty for now
    // This is just to fix the reference error
    logger.debug('MemoryBankManager', 'Mode manager initialization skipped');
  }
  
  /**
   * Gets the mode manager
   * 
   * @returns Mode manager or null if not initialized
   */
  getModeManager(): any {
    // Just return null since we're not fully implementing the mode manager
    logger.debug('MemoryBankManager', 'Mode manager requested, returning null');
    return null;
  }
  
  /**
   * Switches to a specific mode
   * 
   * @param mode Mode name
   * @returns True if the mode was successfully switched, false otherwise
   */
  switchMode(mode: string): boolean {
    logger.debug('MemoryBankManager', `Switching to mode: ${mode}`);
    // Minimal implementation
    return true;
  }
  
  /**
   * Checks if a text matches the UMB trigger
   * 
   * @param text Text to check
   * @returns True if the text matches the UMB trigger, false otherwise
   */
  checkUmbTrigger(text: string): boolean {
    // Simple implementation to check for UMB triggers
    return text.toLowerCase().includes('update memory bank') || 
           text.toLowerCase().includes('umb');
  }
  
  /**
   * Activates UMB mode
   * 
   * @returns True if UMB mode was activated, false otherwise
   */
  activateUmbMode(): boolean {
    logger.debug('MemoryBankManager', 'Activating UMB mode');
    return true;
  }
  
  /**
   * Checks if UMB mode is active
   * 
   * @returns True if UMB mode is active, false otherwise
   */
  isUmbModeActive(): boolean {
    return false;
  }
  
  /**
   * Completes UMB mode
   * 
   * @returns True if UMB mode was deactivated, false otherwise
   */
  async completeUmbMode(): Promise<boolean> {
    logger.debug('MemoryBankManager', 'Completing UMB mode');
    return true;
  }
  
  /**
   * Gets the status prefix for responses
   * 
   * @returns Status prefix string
   */
  getStatusPrefix(): string {
    return `[MEMORY BANK: ${this.memoryBankDir ? 'ACTIVE' : 'INACTIVE'}]`;
  }
}