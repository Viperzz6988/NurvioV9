# Nurvio Hub

## Overview

This repository contains a React + Vite frontend and a Node.js backend. It is configured to use MySQL (via `mysql2`) managed by phpMyAdmin. SQLite has been removed.

Top-level structure:

- `backend/` – Server code and database migrations (MySQL)
  - `server/` – Express API (auth, leaderboard, blackjack balance), MySQL only
  - `database/` – SQL migration files executed by the backend
- `frontend/` – Vite + React + TypeScript app (UI, pages, games)
- `public/` – Static assets
- `subpages/` – Static subpages and standalone games
  - `games/` – Blackjack, Tetris, Tic-Tac-Toe, etc.

Only this README is kept at the root.

## Requirements

- Node.js 18+
- npm 9+ (or pnpm/yarn)
- MySQL 8+ (can be managed via phpMyAdmin)
- phpMyAdmin (optional but recommended)

## Environment Setup

- Clone and checkout the branch:
  - `git clone <repo-url>`
  - `cd <repo>`
  - `git checkout NurvioV8.2`

- Copy env sample and adjust:
  - `cp .env.example .env`
  - Ensure `DATABASE_URL` points to your MySQL instance, e.g.: `mysql://username:password@localhost:3306/nurvio_hub`

- Create the MySQL database (via phpMyAdmin or CLI):
  - Database name: `nurvio_hub`
  - User with privileges on that DB

## Install Dependencies

- Root (optional runner):
  - `npm install`
- Frontend:
  - `cd frontend && npm install`
- Backend API:
  - `cd backend/server && npm install`

## Database Migration and Seeding (MySQL)

- Apply migrations:
  - `cd backend/server`
  - `npm run migrate`
- Seed admin users:
  - Default admins (development):
    - `npm run seed`
  - Or via env vars:
    - `ADMIN1_EMAIL=orange.admin@nurvio.de ADMIN1_PW=Root.Orange! ADMIN2_EMAIL=vez.admin@nurvio.de ADMIN2_PW=Root.Vez! npm run seed`

The seed is idempotent and creates two default admins if they do not exist.

## Running in Development

- One command from root (backend + frontend):
  - `npm run dev`

- Individually:
  - Backend: `cd backend/server && npm run dev` (port 3001)
  - Frontend: `cd frontend && npm run dev` (port 8080)

The frontend proxies `/api` to `http://localhost:3001` in development.

## Production Build and Start

- Frontend build:
  - `cd frontend && npm run build`
- Backend start:
  - `cd backend/server && npm run start`

## phpMyAdmin/MySQL Notes

- Use phpMyAdmin to manage the `nurvio_hub` database.
- Ensure `DATABASE_URL` uses the correct format: `mysql://user:pass@host:port/dbname`.

## Default Admin Credentials

- Email: `orange.admin@nurvio.de`, Password: `Root.Orange!`
- Email: `vez.admin@nurvio.de`, Password: `Root.Vez!`

## Troubleshooting

- Connection errors: verify `DATABASE_URL` and that MySQL is running and accessible.
- Migrations: re-run `npm run migrate` after updating SQL files.
- CORS: the frontend dev server proxies `/api` to port 3001.
