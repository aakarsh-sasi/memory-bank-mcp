import { FileSystemInterface } from './FileSystemInterface.js';
import { FileUtils } from '../FileUtils.js';
import * as path from 'path';

/**
 * Local file system implementation
 * 
 * This class implements the FileSystemInterface using local file system operations.
 */
export class LocalFileSystem implements FileSystemInterface {
  private baseDir: string;

  /**
   * Creates a new LocalFileSystem instance
   * 
   * @param baseDir - Base directory for file operations
   */
  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /**
   * Gets the full path for a relative path
   * 
   * @param relativePath - Relative path
   * @returns Full path
   */
  private getFullPath(relativePath: string): string {
    return path.join(this.baseDir, relativePath);
  }

  /**
   * Checks if a file or directory exists
   * 
   * @param relativePath - Relative path to check
   * @returns True if the path exists, false otherwise
   */
  async fileExists(relativePath: string): Promise<boolean> {
    return FileUtils.fileExists(this.getFullPath(relativePath));
  }

  /**
   * Checks if a path is a directory
   * 
   * @param relativePath - Relative path to check
   * @returns True if the path is a directory, false otherwise
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    return FileUtils.isDirectory(this.getFullPath(relativePath));
  }

  /**
   * Ensures a directory exists, creating it if necessary
   * 
   * @param relativePath - Relative path to the directory
   */
  async ensureDirectory(relativePath: string): Promise<void> {
    return FileUtils.ensureDirectory(this.getFullPath(relativePath));
  }

  /**
   * Reads a file's contents
   * 
   * @param relativePath - Relative path to the file
   * @returns The file contents as a string
   */
  async readFile(relativePath: string): Promise<string> {
    return FileUtils.readFile(this.getFullPath(relativePath));
  }

  /**
   * Writes content to a file
   * 
   * @param relativePath - Relative path to the file
   * @param content - Content to write
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    return FileUtils.writeFile(this.getFullPath(relativePath), content);
  }

  /**
   * Lists files in a directory
   * 
   * @param relativePath - Relative path to the directory
   * @returns Array of file names
   */
  async listFiles(relativePath: string): Promise<string[]> {
    return FileUtils.listFiles(this.getFullPath(relativePath));
  }

  /**
   * Deletes a file or directory
   * 
   * @param relativePath - Relative path to delete
   */
  async delete(relativePath: string): Promise<void> {
    return FileUtils.delete(this.getFullPath(relativePath));
  }

  /**
   * Copies a file or directory
   * 
   * @param sourceRelativePath - Relative source path
   * @param destRelativePath - Relative destination path
   */
  async copy(sourceRelativePath: string, destRelativePath: string): Promise<void> {
    return FileUtils.copy(
      this.getFullPath(sourceRelativePath),
      this.getFullPath(destRelativePath)
    );
  }

  /**
   * Gets the base directory for file operations
   * 
   * @returns The base directory path
   */
  getBaseDir(): string {
    return this.baseDir;
  }
} 