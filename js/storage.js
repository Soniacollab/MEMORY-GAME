/*
	Arcade Memory — storage
	Gestion du meilleur score en localStorage.
*/

(function () {
	"use strict";

	const App = (window.ArcadeMemory = window.ArcadeMemory || {});

	const BEST_KEY = "arcade-memory:best";

    // Récupère le meilleur score (ou null) depuis le localStorage
	function getBest() {
		try {
			const raw = localStorage.getItem(BEST_KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!parsed || typeof parsed !== "object") return null;
			if (typeof parsed.ms !== "number" || typeof parsed.moves !== "number") return null;
			// Protection: un ancien bug pouvait enregistrer 0ms.
			if (!Number.isFinite(parsed.ms) || parsed.ms <= 0) return null;
			if (!Number.isFinite(parsed.moves) || parsed.moves <= 0) return null;
			return parsed;
		} catch {
			return null;
		}
	}

	function setBest(ms, moves) {
		try {
			localStorage.setItem(BEST_KEY, JSON.stringify({ ms, moves }));
		} catch {
			// Si le navigateur bloque on ignore
		}
	}

	App.storage = {
		BEST_KEY,
		getBest,
		setBest,
	};
})();
