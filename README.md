# Mall Quest RPG

A generic, shareable life-reward RPG website for GitHub Pages. No build tools, no backend, no account system.

## Features

- Activity logging with automatic category matching
- XP, coins, gems, levels, streaks, and daily bonus
- Unlockable mall stores
- Daily quests with reroll
- Reward shop and inventory
- Save data in browser localStorage
- Export/import save code for backups or sharing
- Fully responsive layout

## Files

```text
mall-rpg/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the root of the repository.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/root`.
6. Save.

Your site will publish as a GitHub Pages website.

## How to customize

Open `script.js` and edit:

- `categories` to change how activities are classified
- `stores` to change mall locations and unlock points
- `rewards` to change real-world reward costs
- `questPool` to change daily quests

Open `style.css` and edit the color variables at the top for a new theme.
