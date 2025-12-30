# Arcade Memory (Cyberpunk Violet)

Jeu de Memory en **vanilla JavaScript** avec un thème **cyberpunk violet** (CSS) et des images locales.

## Objectif

Trouver toutes les paires le plus vite possible avec le moins de coups.

## Lancer le projet

### Option 1 — Simple

Ouvre `index.html` dans ton navigateur.

### Option 2 — Recommandé (évite les blocages `file://`)

Lance un petit serveur HTTP dans le dossier du projet, puis ouvre l’URL indiquée.

**Python (si installé)**

```bash
python -m http.server 5500
```

Puis: http://localhost:5500

## Comment jouer

- Clique sur une carte pour la retourner.
- Retourne une deuxième carte.
- Si elles sont identiques: la paire est validée.
- Sinon: les cartes se retournent.

## Personnaliser les images des cartes

Par défaut, le jeu utilise **6 images** dans le dossier `img/` (elles sont dupliquées pour former les paires):

- `IMG1.jpeg` … `IMG6.jpeg`

Pour remplacer les cartes:

1) Remplace les fichiers dans `img/` en gardant les mêmes noms, **ou**
2) Modifie la liste dans `js/script.js` (tableau `files`).

Conseils pour un rendu propre:

- Utilise des images avec un style/ratio proche (sinon elles seront recadrées en `cover`).
- Les cartes recadrent automatiquement avec `object-fit: cover`.

## Meilleur score

Le meilleur score est stocké dans le navigateur via `localStorage` (clé `arcade-memory:best`).

## Structure

```
Finale/
├── index.html
├── css/
│   └── style.css
├── img/
│   ├── IMG1.jpeg
│   └── ...
└── js/
	├── memoryGame.js
	├── script.js
	├── storage.js
	└── utils.js
```

## Notes (style / performance)

- Les animations sont gérées en CSS et restent légères (priorité aux transitions `transform`).
- Si tu veux encore plus rapide: réduis la durée du flip dans `css/style.css` (règle `.cardInner`).

