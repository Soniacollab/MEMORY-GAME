# Arcade Memory

Jeu de Memory en vanilla JS avec un style arcade (fond animé en CSS) et des images locales.

## Lancer le projet

- Ouvre `index.html` dans ton navigateur.

Si ton navigateur bloque certaines choses en `file://`, lance un mini-serveur dans le dossier `Finale/` :
- Python : `python -m http.server 5500`
- Puis ouvre `http://localhost:5500`

## Images du jeu

Le jeu utilise 6 images (dupliquées en paires) dans `img/` :
- `IMG1.jpeg` … `IMG6.jpeg`

Pour changer tes cartes, remplace ces fichiers (en gardant les mêmes noms), ou modifie la liste dans `js/script.js`.

## Sauvegarde du meilleur score

Le meilleur score est stocké dans le navigateur via `localStorage` (clé `arcade-memory:best`).

## Droits / IA (résumé pratique)

- Si tes images sont générées via un outil IA, tu peux généralement les utiliser dans ton projet **si** tu respectes leurs conditions d’utilisation.
- Dans tous les cas, évite les personnages/logos/franchises reconnaissables : les conditions des outils disent en général que **tu restes responsable** si tu enfreins les droits d’autrui.

## Crédits

- Background : fond animé généré en CSS (pas d’asset externe).
- Cartes : `img/IMG1.jpeg` … `img/IMG6.jpeg` (créations originales de l’auteur, générées via outils IA).
