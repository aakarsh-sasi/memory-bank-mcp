/**
 * Interface for file system operations
 * 
 * This interface abstracts file operations to support both local and remote file systems.
 */
export interface FileSystemInterface {
  /**
   * Checks if a file or directory exists
   * 
   * @param path - Path to check
   * @returns True if the path exists, false otherwise
   */
  fileExists(path: string): Promise<boolean>;
  
  /**
   * Checks if a path is a directory
   * 
   * @param path - Path to check
   * @returns True if the path is a directory, false otherwise
   */
  isDirectory(path: string): Promise<boolean>;
  
  /**
   * Ensures a directory exists, creating it if necessary
   * 
   * @param path - Path to the directory
   */
  ensureDirectory(path: string): Promise<void>;
  
  /**
   * Reads a file's contents
   * 
   * @param path - Path to the file
   * @returns The file contents as a string
   */
  readFile(path: string): Promise<string>;
  
  /**
   * Writes content to a file
   * 
   * @param path - Path to the file
   * @param content - Content to write
   */
  writeFile(path: string, content: string): Promise<void>;
  
  /**
   * Lists files in a directory
   * 
   * @param path - Path to the directory
   * @returns Array of file names
   */
  listFiles(path: string): Promise<string[]>;
  
  /**
   * Deletes a file or directory
   * 
   * @param path - Path to delete
   */
  delete(path: string): Promise<void>;
  
  /**
   * Copies a file or directory
   * 
   * @param sourcePath - Source path
   * @param destPath - Destination path
   */
  copy(sourcePath: string, destPath: string): Promise<void>;
  
  /**
   * Gets the base directory for file operations
   * 
   * @returns The base directory path
   */
  getBaseDir(): string;
} 