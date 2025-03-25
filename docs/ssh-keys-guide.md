# SSH Keys Guide

## Overview
SSH keys provide a secure way to authenticate with remote systems without using passwords. This guide covers how to generate SSH keys, configure them for use with servers, and add them to services like GitHub, GitLab, or other remote servers.

## Generating SSH Keys

### Step 1: Check for Existing SSH Keys
Before creating new SSH keys, check if you already have existing keys:

```bash
ls -la ~/.ssh
```

Look for files named `id_rsa`, `id_rsa.pub`, `id_ed25519`, `id_ed25519.pub`, or similar.

### Step 2: Generate a New SSH Key Pair
If you need to create a new key, use one of these commands:

#### Option A: Using RSA (traditional, compatible with older systems)
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

#### Option B: Using Ed25519 (newer, more secure, recommended)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted for a file location, press Enter to accept the default location. You'll also be asked to enter a passphrase (recommended for additional security).

### Step 3: Start the SSH Agent
Start the SSH agent in the background:

```bash
eval "$(ssh-agent -s)"
```

### Step 4: Add Your SSH Key to the SSH Agent
```bash
ssh-add ~/.ssh/id_ed25519  # or ~/.ssh/id_rsa if you generated an RSA key
```

## Using SSH Keys with Memory Bank MCP

### Setting Up SSH Keys for Remote Server Mode
When using Memory Bank MCP's remote server mode, SSH keys are essential for secure, password-less authentication. 

To set up your remote server:

1. Generate and add your SSH key to the agent as described above.

2. Copy your public key to the remote server:
   ```bash
   ssh-copy-id username@your-remote-host.com
   ```

3. Configure Memory Bank MCP to use your SSH key:
   ```bash
   npx @aakarsh-sasi/memory-bank-mcp --remote \
     --ssh-key ~/.ssh/id_ed25519 \
     --remote-user username \
     --remote-host your-remote-host.com \
     --remote-path /home/username/memory-bank
   ```

4. Test the connection before proceeding:
   ```bash
   ssh username@your-remote-host.com
   ```

### Adding Your SSH Key to a Remote Server
To add your public key to a remote server:

```bash
ssh-copy-id username@remote_host
```

Or manually:
1. Display your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub  # or id_rsa.pub
   ```
2. Copy the output
3. Append it to the `~/.ssh/authorized_keys` file on the remote server

### Adding Your SSH Key to GitHub/GitLab

1. Copy your public key to clipboard:
   ```bash
   # macOS
   cat ~/.ssh/id_ed25519.pub | pbcopy
   
   # Linux (with xclip installed)
   cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
   
   # Windows (Git Bash)
   cat ~/.ssh/id_ed25519.pub | clip
   ```

2. Add the key to your GitHub/GitLab account:
   - GitHub: Settings > SSH and GPG keys > New SSH key
   - GitLab: Preferences > SSH Keys

3. Test your connection:
   ```bash
   # For GitHub
   ssh -T git@github.com
   
   # For GitLab
   ssh -T git@gitlab.com
   ```

## Troubleshooting SSH Keys

### Permission Issues
If you encounter permission errors:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_ed25519.pub
```

### Connection Issues
If you're having trouble connecting:
```bash
ssh -vT git@github.com  # Verbose output for debugging
```

For Memory Bank MCP remote connection issues:
```bash
ssh -v username@your-remote-host.com
```

### Multiple SSH Keys
If you need to manage multiple SSH keys, create a `~/.ssh/config` file:
```
# GitHub account
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_key

# Memory Bank Remote Server
Host memory-bank-server
  HostName your-remote-host.com
  User username
  IdentityFile ~/.ssh/id_ed25519
```

Then you can reference the host in your Memory Bank MCP configuration:
```bash
npx @aakarsh-sasi/memory-bank-mcp --remote \
  --remote-user username \
  --remote-host memory-bank-server \
  --remote-path /home/username/memory-bank
```

## Security Best Practices

1. **Use a passphrase** when generating keys for added security
2. **Don't share your private key** (the file without the .pub extension)
3. **Rotate keys periodically** for sensitive systems
4. **Use different keys** for different services when security is critical
5. **Set proper permissions** on your SSH keys and directories
6. **Disable password authentication** on your server if possible 