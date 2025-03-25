import { FileSystemInterface } from './FileSystemInterface.js';
import { LocalFileSystem } from './LocalFileSystem.js';
import { RemoteFileSystem } from './RemoteFileSystem.js';
import { logger } from '../LogManager.js';

/**
 * Factory for creating file system implementations
 * 
 * This class provides factory methods for creating local or remote file system implementations.
 */
export class FileSystemFactory {
  /**
   * Creates a local file system implementation
   * 
   * @param baseDir - Base directory for file operations
   * @returns A LocalFileSystem instance
   */
  static createLocalFileSystem(baseDir: string): FileSystemInterface {
    logger.debug('FileSystemFactory', `Creating local file system with base directory: ${baseDir}`);
    return new LocalFileSystem(baseDir);
  }

  /**
   * Creates a remote file system implementation
   * 
   * @param baseDir - Base directory on the remote server
   * @param sshKeyPath - Path to the SSH private key file
   * @param remoteUser - Username for the remote server
   * @param remoteHost - Hostname or IP address of the remote server
   * @returns A RemoteFileSystem instance
   */
  static createRemoteFileSystem(
    baseDir: string,
    sshKeyPath: string,
    remoteUser: string,
    remoteHost: string
  ): FileSystemInterface {
    logger.debug(
      'FileSystemFactory',
      `Creating remote file system with base directory: ${baseDir}, remoteUser: ${remoteUser}, remoteHost: ${remoteHost}`
    );
    return new RemoteFileSystem(baseDir, sshKeyPath, remoteUser, remoteHost);
  }

  /**
   * Tests connection to a remote file system
   * 
   * @param sshKeyPath - Path to the SSH private key file
   * @param remoteUser - Username for the remote server
   * @param remoteHost - Hostname or IP address of the remote server
   * @param remotePath - Base path on the remote server (defaults to /tmp for testing)
   * @returns True if connection is successful, false otherwise
   */
  static async testRemoteConnection(
    sshKeyPath: string,
    remoteUser: string,
    remoteHost: string,
    remotePath: string = '/tmp'
  ): Promise<boolean> {
    logger.debug('FileSystemFactory', `Testing connection to remote server: ${remoteUser}@${remoteHost} with path: ${remotePath}`);
    const fs = new RemoteFileSystem(remotePath, sshKeyPath, remoteUser, remoteHost);
    return fs.testConnection();
  }
} 