# Contributing to AnomotionJS

Thank you for your interest in contributing to AnomotionJS! This document provides guidelines for setting up your local development workspace, branching models, and submitting contributions.

---

## 1. Local Workspace Setup

AnomotionJS is built as a monorepo managed by **npm workspaces** and **turborepo**. 

### Clone the Repository
Clone the repository using your preferred protocol:

- **HTTPS:**
  ```bash
  git clone https://github.com/EldrexDelosReyesBula/AnomotionJS.git
  ```
- **SSH:**
  ```bash
  git clone git@github.com:EldrexDelosReyesBula/AnomotionJS.git
  ```
- **GitHub CLI:**
  ```bash
  gh repo clone EldrexDelosReyesBula/AnomotionJS
  ```

### Install Dependencies
Run npm install in the root folder to bootstrap all packages and link internal workspaces:
```bash
cd AnomotionJS
npm install
```

### Running Development Servers
Start all package watch compile processes and development servers in parallel:
```bash
npm run dev
```
This launches:
- The TypeScript watch compiler for packages under `packages/*`.
- The documentation server at `http://localhost:5174/`.
- The developer playground at `http://localhost:3001/playground/`.

---

## 2. Coding Standards

- **TypeScript:** All packages are written in TypeScript. Ensure all custom types are declared correctly.
- **Linters:** Follow standard formatting rules (spaces for indentation, consistent semicolons).
- **Architecture:** Keep renderers decoupled from the core module calculations. Register renderers using `Anomotion.registerRenderer`.

---

## 3. Branching & Commit Message Guidelines

- **Branches:** Always create a feature branch off `main` for your work:
  ```bash
  git checkout -b feat/add-glow-effect
  ```
- **Conventional Commits:** Make clear, descriptive commit messages starting with appropriate prefixes:
  - `feat:` for new capabilities.
  - `fix:` for bug fixes.
  - `docs:` for updates in guidelines and documentation.
  - `chore:` for package dependency increments or tooling settings.

---

## 4. Submitting Pull Requests

1. Commit your changes and push your feature branch to your fork.
2. Submit a Pull Request targeting our `main` branch.
3. Complete the details in the provided PR template.
4. Ensure all builds compile cleanly (`npm run build`) before requesting a review.
