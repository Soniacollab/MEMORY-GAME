/*
    Arcade Memory — game
    Le cœur du jeu: deck, clics, matching, timer, win.

    Choix volontaire:
    - Pas de modules ES (import/export) pour éviter les soucis de "file://".
    - On utilise un petit namespace global: window.ArcadeMemory
*/


// Fonction qui encapsule tout le code du jeu
(function () {

    // On utilise le mode strict de JS pour éviter les erreurs bêtes
    "use strict";

    // Ici le App permettra de accéder aux autres modules (utils, storage) 
    // Vu que j'ai pas utilisé de modules ES
    const App = (window.ArcadeMemory = window.ArcadeMemory || {});


    // Fonctions utilitaires qui va permettre de manipuler les cartes
    // Ici on veut savoir si une carte est révélée en se basant sur sa classe CSS
    function isRevealed(card) {
        return card.classList.contains("isRevealed");
    }


    // Ici on veut savoir si une carte a déjà été appariée
    function isMatched(card) {
        return card.classList.contains("isMatched");
    }


    // Ici on veut révéler une carte en lui ajoutant une classe CSS
    function reveal(card) {
        card.classList.add("isRevealed");
        card.setAttribute("aria-label", "Carte révélée");
    }


    // Ici on veut cacher une carte en lui enlevant une classe CSS
    function hide(card) {
        card.classList.remove("isRevealed");
        card.setAttribute("aria-label", "Carte cachée");
    }


    // Si deux cartes sont appariées, on leur ajoute une classe CSS
    // Ce qui va appliquer un style visuel différent
    function markMatched(a, b) {
        a.classList.add("isMatched");
        b.classList.add("isMatched");
        a.setAttribute("aria-label", "Carte trouvée");
        b.setAttribute("aria-label", "Carte trouvée");
    }


    // La "classe" principale du jeu
    // On a des params pour passer les éléments du DOM et la config des images
    /**
        @param {{
            // (compat) anciens noms
            boardEl?: HTMLElement,
            movesEl?: HTMLElement,
            timeEl?: HTMLElement,
            pairsEl?: HTMLElement,
            pairsTotalEl?: HTMLElement,
            bestEl?: HTMLElement,
            msgEl?: HTMLElement,

            // (compat) tes nouveaux noms
            boardElement?: HTMLElement,
            movesElement?: HTMLElement,
            timeElement?: HTMLElement,
            pairsElement?: HTMLElement,
            pairsTotalElement?: HTMLElement,
            bestElement?: HTMLElement,
            msgElement?: HTMLElement,

            restartBtn: HTMLElement,
            images: { dir: string, files: string[] }
        }} options
    */

   // La fonction constructeur
    function MemoryGame(options) {
        // Normalise les noms des éléments (pour accepter boardEl OU boardElement)
        this.element = {
            boardEl: options.boardEl || options.boardElement,
            movesEl: options.movesEl || options.movesElement,
            timeEl: options.timeEl || options.timeElement,
            pairsEl: options.pairsEl || options.pairsElement,
            pairsTotalEl: options.pairsTotalEl || options.pairsTotalElement,
            bestEl: options.bestEl || options.bestElement,
            msgEl: options.msgEl || options.msgElement,
            restartBtn: options.restartBtn,
            images: options.images,
        };

        // Etat du match
        this.firstPick = null;
        this.secondPick = null;
        this.lock = false;

        // Stats
        this.moves = 0;
        this.pairs = 0;
        this.pairsTotal = 0;

        // Timer
        this.startedAt = null;
        this.timerId = null;
        this.running = false;
		this.elapsedMs = 0;

        // Métadonnées d'images (pour un cadrage plus propre)
        this.imageFocusBySrc = new Map();

        // Bind
        this.onCardClick = this.onCardClick.bind(this);
        this.resetGame = this.resetGame.bind(this);

        this.element.restartBtn.addEventListener("click", this.resetGame);
    }


    // Méthodes de la "classe" MemoryGame qui va ici gérer les messages
    MemoryGame.prototype.setMsg = function (text) {
        this.element.msgEl.textContent = text || "";
        this.element.msgEl.classList.toggle("isEmpty", !text);
    };


    // Méthode pour afficher le meilleur score
    MemoryGame.prototype.renderBest = function () {
        // Récupère le meilleur score depuis le module storage
        const best = App.storage.getBest();

        // Si pas de meilleur score, affiche un tiret
        if (!best) {
            this.element.bestEl.textContent = "—";
            return;
        }

        // Sinon affiche le meilleur score formaté par exemple 01:23 · 15 coups
        this.element.bestEl.textContent = `${App.utils.formatTime(best.ms)} · ${best.moves}`;
    };


    // Méthode pour démarrer le timer si ce n'est pas déjà fait
    MemoryGame.prototype.startTimerIfNeeded = function () {
        if (this.running) return;
        this.running = true;
        this.startedAt = performance.now();
		this.elapsedMs = 0;
        this.timerId = window.setInterval(() => {
            const now = performance.now();
            this.element.timeEl.textContent = App.utils.formatTime(now - this.startedAt);
        }, 250);
    };


    // Méthode pour arrêter le timer avec clearInterval
    MemoryGame.prototype.stopTimer = function () {
        if (this.timerId) window.clearInterval(this.timerId);
        this.timerId = null;
		if (this.startedAt != null) {
			this.elapsedMs = Math.max(0, performance.now() - this.startedAt);
		}
        this.running = false;
    };


    // Méthode pour obtenir le temps écoulé actuel en millisecondes
    MemoryGame.prototype.currentElapsedMs = function () {
		if (this.running && this.startedAt != null) return performance.now() - this.startedAt;
		return this.elapsedMs || 0;
    };


    // Méthode pour définir le nombre de colonnes de la grille en fonction du nombre de cartes
    MemoryGame.prototype.setGridColumns = function (cardCount) {
        // 12 cartes => 6 colonnes (2 lignes). Ajuste si tu changes le nombre d'images.
        const cols = cardCount === 12 ? 6 : cardCount === 16 ? 4 : cardCount === 20 ? 5 : 4;
        this.element.boardEl.style.setProperty("--cols", String(cols));
    };


    // Méthode pour construire le deck de cartes
    MemoryGame.prototype.buildDeck = function () {
        // D'abord on crée une liste d'objets carte avec id, src, alt
        const dir = this.element.images.dir;
        const files = this.element.images.files;

        // Ensuite on crée la base du deck  
        const base = files.map((file, idx) => {
            const n = idx + 1;
            return {
                id: `img-${n}`,
                src: `${dir}/${file}`,
                alt: `Image ${n}`,
            };
        });

        // On duplique pour créer les paires
        const deck = [];
        for (const item of base) {
            deck.push({ ...item });
            deck.push({ ...item });
        }

        App.utils.shuffleInPlace(deck);
        return deck;
    };


    // Méthode pour créer un élément carte dans le DOM
    MemoryGame.prototype.createCard = function (card, index) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "card";
        btn.setAttribute("aria-label", "Carte cachée");
        btn.dataset.cardId = card.id;
        btn.dataset.index = String(index);

        // Applique un focus vertical si connu (sinon centre)
        const focusY = this.imageFocusBySrc.get(card.src);
        if (focusY) btn.style.setProperty("--imgFocusY", focusY);

        btn.innerHTML = `
			<span class="cardInner">
				<span class="cardFace cardBack" aria-hidden="true">
					<span class="rune"></span>
				</span>
				<span class="cardFace cardFront">
					<img class="cardImg" src="${card.src}" alt="${card.alt}" loading="lazy" />
				</span>
			</span>
		`.trim();

        btn.addEventListener("click", this.onCardClick);
        return btn;
    };


    // Méthode pour réinitialiser les sélections de cartes
    MemoryGame.prototype.resetPicks = function () {
        this.firstPick = null;
        this.secondPick = null;
    };


    // Méthode pour incrémenter le nombre de coups
    MemoryGame.prototype.bumpMoves = function () {
        this.moves++;
        this.element.movesEl.textContent = String(this.moves);
    };


    // Méthode pour incrémenter le nombre de paires trouvées
    MemoryGame.prototype.bumpPairs = function () {
        this.pairs++;
        this.element.pairsEl.textContent = String(this.pairs);
    };


    // Méthode appelée lorsqu'on gagne la partie
    MemoryGame.prototype.onWin = function () {
        this.stopTimer();

        const elapsed = this.currentElapsedMs();
        const best = App.storage.getBest();
        const isBetter = !best || elapsed < best.ms || (elapsed === best.ms && this.moves < best.moves);

        if (isBetter) {
            App.storage.setBest(elapsed, this.moves);
            this.renderBest();
            this.setMsg(`Victoire. Nouveau record : ${App.utils.formatTime(elapsed)} · ${this.moves} coups.`);
        } else {
            this.setMsg(`Victoire. Temps : ${App.utils.formatTime(elapsed)} · ${this.moves} coups.`);
        }

        this.element.boardEl.classList.add("isWon");
    };



    // Méthode appelée lorsqu'on clique sur une carte
    MemoryGame.prototype.onCardClick = function (e) {
        const card = e.currentTarget;
        if (!(card instanceof HTMLElement)) return;
        if (this.lock) return;
        if (isMatched(card) || isRevealed(card)) return;

        this.startTimerIfNeeded();
        this.element.boardEl.classList.remove("isWon");
        this.setMsg("");

        reveal(card);

        // 1ère carte
        if (!this.firstPick) {
            this.firstPick = card;
            return;
        }

        // 2ème carte
        this.secondPick = card;
        this.bumpMoves();

        const aId = this.firstPick.dataset.cardId;
        const bId = this.secondPick.dataset.cardId;
        const match = aId && bId && aId === bId;

        this.lock = true;

        if (match) {
            markMatched(this.firstPick, this.secondPick);
            this.bumpPairs();
            this.resetPicks();
            this.lock = false;
            if (this.pairs === this.pairsTotal) this.onWin();
            return;
        }

        // Pas une paire: on laisse un petit temps, puis on referme.
        window.setTimeout(() => {
            if (this.firstPick) hide(this.firstPick);
            if (this.secondPick) hide(this.secondPick);
            this.resetPicks();
            this.lock = false;
        }, 650);
    };

    MemoryGame.prototype.preloadImages = async function () {
        const urls = this.element.images.files.map((f) => `${this.element.images.dir}/${f}`);
        await Promise.all(
            urls.map(
                (src) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
						// Déduit un focus vertical simple selon l'orientation.
						// Portraits: on remonte légèrement pour éviter de couper le haut.
						const w = img.naturalWidth || 1;
						const h = img.naturalHeight || 1;
						const ratio = h / w;
						let focusY = "50%";
						if (ratio >= 1.18) focusY = "38%";
						else if (ratio <= 0.86) focusY = "52%";
						this.imageFocusBySrc.set(src, focusY);
						resolve(true);
					};
                        img.onerror = () => resolve(false);
                        img.src = src;
                    })
            )
        );
    };


    // Enfin la méthode pour réinitialiser le jeu
    MemoryGame.prototype.resetGame = function () {
        this.stopTimer();
        this.startedAt = null;
		this.elapsedMs = 0;
        this.element.timeEl.textContent = "00:00";

        this.moves = 0;
        this.pairs = 0;
        this.element.movesEl.textContent = "0";
        this.element.pairsEl.textContent = "0";

        this.setMsg("Mémorise. Frappe. Répète.");
        this.resetPicks();
        this.lock = false;
        this.element.boardEl.classList.remove("isWon");

        const deck = this.buildDeck();
        this.pairsTotal = deck.length / 2;
        this.element.pairsTotalEl.textContent = String(this.pairsTotal);
        this.setGridColumns(deck.length);

        // Reconstruit le board
        this.element.boardEl.innerHTML = "";
        const frag = document.createDocumentFragment();
        deck.forEach((card, idx) => frag.appendChild(this.createCard(card, idx)));
        this.element.boardEl.appendChild(frag);
    };

    App.game = {
        MemoryGame,
    };
})();
