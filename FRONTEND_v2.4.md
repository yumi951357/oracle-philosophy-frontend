# Oracle Ethics Frontend v2.4

Public Version: v2.4
Purpose: Minimal and auditable UI for Oracle Ethics System
Stack: Static HTML/CSS/JS, Vercel Deploy

## 1. Whats in v2.4
- Clean UI shell with dark theme, mobile friendly
- Two mode output tags: truth and humanized response
- Honesty Record display: Determinacy, Deception Probability, Ethical Weight (read only)
- Lightweight logging hooks (frontend only shows data)
- Product Hunt Badge (optional)

Note: v2.4 is for display and basic interaction only.

## 2. Repo Structure

oracle-philosophy-frontend/
- index.html (main page)
- main.py (main application logic)
- styles.css (global dark theme styles)
- FRONTEND_v2.4.md (this file)

## 3. Quick Start (Local Preview)

Choose one:

A. Use VS Code Live Server
- Install Live Server extension
- Right click index.html -> Open with Live Server

B. Use npx static server
```bash
npx serve .
Then open http://localhost:3000

4. Minimal Config
Frontend only needs a read only API base URL (optional):

In index.html head:

html
<meta name="api-base" content="https://oracle-philosophy-backend.onrender.com" />
main.py can read this:

python
# Example to get API base
api_base = "https://oracle-philosophy-backend.onrender.com"  # Can be read from meta tag
5. Build and Deploy (Vercel)
Zero build (Static):

Connect GitHub repo to Vercel

Choose New Project

Framework: Other

Build Command: (leave empty)

Output Directory: /

Deploy

Custom domain (optional):

Vercel -> Project -> Settings -> Domains -> Add your domain

6. UI Honesty Record (Read Only Display)
In index.html, add a display card (read only):

html
<section id="honesty-card" class="card">
  <h3>Honesty Record</h3>
  <ul>
    <li>Determinacy: <span id="det">-</span></li>
    <li>Deception Prob: <span id="dp">-</span></li>
    <li>Ethical Weight: <span id="ew">-</span></li>
    <li>Mode: <span id="mode">-</span></li>
  </ul>
  <small id="hash">Hash: -</small>
</section>
main.py only shows public data from backend, no internal calculations.

7. Product Hunt Badge (Optional)
Add to index.html without changing main logic:

html
<div id="ph-badge" style="text-align:center; margin:60px 0 40px;">
  <p style="color:#00ffc6; letter-spacing:1px; margin-bottom:12px;">
    Featured on Product Hunt
  </p>
  <a href="https://www.producthunt.com/products/oracle-ethics-system-m2-4" target="_blank">
    <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1030076&theme=light"
         alt="Oracle Ethics System M2 4"
         width="250" height="54"
         style="border-radius:8px; box-shadow:0 0 20px rgba(0,255,198,.18);" />
  </a>
</div>
8. Accessibility and Performance
Semantic tags: main, section, nav, footer

Contrast ratio: text meets 4.5:1 in dark theme

Image alt text complete

No blocking scripts

Lighthouse score >= 90

9. Security (Frontend Side)
No keys or internal routes stored in frontend

Only public read APIs

All write operations and audit logs are backend only

10. Versioning (Public)
Public label: v2.4 only

Show in page footer:

html
<footer>
  <small>Oracle Ethics Public Frontend v2.4 (c) 2025</small>
</footer>
No internal levels or code names disclosed.

11. Rollback (Quick)
Vercel -> Deployments -> Choose stable build -> Promote to Production

12. FAQ
Q: Need to change main.py?
A: No. Badge and display layer only need HTML CSS.

Q: Can frontend calculate Deception Probability?
A: No. Frontend only shows read only values from backend.

13. Contact (Public)
Website: https://oracle-philosophy-frontend-hnup.vercel.app

Backend: https://oracle-philosophy-backend.onrender.com

Product Hunt: See badge link on site