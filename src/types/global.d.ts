// Global TypeScript declarations

// Declare Node.js module if needed
declare namespace NodeJS {
  interface Process {
    argv: string[];
    env: { [key: string]: string | undefined };
    cwd(): string;
    exit(code?: number): never;
    on(event: string, listener: Function): Process;
  }
  
  interface Global {
    process: Process;
  }
}

// Declare the process variable
declare var process: NodeJS.Process;

// For the 'fs' module
declare module 'fs' {
  export function readFileSync(path: string, options?: { encoding?: string; flag?: string } | string): string | Buffer;
  export function writeFileSync(path: string, data: string | Buffer, options?: { encoding?: string; flag?: string } | string): void;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean; mode?: number }): void;
  export function readdirSync(path: string): string[];
  export function statSync(path: string): { isDirectory(): boolean; isFile(): boolean; };
  // Add other fs methods as needed
}

// For the 'path' module
declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  // Add other path methods as needed
}

// For the 'child_process' module
declare module 'child_process' {
  interface ExecOptions {
    cwd?: string;
    env?: { [key: string]: string };
    encoding?: string;
    shell?: string;
    timeout?: number;
    maxBuffer?: number;
    killSignal?: string;
    uid?: number;
    gid?: number;
  }
  
  interface ExecException extends Error {
    code?: number | string;
    signal?: string;
  }
  
  type ExecCallback = (error: ExecException | null, stdout: string, stderr: string) => void;
  
  export function exec(command: string, options?: ExecOptions, callback?: ExecCallback): any;
  export function exec(command: string, callback?: ExecCallback): any;
  // Add other child_process methods as needed
}

// Add other module declarations as needed 