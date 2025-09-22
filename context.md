# Project Context: Allocation Team

This document summarizes the key information about the "Allocation Team" project to provide context for development and maintenance tasks.

## 1. Project Overview

- **Name:** Allocation Team
- **Description:** A Full-Stack web application built with Next.js designed to manage and allocate team members' time across various projects and activities. It provides a visual interface for managers to view workload, and manage tasks on a weekly timeline.
- **Architecture:** Inspired by Clean Architecture, with a clear separation between back-end (business logic, data access) and front-end (UI) responsibilities.

## 2. Tech Stack

- **Framework:** Next.js (with App Router and Turbopack)
- **Language:** TypeScript
- **Database:** MongoDB
- **UI & Styling:** Tailwind CSS
- **Drag and Drop:** @dnd-kit
- **Icons:** Lucide React
- **API Documentation:** @scalar/api-reference-react
- **Containerization:** Docker and Docker Compose

## 3. Core Concepts & Domain

The application revolves around the following core entities:
- **Pessoa (Person):** A team member.
- **Projeto (Project):** A project that people can be allocated to.
- **Atividade (Activity):** A specific task assigned to a person within a project.
- **Resumo Semanal (Weekly Summary):** A summary of a person's activities for the week.

## 4. Project Structure

The project follows a layered architecture:

- `src/app`: Contains the Next.js pages (routes) and client-side UI logic.
- `src/app/api`: API endpoints, acting as the entry layer for the back-end.
- `src/core`: The heart of the back-end, containing the business logic.
    - `models`: Defines business entities.
    - `ports`: Defines repository interfaces (contracts) for dependency inversion.
    - `services`: Contains use cases/business logic (e.g., `CriarAtividade`).
- `src/infrastructure`: Concrete implementations of the interfaces defined in `core`.
    - `repositories/mongodb`: MongoDB implementations of the repository interfaces.
    - `factories/DependencyFactory.ts`: A factory for creating and injecting dependencies (services and repositories), centralizing dependency management.
- `src/components`: Reusable React components.
- `scripts`: Utility scripts for database initialization.
- `docker-compose.yml`: Defines the services for the development environment (MongoDB, Mongo Express).

## 5. Key Dependencies

- `next`: Core framework.
- `react`, `react-dom`: UI library.
- `mongodb`: MongoDB driver for database interaction.
- `next-auth`: For authentication.
- `@dnd-kit/*`: For drag-and-drop functionality.
- `tailwindcss`: For styling.
- `lucide-react`: For icons.
- `@scalar/api-reference-react`: For API documentation.

## 6. Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs the linter to check code quality.

## 7. Local Environment Setup

- **Method:** Docker Compose is the recommended way to run the project locally.
- **Command:** `docker-compose up -d` starts the required `mongodb` and `mongo-express` services.
- **Configuration:** A `.env.yml` file is required in the root directory for local development database configuration.
- **Application Start:** `npm install` followed by `npm run dev`.
- **Access:**
    - Application: `http://localhost:3000`
    - Database Admin: `http://localhost:8081` (Mongo Express)
    - API Docs: `http://localhost:3000/api-docs`
