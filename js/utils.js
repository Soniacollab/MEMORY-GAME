/*
	Arcade Memory — utils
	Petites fonctions réutilisables (formatage, mélange, etc.)
*/

(function () {
	"use strict";

	const App = (window.ArcadeMemory = window.ArcadeMemory || {});


    // Ajoute un zéro devant les nombres inférieurs à 10
	function pad2(n) {
		return String(n).padStart(2, "0");
	}

    // Formate un temps (en ms) en mm:ss
	function formatTime(ms) {
		const total = Math.max(0, Math.floor(ms / 1000));
		const m = Math.floor(total / 60);
		const s = total % 60;
		return `${pad2(m)}:${pad2(s)}`;
	}

	// Mélange un tableau en place (algorithme de Fisher-Yates)
	function shuffleInPlace(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

    // Exports
	App.utils = {
		pad2,
		formatTime,
		shuffleInPlace,
	};
})();
