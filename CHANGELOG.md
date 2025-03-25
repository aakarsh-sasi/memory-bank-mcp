# Changelog

All notable changes to this project will be documented in this file.

## [1.1.3] - 2025-03-25

### Fixed
- Fixed missing `initializeMemoryBank` method in MemoryBankManager class that was causing "TypeError: memoryBankManager.initializeMemoryBank is not a function" error
- Added backwards compatibility method to ensure tests and existing code still work with the renamed method
- Updated tools to use the correct method signature

## [1.1.2] - 2025-03-25

### Fixed
- Fixed SSH key path handling to properly resolve tilde (~) to home directory
- Added file existence check for SSH key before attempting connection
- Improved error reporting for SSH connection issues
- Fixed remote path handling in connection test

## [1.1.0] - 2025-03-25

### Added
- Remote server support via SSH
- Ability to store Memory Banks on remote servers
- Custom SSH key specification with the `--ssh-key` option
- Tests for remote server functionality

### Fixed
- TypeScript type definitions for Node.js modules
- Fixed linter errors related to missing type declarations
- Improved error handling for SSH connections
- Better handling of process references for cross-platform compatibility

### Changed
- Improved module structure for better maintainability
- Updated build process to bundle dependencies properly
- Enhanced logging for remote server operations
- Simplified API for remote server configuration

## [1.0.0] - Initial Release

### Added
- Basic Memory Bank functionality
- File operations for Memory Banks
- Progress tracking and decision logging
- Mode support with .clinerules files
- UMB command for temporary Memory Bank updates

### [0.4.1](https://github.com/movibe/memory-bank-server/compare/v0.4.0...v0.4.1) (2025-03-17)

## [0.4.0](https://github.com/movibe/memory-bank-server/compare/v0.3.0...v0.4.0) (2025-03-17)


### Features

* Add MIT License file ([e19e4da](https://github.com/movibe/memory-bank-server/commit/e19e4da551dc33011cf4821153fc3bae786e5fbd))

## [0.3.0](https://github.com/movibe/memory-bank-server/compare/v0.2.1...v0.3.0) (2025-03-09)


### Features

* Implement Centralized Logging System with Debug Mode Support ([6b84223](https://github.com/movibe/memory-bank-server/commit/6b842230e8eb3763c74403b1a34ce28832cc1b86))
* Update User Identification with GitHub Profile URL Support ([4311147](https://github.com/movibe/memory-bank-server/commit/43111473af58f434b0ea5891036ca9cedbda02ce))


### Documentation

* Add debug MCP configuration tool and documentation ([22744cc](https://github.com/movibe/memory-bank-server/commit/22744cc9dbc72725ba9d71cb261c64b6216758ed))

### [0.2.1](https://github.com/movibe/memory-bank-server/compare/v0.2.0...v0.2.1) (2025-03-08)


### Features

* Add customizable Memory Bank folder name and user tracking ([60d0b53](https://github.com/movibe/memory-bank-server/commit/60d0b53192c1cc3b907e15ad05949e5be946fedc))


### Documentation

* Consolidate Cline Integration Documentation ([6dac2df](https://github.com/movibe/memory-bank-server/commit/6dac2df805762267f8d73d56984e898b9c9e15e2))
* Update Memory Bank documentation with comprehensive improvements ([4476c77](https://github.com/movibe/memory-bank-server/commit/4476c771bbfca5342697624d1514fa1918b20abd))


### Code Refactoring

* Remove deprecated environment variable support ([15bfc7f](https://github.com/movibe/memory-bank-server/commit/15bfc7fd8dc348bd0f666eaa5007231e507a3fa0))
* Simplify Memory Bank initialization and file structure ([1b5cf9f](https://github.com/movibe/memory-bank-server/commit/1b5cf9f9b3b076a7f4d9dfc281fc709a9dbbae26))

## [0.2.0](https://github.com/movibe/memory-bank-server/compare/v0.1.2...v0.2.0) (2025-03-08)


### Features

* Add comprehensive test-memory-bank configuration and clinerule templates ([e95cd29](https://github.com/movibe/memory-bank-server/commit/e95cd2956003171c9989e40480d9736f1fb6f921))
* Enhance Memory Bank Language Enforcement and Error Handling ([78af3d6](https://github.com/movibe/memory-bank-server/commit/78af3d60db863fcd57710ba51ea5ccd744b9e7ca))
* Enhance Memory Bank MCP with Environment Variables and Roo Code Integration ([7059e5a](https://github.com/movibe/memory-bank-server/commit/7059e5a4e0363f184b4918982d9141474f39e9a1))
* Enhance Type Safety and Interfaces for Memory Bank MCP ([7422abc](https://github.com/movibe/memory-bank-server/commit/7422abce3caa01a1a54d702506c6ad025285fa89))
* Standardize Clinerule Templates to YAML Format ([dad5009](https://github.com/movibe/memory-bank-server/commit/dad5009d050ad36cfed7374facb45dc0045600d5))


### Tests

* Add comprehensive test suite for Memory Bank MCP server components ([0b2e244](https://github.com/movibe/memory-bank-server/commit/0b2e244effd78df94f6f6b7510372a9d479ce5e7))


### Documentation

* Add Memory Bank Status Prefix System Documentation ([8a0f1ca](https://github.com/movibe/memory-bank-server/commit/8a0f1caa3090cceabf4e3ad017c5a42cf2411cf7))

### [0.1.2](https://github.com/movibe/memory-bank-server/compare/v0.1.1...v0.1.2) (2025-03-08)


### Documentation

* Update repository URLs and English translation ([75afb2c](https://github.com/movibe/memory-bank-server/commit/75afb2cad335709bc01cca3fcaf91a4e66346341))

### 0.1.1 (2025-03-08)


### Features

* Add semantic versioning and changelog generation ([79493a4](https://github.com/movibe/memory-bank-server/commit/79493a4a42bdaa5e40c878ea948116e941b0a8b2))
* Automate NPM publication with GitHub Actions ([588d2db](https://github.com/movibe/memory-bank-server/commit/588d2dbc0bd3ed17fb5a2447f7468990a00cb57f))
* Configure project for npm publication and enhance documentation ([b387dcf](https://github.com/movibe/memory-bank-server/commit/b387dcf7c048197404f59cd7a7abdd38c10c1480))
* Standardize Memory Bank file naming and improve migration support ([0c9e540](https://github.com/movibe/memory-bank-server/commit/0c9e54002b596d25821520cf57617c4415367447))
* Standardize Memory Bank Language and Path Configuration ([71a9c79](https://github.com/movibe/memory-bank-server/commit/71a9c796535c58d017dfb85d5da6b7a563e26a54))


### Documentation

* Enhance README and add Cursor integration documentation ([7fcf2d3](https://github.com/movibe/memory-bank-server/commit/7fcf2d3ac9a353a821fc37413261fbad67628ab0))

## 0.1.0 (2025-03-08)

### Features

- Initial release of Memory Bank MCP
- Support for Memory Bank management
- Support for progress tracking
- Support for decision logging
- Support for active context management
- Support for mode detection
- Support for UMB command
- Support for npx usage
- English language standardization
- Current directory as default for Memory Bank
