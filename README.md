# tree-sitter-gams

Tree-sitter grammar for the [GAMS](https://www.gams.com/) (General Algebraic Modeling System) language.

This project provides a fast, incremental parser for GAMS source files using [Tree-sitter](https://tree-sitter.github.io/tree-sitter/). It enables syntax highlighting, structural analysis, and integration with IDEs and language tooling such as LSP servers.

## Prerequisites

Install the Tree-sitter CLI (one-time):

```sh
npm install -g tree-sitter-cli
```

After any change to `grammar.js`, regenerate the parser:

```sh
tree-sitter generate
```

## Parsing a file

To inspect how the parser sees a GAMS file, run:

```sh
tree-sitter parse path/to/file.gms
```

The command prints the full parse tree. Nodes marked `(ERROR ...)` or `(MISSING ...)` indicate grammar gaps.

## Running the test suite

The grammar ships with corpus tests in `test/corpus/`. Each `.txt` file contains named test cases — a GAMS snippet paired with its expected parse tree.

Run all tests:

```sh
tree-sitter test
```

Filter by name (substring match):

```sh
tree-sitter test -f "scalar"
```

## Adding a new test case

Open (or create) a file in `test/corpus/`, e.g. `test/corpus/assignments.txt`, and append a new section:

```
================================================================================
My new test case
================================================================================

a(i) = b(i) + 1;

--------------------------------------------------------------------------------

```

Leave the section after `---` empty, then run:

```sh
tree-sitter test --update
```

Tree-sitter fills in the expected parse tree from the current parser output. The test is now locked: future grammar changes that alter this tree will cause the test to fail, showing a diff of what changed.

To intentionally accept a changed parse tree (e.g. after a grammar fix), run `--update` again.
