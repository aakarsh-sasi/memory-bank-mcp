# Memory Bank MCP With Remote SSH Support 🧠

[![NPM Version](https://img.shields.io/npm/v/@aakarsh-sasi/memory-bank-mcp.svg)](https://www.npmjs.com/package/@aakarsh-sasi/memory-bank-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/movibe/memory-bank-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/movibe/memory-bank-mcp/actions/workflows/test.yml)
[![smithery badge](https://smithery.ai/badge/@aakarsh-sasi/memory-bank-mcp)](https://smithery.ai/server/@aakarsh-sasi/memory-bank-mcp)

A Model Context Protocol (MCP) server for managing Memory Banks, allowing AI assistants to store and retrieve information across sessions. Now with remote server support!

<a href="https://glama.ai/mcp/servers/@aakarsh-sasi/memory-bank-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@aakarsh-sasi/memory-bank-mcp/badge" alt="Memory Bank MCP server" />
</a>

## Overview 📋

Memory Bank Server provides a set of tools and resources for AI assistants to interact with Memory Banks. Memory Banks are structured repositories of information that help maintain context and track progress across multiple sessions.

## Features ✨

- **Memory Bank Management**: Initialize, find, and manage Memory Banks
- **File Operations**: Read and write files in Memory Banks
- **Progress Tracking**: Track progress and update Memory Bank files
- **Decision Logging**: Log important decisions with context and alternatives
- **Active Context Management**: Maintain and update active context information
- **Mode Support**: Detect and use .clinerules files for mode-specific behavior
- **UMB Command**: Update Memory Bank files temporarily with the UMB command
- **Robust Error Handling**: Gracefully handle errors and continue operation when possible
- **Status Prefix System**: Immediate visibility into Memory Bank operational state
- **Remote Server Support**: Store Memory Banks on a remote server using SSH

## Directory Structure 📁

By default, Memory Bank uses a `memory-bank` directory in the root of your project. When you specify a project path using the `--path` option, the Memory Bank will be created or accessed at `<project_path>/memory-bank`.

You can customize the name of the Memory Bank folder using the `--folder` option. For example, if you set `--folder custom-memory`, the Memory Bank will be created or accessed at `<project_path>/custom-memory`.

For more details on customizing the folder name, see [Custom Memory Bank Folder Name](docs/custom-folder-name.md).

## Recent Improvements 🛠️

- **Remote Server Support**: Store your Memory Bank on a remote server via SSH
- **Customizable Folder Name**: You can now specify a custom folder name for the Memory Bank
- **Consistent Directory Structure**: Memory Bank now always uses the configured folder name in the project root
- **Enhanced Initialization**: Memory Bank now works even when .clinerules files don't exist
- **Better Path Handling**: Improved handling of absolute and relative paths
- **Improved Directory Detection**: Better detection of existing memory-bank directories
- **More Robust Error Handling**: Graceful handling of errors related to .clinerules files

For more details, see [Memory Bank Bug Fixes](docs/memory-bank-bug-fixes.md).

## Installation 🚀

### Installing via Smithery

To install Memory Bank for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@aakarsh-sasi/memory-bank-mcp):

```bash
npx -y @smithery/cli install @aakarsh-sasi/memory-bank-mcp --client claude
```

### Manual Installation
```bash
# Install from npm
npm install @aakarsh-sasi/memory-bank-mcp

# Or install globally
npm install -g @aakarsh-sasi/memory-bank-mcp

# Or run directly with npx (no installation required)
npx @aakarsh-sasi/memory-bank-mcp
```

## Usage with npx 💻

You can run Memory Bank MCP directly without installation using npx:

```bash
# Run with default settings
npx @aakarsh-sasi/memory-bank-mcp

# Run with specific mode
npx @aakarsh-sasi/memory-bank-mcp --mode code

# Run with custom project path
npx @aakarsh-sasi/memory-bank-mcp --path /path/to/project

# Run with custom folder name
npx @aakarsh-sasi/memory-bank-mcp --folder custom-memory-bank

# Run with remote server
npx @aakarsh-sasi/memory-bank-mcp --remote --remote-user username --remote-host example.host.com --remote-path /home/username/memory-bank

# Show help
npx @aakarsh-sasi/memory-bank-mcp --help
```

For more detailed information about using npx, see [npx-usage.md](docs/npx-usage.md).

## Using Remote Server Mode 🌐

Memory Bank MCP now supports storing your Memory Bank on a remote server via SSH. This allows you to:

1. **Centralize your Memory Bank**: Keep all your project memory in one place
2. **Share Memory Banks**: Multiple users can access the same Memory Bank
3. **Persistent Storage**: Your Memory Bank persists even if your local machine is wiped

### Remote Server Requirements

- SSH access to the remote server
- SSH key authentication set up (password authentication is not supported)
- Sufficient permissions to create/modify files in the specified directory

### SSH Key Setup

To set up SSH key authentication for the remote server:

1. **Generate a new SSH key pair** (if you don't already have one):
   
   ```bash
   # Using modern Ed25519 algorithm (recommended)
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # OR using RSA if required for compatibility
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. **Start the SSH agent and add your key**:
   
   ```bash
   # Start the agent
   eval "$(ssh-agent -s)"
   
   # Add your key
   ssh-add ~/.ssh/id_ed25519  # or ~/.ssh/id_rsa if you used RSA
   ```

3. **Copy your public key to the remote server**:
   
   ```bash
   # Easiest method (if available)
   ssh-copy-id username@your-remote-host.com
   
   # Alternative: manually copy your public key
   cat ~/.ssh/id_ed25519.pub  # copy the output
   ```
   
   Then paste the key into the `~/.ssh/authorized_keys` file on the remote server.

4. **Test your connection**:
   
   ```bash
   ssh username@your-remote-host.com
   ```
   
   You should be able to log in without a password.

For more detailed SSH key setup instructions, see our [SSH Keys Guide](docs/ssh-keys-guide.md).

### Remote Server Configuration

To use remote server mode, you need to provide the following parameters:

```bash
npx @aakarsh-sasi/memory-bank-mcp --remote \
  --ssh-key ~/.ssh/your_ssh_key \
  --remote-user username \
  --remote-host example.host.com \
  --remote-path /home/username/memory-bank
```

By default, the SSH key is assumed to be at `~/.ssh/your_ssh_key`. You can specify a different key using the `--ssh-key` option.

### Remote Server Example

```bash
# Using with a server at example.host.com
npx @aakarsh-sasi/memory-bank-mcp --remote \
  --remote-user username \
  --remote-host example.host.com \
  --remote-path /home/username/memory-bank
```

## Configuring in Cursor 🖱️

Cursor is an AI-powered code editor that supports the Model Context Protocol (MCP). To configure Memory Bank MCP in Cursor:

1. **Use Memory Bank MCP with npx**:

   No need to install the package globally. You can use npx directly:

   ```bash
   # Verify npx is working correctly
   npx @aakarsh-sasi/memory-bank-mcp --help
   ```

2. **Open Cursor Settings**:

   - Go to Settings (⚙️) > Extensions > MCP
   - Click on "Add MCP Server"

3. **Configure the MCP Server**:

   - **Name**: Memory Bank MCP
   - **Command**: npx
   - **Arguments**: `@aakarsh-sasi/memory-bank-mcp --mode code` (or other mode as needed)
   
   For remote server:
   - **Arguments**: `@aakarsh-sasi/memory-bank-mcp --mode code --remote --remote-user username --remote-host example.host.com --remote-path /home/username/memory-bank`

4. **Save and Activate**:

   - Click "Save"
   - Enable the MCP server by toggling it on

5. **Verify Connection**:
   - Open a project in Cursor
   - The Memory Bank MCP should now be active and available in your AI interactions

For detailed instructions and advanced usage with Cursor, see [cursor-integration.md](docs/cursor-integration.md).

### Using with Cursor 🤖

Once configured, you can interact with Memory Bank MCP in Cursor through AI commands:

- **Initialize a Memory Bank**: `/mcp memory-bank-mcp initialize_memory_bank path=./memory-bank`
- **Track Progress**: `/mcp memory-bank-mcp track_progress action="Feature Implementation" description="Implemented feature X"`
- **Log Decision**: `/mcp memory-bank-mcp log_decision title="API Design" context="..." decision="..."`
- **Switch Mode**: `/mcp memory-bank-mcp switch_mode mode=code`

## MCP Modes and Their Usage 🔄

Memory Bank MCP supports different operational modes to optimize AI interactions for specific tasks:

### Available Modes

1. **Code Mode** 👨‍💻

   - Focus: Code implementation and development
   - Usage: `npx @aakarsh-sasi/memory-bank-mcp --mode code`
   - Best for: Writing, refactoring, and optimizing code

2. **Architect Mode** 🏗️

   - Focus: System design and architecture
   - Usage: `npx @aakarsh-sasi/memory-bank-mcp --mode architect`
   - Best for: Planning project structure, designing components, and making architectural decisions

3. **Ask Mode** ❓

   - Focus: Answering questions and providing information
   - Usage: `npx @aakarsh-sasi/memory-bank-mcp --mode ask`
   - Best for: Getting explanations, clarifications, and information

4. **Debug Mode** 🐛

   - Focus: Troubleshooting and problem-solving
   - Usage: `npx @aakarsh-sasi/memory-bank-mcp --mode debug`
   - Best for: Finding and fixing bugs, analyzing issues

5. **Test Mode** ✅
   - Focus: Testing and quality assurance
   - Usage: `npx @aakarsh-sasi/memory-bank-mcp --mode test`
   - Best for: Writing tests, test-driven development

### Switching Modes

You can switch modes in several ways:

1. **When starting the server**:

   ```bash
   npx @aakarsh-sasi/memory-bank-mcp --mode architect
   ```

2. **During a session**:

   ```bash
   memory-bank-mcp switch_mode mode=debug
   ```

3. **In Cursor**:

   ```
   /mcp memory-bank-mcp switch_mode mode=test
   ```

4. **Using .clinerules files**:
   Create a `.clinerules-[mode]` file in your project to automatically switch to that mode when the file is detected.

## How Memory Bank MCP Works 🧠

Memory Bank MCP is built on the Model Context Protocol (MCP), which enables AI assistants to interact with external tools and resources. Here's how it works:

### Core Components 🧩

1. **Memory Bank**: A structured repository of information stored as markdown files:

   - `product-context.md`: Overall project information and goals
   - `active-context.md`: Current state, ongoing tasks, and next steps
   - `progress.md`: History of project updates and milestones
   - `decision-log.md`: Record of important decisions with context and rationale
   - `system-patterns.md`: Architecture and code patterns used in the project

2. **MCP Server**: Provides tools and resources for AI assistants to interact with Memory Banks:

   - Runs as a standalone process
   - Communicates with AI assistants through the MCP protocol
   - Provides a set of tools for managing Memory Banks

3. **Mode System**: Supports different operational modes:
   - `code`: Focus on code implementation
   - `ask`: Focus on answering questions
   - `architect`: Focus on system design
   - `debug`: Focus on debugging issues
   - `test`: Focus on testing

### Data Flow 🔄

1. **Initialization**: The AI assistant connects to the MCP server and initializes a Memory Bank
2. **Tool Calls**: The AI assistant calls tools provided by the MCP server to read/write Memory Bank files
3. **Context Maintenance**: The Memory Bank maintains context across sessions, allowing the AI to recall previous decisions and progress

### Memory Bank Structure 📂

Memory Banks use a standardized structure to organize information:

- **Product Context**: Project overview, objectives, technologies, and architecture
- **Active Context**: Current state, ongoing tasks, known issues, and next steps
- **Progress**: Chronological record of project updates and milestones
- **Decision Log**: Record of important decisions with context, alternatives, and consequences
- **System Patterns**: Architecture patterns, code patterns, and documentation patterns

### Advanced Features 🚀

- **UMB Command**: Temporarily update Memory Bank files during a session without committing changes
- **Mode Detection**: Automatically detect and switch modes based on user input
- **File Migration**: Tools for migrating between different file naming conventions
- **Language Standardization**: All Memory Bank files are generated in English for consistency

## Versioning 📌

This project follows [Semantic Versioning](https://semver.org/) and uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. The version is automatically bumped and a changelog is generated based on commit messages when changes are merged into the main branch.

- **Major version** is bumped when there are breaking changes (commit messages with `BREAKING CHANGE` or `!:`)
- **Minor version** is bumped when new features are added (commit messages with `feat:` or `feat(scope):`)
- **Patch version** is bumped for all other changes (bug fixes, documentation, etc.)

For the complete history of changes, see the [CHANGELOG.md](CHANGELOG.md) file.

## Usage 📝

### As a Command Line Tool 💻

```bash
# Initialize a Memory Bank
memory-bank-mcp initialize_memory_bank path=./memory-bank

# Track progress
memory-bank-mcp track_progress action="Feature Implementation" description="Implemented feature X"

# Log a decision
memory-bank-mcp log_decision title="API Design" context="..." decision="..."

# Switch mode
memory-bank-mcp switch_mode mode=code
```

### As a Library 📚

```typescript
import { MemoryBankServer } from "@aakarsh-sasi/memory-bank-mcp";

// Create a new server instance
const server = new MemoryBankServer();

// Start the server
server.run().catch(console.error);
```

## Contributing 👥

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Memory Bank Status System 🚦

Memory Bank MCP implements a status prefix system that provides immediate visibility into the operational state of the Memory Bank:

### Status Indicators

Every response from an AI assistant using Memory Bank MCP begins with one of these status indicators:

- **`[MEMORY BANK: ACTIVE]`**: The Memory Bank is available and being used to provide context-aware responses
- **`[MEMORY BANK: INACTIVE]`**: The Memory Bank is not available or not properly configured
- **`[MEMORY BANK: UPDATING]`**: The Memory Bank is currently being updated (during UMB command execution)

This system ensures users always know whether the AI assistant is operating with full context awareness or limited information.

### Benefits

- **Transparency**: Users always know whether the AI has access to the full project context
- **Troubleshooting**: Makes it immediately obvious when Memory Bank is not properly configured
- **Context Awareness**: Helps users understand why certain responses may lack historical context

For more details, see [Memory Bank Status Prefix System](docs/memory-bank-status-prefix.md).
