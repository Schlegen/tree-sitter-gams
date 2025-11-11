# tree-sitter-gams

Tree-sitter grammar for the [GAMS](https://www.gams.com/) (General Algebraic Modeling System) language.

This project provides a fast, incremental parser for GAMS source files using [Tree-sitter](https://tree-sitter.github.io/tree-sitter/). It enables syntax highlighting, structural analysis, and integration with IDEs and language tooling such as LSP servers.

## 🚀 Features

- None for now (early stage)

## Test

First time, install `tree-sitter-cli` :

```
npm install -g tree-sitter-cli
```

For testing on a GAMS code sample :

```
tree-sitter generate
tree-sitter parse code_sample.gms
```