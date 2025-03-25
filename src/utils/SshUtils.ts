import * as fs from 'fs';
import { exec as execCallback, ExecException } from 'child_process';
import * as util from 'util';
import { logger } from './LogManager.js';

// Type for the exec callback function
type ExecCallback = (error: ExecException | null, stdout: string, stderr: string) => void;

/**
 * Utility class for SSH operations
 * 
 * Provides methods for interacting with remote servers via SSH.
 */
export class SshUtils {
  private sshKeyPath: string;
  private remoteUser: string;
  private remoteHost: string;
  private remotePath: string;

  /**
   * Creates a new SshUtils instance
   * 
   * @param sshKeyPath - Path to the SSH private key file
   * @param remoteUser - Username for the remote server
   * @param remoteHost - Hostname or IP address of the remote server
   * @param remotePath - Base path on the remote server for memory bank storage
   */
  constructor(sshKeyPath: string, remoteUser: string, remoteHost: string, remotePath: string) {
    this.sshKeyPath = sshKeyPath;
    this.remoteUser = remoteUser;
    this.remoteHost = remoteHost;
    this.remotePath = remotePath;
  }

  /**
   * Executes an SSH command
   * 
   * @param command - Command to execute
   * @returns Promise that resolves with command output
   */
  private async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Build SSH command with options
      const sshCommand = `ssh -v -i "${this.sshKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 ${this.remoteUser}@${this.remoteHost} "${command}"`;
      logger.debug('SshUtils', `Executing SSH command: ${sshCommand}`);
      
      // Set a timeout for the command execution (30 seconds)
      const timeoutMs = 30000;
      let timeoutId: NodeJS.Timeout | null = null;
      
      // Execute SSH command
      const childProcess = execCallback(sshCommand, (error, stdout, stderr) => {
        // Clear the timeout if it was set
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (error) {
          logger.error('SshUtils', `SSH command error: ${error.message}`);
          logger.error('SshUtils', `SSH command stderr: ${stderr}`);
          logger.error('SshUtils', `SSH command stdout: ${stdout}`);
          logger.error('SshUtils', `Full SSH command: ${sshCommand}`);
          logger.error('SshUtils', `Error details: ${JSON.stringify(error)}`);
          reject(error);
          return;
        }
        
        if (stderr) {
          logger.warn('SshUtils', `SSH command stderr: ${stderr}`);
        }
        
        logger.debug('SshUtils', `SSH command stdout: ${stdout}`);
        resolve(stdout);
      });
      
