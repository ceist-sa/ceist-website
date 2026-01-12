# 🎻 CEIST Website

Official website for the **Camerata de Estudantes do Instituto Superior Técnico (CEIST)**.

Built with modern web technologies, this website showcases our concerts, members, and gallery while providing an interactive experience for our community.

## 🚀 Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/) with [SvelteKit](https://kit.svelte.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Icons:** [Lucide Svelte](https://lucide.dev/guide/svelte)
- **Deployment:** Docker & Caddy

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- Docker (for production deployment).

### Local Development

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start the development server:**
   ```bash
   bun run dev
   ```

3. **Open the browser:**
   Navigate to `http://localhost:5173`.

### Build for Production

```bash
bun run build
```

## 📂 Project Structure

- `src/routes/`: Contains the page routes and API endpoints.
  - `(main)/`: The primary landing page and public routes.
  - `admin/`: Administrative interface for content management.
  - `api/`: Backend endpoints (newsletter, etc.).
- `src/lib/`: Reusable components, utilities, and types.
  - `components/`: UI components (Hero, Gallery, Members, etc.).
- `data/`: JSON files acting as the project's "database" for:
  - `concerts.json`: Upcoming and past performances.
  - `members.json`: Current members and their roles.
  - `gallery.json`: Photos and albums.
- `static/`: Static assets like images, logos, and fonts.

## 🐳 Deployment

The project is containerized using Docker.

### Running with Docker Compose

```bash
docker compose up -d
```

The configuration includes:
- **Automatic HTTPS** via Caddy.
- **Environment variables** loaded from `.env`.
- **Persistent storage** for the `data/` directory.

## ⚙️ CI/CD

This project uses **GitHub Actions** for automated builds and deployment:

- **Build & Publish:** On every push to `main` or a new version tag (`v*`), a Docker image is built and pushed to the [GitHub Container Registry (GHCR)](https://ghcr.io).
- **Registry:** `ghcr.io/ceist-sa/ceist-website`

The production server pulls the latest image from GHCR as defined in the `docker-compose.yaml`.


## 📝 Data Management

Most of the website's content is managed via JSON files in the `data/` directory. This allows for quick updates without needing a full database setup for simple content like member lists and concert dates.

---

Made with ❤️ by CEIST.
