import git from 'isomorphic-git';
import LightningFS from '@isomorphic-git/lightning-fs';

class GitExecutor {
  constructor() {
    this.fs = new LightningFS('git-learning');
    this.pfs = this.fs.promises;
    this.dir = '/workspace';
    this.author = {
      name: 'Student',
      email: 'student@example.com'
    };
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Create workspace directory
      await this.pfs.mkdir(this.dir).catch(() => {});

      // Initialize git repository
      await git.init({
        fs: this.fs,
        dir: this.dir,
        defaultBranch: 'main'
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Git:', error);
      throw error;
    }
  }

  async execute(command) {
    await this.init();

    const parts = command.trim().split(/\s+/);
    const gitCommand = parts[0];
    const args = parts.slice(1);

    try {
      switch (gitCommand) {
        case 'init':
          return await this.gitInit();

        case 'status':
          return await this.gitStatus();

        case 'add':
          return await this.gitAdd(args);

        case 'commit':
          return await this.gitCommit(args);

        case 'log':
          return await this.gitLog(args);

        case 'branch':
          return await this.gitBranch(args);

        case 'checkout':
          return await this.gitCheckout(args);

        case 'merge':
          return await this.gitMerge(args);

        case 'diff':
          return await this.gitDiff();

        default:
          return `git: '${gitCommand}' is not a git command. See 'git --help'.`;
      }
    } catch (error) {
      return `error: ${error.message}`;
    }
  }

  async gitInit() {
    return `Reinitialized existing Git repository in ${this.dir}/.git/`;
  }

  async gitStatus() {
    const status = await git.statusMatrix({
      fs: this.fs,
      dir: this.dir
    });

    if (status.length === 0) {
      return `On branch main\n\nNo commits yet\n\nnothing to commit (create/copy files and use "git add" to track)`;
    }

    let output = 'On branch main\n';

    const untracked = status.filter(([, head, workdir, stage]) => head === 0 && workdir === 2 && stage === 0);
    const modified = status.filter(([, head, workdir, stage]) => head === 1 && workdir === 2 && stage === 1);
    const staged = status.filter(([, head, workdir, stage]) => head === 0 && workdir === 2 && stage === 2);
    const modifiedStaged = status.filter(([, head, workdir, stage]) => head === 1 && workdir === 2 && stage === 2);

    if (staged.length > 0 || modifiedStaged.length > 0) {
      output += '\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n';
      staged.forEach(([filepath]) => {
        output += `\tnew file:   ${filepath}\n`;
      });
      modifiedStaged.forEach(([filepath]) => {
        output += `\tmodified:   ${filepath}\n`;
      });
    }

    if (modified.length > 0) {
      output += '\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n';
      modified.forEach(([filepath]) => {
        output += `\tmodified:   ${filepath}\n`;
      });
    }

    if (untracked.length > 0) {
      output += '\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
      untracked.forEach(([filepath]) => {
        output += `\t${filepath}\n`;
      });
    }

    return output;
  }

  async gitAdd(args) {
    if (args.length === 0) {
      return "Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?";
    }

    const filepath = args[0];

    if (filepath === '.') {
      // Add all files
      const status = await git.statusMatrix({
        fs: this.fs,
        dir: this.dir
      });

      for (const [file] of status) {
        await git.add({
          fs: this.fs,
          dir: this.dir,
          filepath: file
        });
      }
      return '';
    }

    await git.add({
      fs: this.fs,
      dir: this.dir,
      filepath
    });

    return '';
  }

  async gitCommit(args) {
    if (args.length === 0 || args[0] !== '-m') {
      return 'error: option `-m` is required';
    }

    const message = args.slice(1).join(' ').replace(/['"]/g, '');

    const sha = await git.commit({
      fs: this.fs,
      dir: this.dir,
      message,
      author: this.author
    });

    const shortSha = sha.substring(0, 7);
    return `[main ${shortSha}] ${message}`;
  }

  async gitLog(args) {
    try {
      const commits = await git.log({
        fs: this.fs,
        dir: this.dir,
        depth: args.includes('--oneline') ? 10 : 5
      });

      if (commits.length === 0) {
        return 'fatal: your current branch \'main\' does not have any commits yet';
      }

      if (args.includes('--oneline')) {
        return commits.map(commit =>
          `${commit.oid.substring(0, 7)} ${commit.commit.message}`
        ).join('\n');
      }

      return commits.map(commit => `commit ${commit.oid}
Author: ${commit.commit.author.name} <${commit.commit.author.email}>
Date:   ${new Date(commit.commit.author.timestamp * 1000).toString()}

    ${commit.commit.message}
`).join('\n');
    } catch (error) {
      return 'fatal: your current branch \'main\' does not have any commits yet';
    }
  }

  async gitBranch(args) {
    const branches = await git.listBranches({
      fs: this.fs,
      dir: this.dir
    });

    if (args.length === 0) {
      // List branches
      const currentBranch = await git.currentBranch({
        fs: this.fs,
        dir: this.dir
      });

      return branches.map(branch =>
        branch === currentBranch ? `* ${branch}` : `  ${branch}`
      ).join('\n');
    }

    // Create new branch
    const branchName = args[0];
    await git.branch({
      fs: this.fs,
      dir: this.dir,
      ref: branchName
    });

    return '';
  }

  async gitCheckout(args) {
    if (args.length === 0) {
      return 'error: option requires an argument';
    }

    const ref = args[0];

    if (args.includes('-b')) {
      // Create and checkout new branch
      const branchName = args[args.indexOf('-b') + 1];
      await git.branch({
        fs: this.fs,
        dir: this.dir,
        ref: branchName,
        checkout: true
      });
      return `Switched to a new branch '${branchName}'`;
    }

    await git.checkout({
      fs: this.fs,
      dir: this.dir,
      ref
    });

    return `Switched to branch '${ref}'`;
  }

  async gitMerge(args) {
    if (args.length === 0) {
      return 'error: option requires an argument';
    }

    const theirBranch = args[0];

    try {
      await git.merge({
        fs: this.fs,
        dir: this.dir,
        ours: await git.currentBranch({ fs: this.fs, dir: this.dir }),
        theirs: theirBranch,
        author: this.author
      });

      return `Merge made by the 'recursive' strategy.`;
    } catch (error) {
      if (error.code === 'MergeNotSupportedError') {
        return `error: Merge conflicts detected. Please resolve conflicts manually.`;
      }
      throw error;
    }
  }

  async gitDiff() {
    return 'Diff functionality not yet implemented in this learning environment.';
  }

  // File system operations
  async writeFile(filepath, content) {
    await this.init();
    const fullPath = `${this.dir}/${filepath}`;
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

    // Create directory if it doesn't exist
    await this.pfs.mkdir(dirPath, { recursive: true }).catch(() => {});

    await this.pfs.writeFile(fullPath, content);
  }

  async readFile(filepath) {
    await this.init();
    try {
      const content = await this.pfs.readFile(`${this.dir}/${filepath}`, 'utf8');
      return content;
    } catch (error) {
      return null;
    }
  }

  async listFiles(path = '') {
    await this.init();
    try {
      const fullPath = path ? `${this.dir}/${path}` : this.dir;
      const files = await this.pfs.readdir(fullPath);
      return files.filter(f => f !== '.git');
    } catch (error) {
      return [];
    }
  }

  async reset() {
    // Clear the file system
    try {
      await this.pfs.rmdir(this.dir, { recursive: true });
    } catch (error) {
      // Directory might not exist
    }

    this.initialized = false;
    await this.init();
  }
}

// Export a singleton instance
const gitExecutor = new GitExecutor();
export default gitExecutor;