      // Set up the timeout
      timeoutId = setTimeout(() => {
        if (childProcess) {
          childProcess.kill();
        }
        logger.error('SshUtils', `SSH command timed out after ${timeoutMs}ms: ${sshCommand}`);
        reject(new Error(`SSH command timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Checks if a remote directory exists
   * 
   * @param dirPath - Path to check
   * @returns True if the directory exists, false otherwise
   */
  async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const remoteDirPath = `${this.remotePath}/${dirPath}`;
      const command = `[ -d "${remoteDirPath}" ] && echo "EXISTS" || echo "NOT_EXISTS"`;
      const result = await this.executeCommand(command);
      return result === 'EXISTS';
    } catch (error) {
      logger.error('SshUtils', `Error checking if remote directory exists: ${error}`);
      return false;
    }
  }

  /**
   * Creates a directory on the remote server
   * 
   * @param dirPath - Path to create
   * @throws Error if directory creation fails
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      const remoteDirPath = `${this.remotePath}/${dirPath}`;
      const command = `mkdir -p "${remoteDirPath}"`;
      await this.executeCommand(command);
    } catch (error) {
      logger.error('SshUtils', `Failed to create remote directory: ${error}`);
      throw new Error(`Failed to create remote directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reads a file from the remote server
   * 
   * @param filePath - Path to the file
   * @returns The file contents as a string
   * @throws Error if file reading fails
   */
  async readFile(filePath: string): Promise<string> {
    try {
      const remoteFilePath = `${this.remotePath}/${filePath}`;
      const command = `cat "${remoteFilePath}"`;
      return await this.executeCommand(command);
    } catch (error) {
      logger.error('SshUtils', `Failed to read remote file: ${error}`);
      throw new Error(`Failed to read remote file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Writes content to a file on the remote server
   * 
   * @param filePath - Path to the file
   * @param content - Content to write
   * @throws Error if file writing fails
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const remoteFilePath = `${this.remotePath}/${filePath}`;
      
      // Ensure the directory exists first
      const dirPath = remoteFilePath.substring(0, remoteFilePath.lastIndexOf('/'));
      const mkdirCommand = `mkdir -p "${dirPath}"`;
      await this.executeCommand(mkdirCommand);
      
      // Use base64 encoding to safely transfer the content
      // This avoids issues with shell interpretation of special characters
      const contentBuffer = Buffer.from(content);
      const base64Content = contentBuffer.toString('base64');
      
      // Create the command that will decode the base64 and write to the file
      const writeCommand = `echo "${base64Content}" | base64 -d > "${remoteFilePath}"`;
      await this.executeCommand(writeCommand);
      
      // Verify file was written successfully
      const checkCommand = `[ -f "${remoteFilePath}" ] && echo "FILE_EXISTS" || echo "FILE_NOT_EXISTS"`;
      const checkResult = await this.executeCommand(checkCommand);
      
      if (checkResult.trim() !== "FILE_EXISTS") {
        throw new Error(`Failed to verify file was created: ${remoteFilePath}`);
      }
    } catch (error) {
      logger.error('SshUtils', `Failed to write to remote file: ${error}`);
      throw new Error(`Failed to write to remote file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lists files in a remote directory
   * 
   * @param dirPath - Path to the directory
   * @returns Array of file names
   * @throws Error if directory reading fails
   */
  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const remoteDirPath = `${this.remotePath}/${dirPath}`;
      const command = `ls -A "${remoteDirPath}" | tr '\\n' ' '`;
      const result = await this.executeCommand(command);
      return result ? result.split(' ').filter(Boolean) : [];
    } catch (error) {
      logger.error('SshUtils', `Failed to list files in remote directory: ${error}`);
      throw new Error(`Failed to list files in remote directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deletes a file on the remote server
   * 
   * @param filePath - Path to the file
   * @throws Error if file deletion fails
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const remoteFilePath = `${this.remotePath}/${filePath}`;
      const command = `rm "${remoteFilePath}"`;
      await this.executeCommand(command);
    } catch (error) {
      logger.error('SshUtils', `Failed to delete remote file: ${error}`);
      throw new Error(`Failed to delete remote file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Copies a file or directory on the remote server
   * 
   * @param sourcePath - Source path
   * @param destPath - Destination path
   * @throws Error if copy operation fails
   */
  async copy(sourcePath: string, destPath: string): Promise<void> {
    try {
      const remoteSourcePath = `${this.remotePath}/${sourcePath}`;
      const remoteDestPath = `${this.remotePath}/${destPath}`;
      const command = `cp -r "${remoteSourcePath}" "${remoteDestPath}"`;
      await this.executeCommand(command);
    } catch (error) {
      logger.error('SshUtils', `Failed to copy from ${sourcePath} to ${destPath}: ${error}`);
      throw new Error(`Failed to copy from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Tests the SSH connection to the remote server
   * 
   * @returns True if connection is successful, false otherwise
   */
  async testConnection(): Promise<boolean> {
    try {
      // First check if the SSH key file exists
      try {
        const fsPromises = require('fs').promises;
        const stats = await fsPromises.stat(this.sshKeyPath);
        if (!stats.isFile()) {
          console.error(`SSH key is not a file: ${this.sshKeyPath}`);
          return false;
        }
      } catch (fileError) {
        console.error(`SSH key file does not exist or cannot be accessed: ${this.sshKeyPath}`);
        console.error(`Error details: ${fileError}`);
        return false;
      }
      
      const command = 'echo "Connection successful"';
      console.log(`Testing SSH connection to ${this.remoteUser}@${this.remoteHost} using key ${this.sshKeyPath}`);
      console.log(`Remote path: ${this.remotePath}`);
      
      const sshTestCommand = `ssh -v -i "${this.sshKeyPath}" -o StrictHostKeyChecking=no ${this.remoteUser}@${this.remoteHost} "${command}"`;
      console.log(`Direct SSH test command: ${sshTestCommand}`);
      
      const result = await this.executeCommand(command);
      console.log(`SSH test result: "${result}"`);
      
      // Check if the remote path exists
      try {
        const pathCheckCommand = `[ -d "${this.remotePath}" ] && echo "PATH_EXISTS" || echo "PATH_NOT_EXISTS"`;
        const pathResult = await this.executeCommand(pathCheckCommand);
        console.log(`Remote path check result: "${pathResult}"`);
        
        if (pathResult.trim() !== "PATH_EXISTS") {
          console.log(`Warning: Remote path ${this.remotePath} does not exist. Attempting to create it...`);
          const mkdirCommand = `mkdir -p "${this.remotePath}"`;
          await this.executeCommand(mkdirCommand);
          console.log(`Created remote path ${this.remotePath}`);
        }
      } catch (pathError) {
        console.error(`Error checking remote path: ${pathError}`);
      }
      
      // The connection test is successful if we received any response
      return result.includes('Connection successful');
    } catch (error) {
      logger.error('SshUtils', `Failed to connect to remote server: ${error}`);
      console.error('Connection test error details:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }
} 