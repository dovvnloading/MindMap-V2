# MindMap V2

<img width="1786" height="893" alt="Interface Preview" src="https://github.com/user-attachments/assets/35726f1c-8b09-4699-8ab6-1ca74109bbe7" />

![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-7.9-f9a03c?style=for-the-badge&logo=d3.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=for-the-badge&logo=tailwindcss)

### Access the Application
**Live Deployment:** [https://dovvnloading.github.io/MindMap-V2/](https://dovvnloading.github.io/MindMap-V2/)

## Overview

MindMap V2 is a high-performance visualization engine that transforms structured Markdown text into interactive, force-directed node graphs in real-time. Designed with a focus on neumorphic UI principles, it bridges the gap between linear text editing and spatial information management.

The application leverages recursive parsing algorithms to interpret indentation levels and header syntax, dynamically generating SVG trees using D3.js. It features a custom-built split-pane architecture allowing for simultaneous editing and viewing.

## Technical Architecture

The project is built on a modern stack emphasizing type safety and rendering performance:

*   **Core Framework:** React 19 (ESNext)
*   **Language:** TypeScript (Strict Mode)
*   **Visualization Engine:** D3.js (Data-Driven Documents) for complex hierarchy calculation and SVG rendering.
*   **Build Tool:** Vite for High-Performance Module Replacement (HMR).
*   **Styling:** Tailwind CSS combined with dynamic CSS variables for theme switching (Neumorphism).

## Key Features

*   **Markdown-to-Graph Parsing:** Instant conversion of headers (`#`) and list items into parent-child node relationships.
*   **Bi-Directional Interaction:** Manipulating the graph allows for node expansion/collapse, while the text editor drives the structure.
*   **Neumorphic Theming:** A sophisticated light/dark mode implementation using soft-ui shadow calculations.
*   **Navigation Pins:** A bookmarking system allowing users to tag and jump to specific nodes within large datasets.
*   **Intelligent Layouts:** logic for auto-organizing content (A-Z, Z-A, and Smart Hierarchical Cleaning).
*   **High-Resolution Export:** Canvas-based rendering engine to export vector maps as PNG files.

## Proprietary Usage Notice

**IMPORTANT: READ BEFORE VIEWING SOURCE**

This repository is **Source Available**, not Open Source.

The source code, interface design, architecture, and specific implementation logic contained within this repository are the intellectual property of the developer. This repository is public strictly for **educational purposes** and **portfolio demonstration**.

*   **DO NOT** clone, fork, or reproduce this application.
*   **DO NOT** use this code as a base for your own commercial or non-commercial projects.
*   **DO NOT** redistribute this software.

You are free to use the hosted application via the link provided above for its intended purpose (creating mind maps), but the underlying codebase is not licensed for modification or redistribution.
