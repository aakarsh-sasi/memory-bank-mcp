# Remote Server Support

Memory Bank MCP now supports storing your Memory Bank on a remote server via SSH. This feature allows you to centralize your project memory, share it with team members, and ensure persistence even if your local machine is wiped.

## Requirements

To use the remote server functionality, you need:

1. **SSH access** to the remote server
2. **SSH key authentication** set up (password authentication is not supported)
3. **Sufficient permissions** to create/modify files in the specified directory

## Configuration

To use remote server mode, you need to provide the following parameters:

```bash
npx @aakarsh-sasi/memory-bank-mcp --remote \
  --ssh-key ~/.ssh/your_ssh_key \
  --remote-user username \
  --remote-host hostname_or_ip \
  --remote-path /path/on/remote/server
```

### Parameters

- `--remote` or `-r`: Enable remote server mode
- `--ssh-key` or `-k`: Path to SSH private key file (default: `~/.ssh/your_ssh_key`)
- `--remote-user` or `-u`: Username for the remote server
- `--remote-host`: Hostname or IP address of the remote server
- `--remote-path` or `-rp`: Base path on the remote server for memory bank storage

## Example

```bash
# Using with a local macOS server at example.host.com
npx @aakarsh-sasi/memory-bank-mcp --remote \
  --remote-user username \
  --remote-host example.host.com \
  --remote-path /home/username/memory-bank
```

## Implementation Details

Memory Bank MCP uses SSH and SCP to interact with the remote server:

1. **SSH Commands**: For file operations like listing, reading, checking existence
2. **SCP**: For securely copying files to the remote server

The implementation abstracts file system operations using the `FileSystemInterface`, with two concrete implementations:

- `LocalFileSystem`: For local file operations
- `RemoteFileSystem`: For remote file operations via SSH

## Security Considerations

- SSH key authentication is required
- The SSH key should have limited privileges on the remote server
- The remote path should be in a directory with appropriate permissions
- No sensitive information is stored in memory bank files by default

## Troubleshooting

If you encounter issues with remote server mode, check the following:

1. **SSH Key**: Ensure the SSH key is valid and has the correct permissions
   ```bash
   chmod 600 ~/.ssh/your_ssh_key
   ```

2. **SSH Connection**: Test the SSH connection manually
   ```bash
   ssh -i ~/.ssh/your_ssh_key username@hostname
   ```

3. **Remote Path**: Ensure the remote path exists and you have write permissions
   ```bash
   ssh -i ~/.ssh/your_ssh_key username@hostname "mkdir -p /path/on/remote/server"
   ```

4. **Debug Mode**: Use the `--debug` flag to enable detailed logging
   ```bash
   npx @aakarsh-sasi/memory-bank-mcp --remote --debug [other options]
   ```

## Limitations

- File operations may be slower compared to local storage due to network latency
- Large files may take longer to transfer
- Internet connectivity is required for all operations
- Network interruptions may cause file operations to fail

## Future Improvements

- Cache frequently accessed files locally
- Add support for SFTP as an alternative to SCP
- Implement file synchronization between local and remote storage
- Add support for other authentication methods 