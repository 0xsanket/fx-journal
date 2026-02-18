# AlphaJournal – Trading Dashboard

## React version (recommended)

The app is now built with **React** and **Vite** for a dynamic, interactive UI.

### Run the React app

```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Build for production

```bash
npm run build
```

Output goes to the `dist/` folder. Serve it with any static host or `npm run preview`.

---

## Vanilla version

The original HTML/JS version is still available:

- Open **index.vanilla.html** in your browser (double-click or drag into Chrome), or
- Serve the folder with any static server and open `index.vanilla.html`.

Data is stored in `localStorage` under the key `trades`. The React app uses the same key, so you can switch between React and vanilla and keep the same data.

---

## Features (React)

- **Reactive UI** – Stats, charts, and table update as soon as you add or filter trades.
- **Controlled form** – Log New Trade uses React state; form resets after submit.
- **Filter state** – Pair and result filters are in React state and drive all views.
- **Analytics tabs** – Detailed Stats / Analytics tab switch is component state.
- **Charts** – Built with `react-chartjs-2`; they re-render when data changes.
- **Persistence** – Same `localStorage` as the vanilla app; backup via “Backup Data” in the sidebar.
