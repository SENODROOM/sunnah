# CLI Reference

The `bukhari` command is available after installing via either npm or pip.

## Commands

```
bukhari <hadithId>
bukhari <chapterId> <hadithId>
bukhari --search "<query>" [--all]
bukhari --chapter <id>
bukhari --random
bukhari --react
bukhari --version
bukhari --help
```

## Language Flags

Apply to any command that prints a hadith:

| Flag | Alias | Output |
|------|-------|--------|
| _(none)_ | | English only (default) |
| `-a` | `--arabic` | Arabic only |
| `-b` | `--both` | Arabic + English |

## Examples

```bash
# By global ID
bukhari 1
bukhari 2345
bukhari 2345 -a     # Arabic only
bukhari 2345 -b     # Both

# Within a chapter (chapter 23, hadith 34)
bukhari 23 34

# Search — shows top 5 by default
bukhari --search "prayer"
bukhari --search "prayer" -b          # results in both languages
bukhari --search "fasting" --all      # show every result

# List all hadiths in a chapter
bukhari --chapter 5
bukhari --chapter 5 -a

# Random hadith
bukhari --random
bukhari --random -b

# Generate React hook (JS only — run inside your React project)
bukhari --react

# Info
bukhari --version
bukhari --help
```
