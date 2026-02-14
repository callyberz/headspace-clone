const BASH_COMPLETION = `#!/bin/bash
_hs_completions() {
  local cur prev commands
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  commands="breathe break box-breathing stats config export completions"

  case "\${prev}" in
    hs)
      COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
      return 0
      ;;
    config)
      COMPREPLY=( $(compgen -W "defaultDuration theme" -- "\${cur}") )
      return 0
      ;;
    theme)
      COMPREPLY=( $(compgen -W "default minimal focus" -- "\${cur}") )
      return 0
      ;;
    export)
      COMPREPLY=( $(compgen -W "--format" -- "\${cur}") )
      return 0
      ;;
    --format)
      COMPREPLY=( $(compgen -W "json csv" -- "\${cur}") )
      return 0
      ;;
    --pattern)
      COMPREPLY=( $(compgen -W "4-4-4 4-7-8 5-5 4-4-4-4" -- "\${cur}") )
      return 0
      ;;
    breathe)
      COMPREPLY=( $(compgen -W "--pattern" -- "\${cur}") )
      return 0
      ;;
    completions)
      COMPREPLY=( $(compgen -W "bash zsh fish" -- "\${cur}") )
      return 0
      ;;
  esac
}
complete -F _hs_completions hs`;

const ZSH_COMPLETION = `#compdef hs
_hs() {
  local -a commands
  commands=(
    'breathe:Start a breath awareness session'
    'break:Start a mindful break'
    'box-breathing:Start a box breathing session'
    'stats:Show your meditation statistics'
    'config:View or update configuration'
    'export:Export session data'
    'completions:Generate shell completions'
  )

  _arguments -C \\
    '1:command:->command' \\
    '*::arg:->args'

  case "\$state" in
    command)
      _describe 'command' commands
      ;;
    args)
      case "\$words[1]" in
        config)
          _arguments '1:key:(defaultDuration theme)' '2:value:'
          ;;
        breathe)
          _arguments '--pattern[Breathing pattern]:pattern:(4-4-4 4-7-8 5-5 4-4-4-4)' '1:duration:'
          ;;
        export)
          _arguments '--format[Output format]:format:(json csv)'
          ;;
        completions)
          _arguments '1:shell:(bash zsh fish)'
          ;;
      esac
      ;;
  esac
}
_hs`;

const FISH_COMPLETION = `# Fish completions for hs
complete -c hs -f

# Commands
complete -c hs -n '__fish_use_subcommand' -a 'breathe' -d 'Start a breath awareness session'
complete -c hs -n '__fish_use_subcommand' -a 'break' -d 'Start a mindful break'
complete -c hs -n '__fish_use_subcommand' -a 'box-breathing' -d 'Start a box breathing session'
complete -c hs -n '__fish_use_subcommand' -a 'stats' -d 'Show your meditation statistics'
complete -c hs -n '__fish_use_subcommand' -a 'config' -d 'View or update configuration'
complete -c hs -n '__fish_use_subcommand' -a 'export' -d 'Export session data'
complete -c hs -n '__fish_use_subcommand' -a 'completions' -d 'Generate shell completions'

# Config keys
complete -c hs -n '__fish_seen_subcommand_from config' -a 'defaultDuration theme'
complete -c hs -n '__fish_seen_subcommand_from config; and __fish_seen_subcommand_from theme' -a 'default minimal focus'

# Breathe options
complete -c hs -n '__fish_seen_subcommand_from breathe' -l pattern -d 'Breathing pattern' -ra '4-4-4 4-7-8 5-5 4-4-4-4'

# Export options
complete -c hs -n '__fish_seen_subcommand_from export' -l format -d 'Output format' -ra 'json csv'

# Completions shells
complete -c hs -n '__fish_seen_subcommand_from completions' -a 'bash zsh fish'`;

const SCRIPTS: Record<string, string> = {
  bash: BASH_COMPLETION,
  zsh: ZSH_COMPLETION,
  fish: FISH_COMPLETION,
};

export function completionsCommand(shell: string): void {
  const script = SCRIPTS[shell];
  if (!script) {
    console.error(`Unsupported shell: "${shell}". Supported: bash, zsh, fish`);
    process.exit(1);
  }
  console.log(script);
}
