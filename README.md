# Youth Football Coaching Hub 🏈

This is my personal project and first attempt at building a  website from scratch. It’s designed to help coaches, players, and parents with practical football knowledge, drills, and philosophies.

📍 Visit the live site: [footballcoachinghub.com](https://footballcoachinghub.com)

---

## 🛠️ Current Features

- Position-specific drill pages (QB, RB, WR, OL, DL, LB, DB)
- Conditioning and strength training guides
- Offseason workout programs
- Written coaching philosophy and team-building principles

---
## 🛠️ Future Features
- Blocking Scheme
- Offense Formations
- Defense Formations
- Coaches Corner
- My page (for notes and what I was kind of using README for)
- Playbooks
- html layout update

## 🚀 Getting Started

You can test the site locally by simply opening `index.html` in your browser.

To clone the repository:

```bash
git clone https://github.com/your-username/your-repo-name.git
```

File Structure:
website/
├── index.html
├── pages/
│   ├── offense/
│   ├── defense/
│   ├── physical_training/
│   └── about.html
├── images/
├── js/
└── styles.css
```

## 🔐 Coaches Corner Protection

- **Password hash storage:** The SHA-256 password hash is stored in `/js/auth.js` in the obfuscated auth module used by both `/coaches-login.html` and `/coaches-corner/index.html`.
- **How to change the password:**
  1. Generate a new SHA-256 hash for your new password (for example: `printf 'NEW_PASSWORD' | sha256sum`).
  2. Replace the existing hash string in `/js/auth.js`.
  3. Commit and deploy changes to GitHub Pages.
- **Session handling:**
  - On successful login, the app runs `sessionStorage.setItem("coachAuth", "true")`.
  - Protected routes check `sessionStorage` immediately and redirect unauthenticated users to `/coaches-login.html`.
  - Session persists only for the active browser tab/session and is cleared when the tab/session ends or when the user clicks logout.
