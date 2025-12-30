/*
	Arcade Memory — bootstrap
	Ce fichier est volontairement petit:
	- récupère le DOM
	- configure la liste d'images
	- instancie le jeu
*/

(async function () {
	"use strict";

	const App = window.ArcadeMemory;
	if (!App || !App.game || !App.utils || !App.storage) {
		// Si l'ordre des <script> est cassé, on évite une page blanche.
		console.error("ArcadeMemory: scripts manquants. Vérifie l'ordre dans index.html");
		return;
	}

	// 1) Configuration des images utilisées pour les paires
	const images = {
		dir: "img",
		files: ["IMG1.jpeg", "IMG2.jpeg", "IMG3.jpeg", "IMG4.jpeg", "IMG5.jpeg", "IMG6.jpeg"],
	};

	// 2) Connexion aux éléments de l'interface
	const game = new App.game.MemoryGame({
		boardEl: document.getElementById("board"),
		movesEl: document.getElementById("moves"),
		timeEl: document.getElementById("time"),
		pairsEl: document.getElementById("pairs"),
		pairsTotalEl: document.getElementById("pairsTotal"),
		bestEl: document.getElementById("best"),
		msgEl: document.getElementById("msg"),
		restartBtn: document.getElementById("restart"),
		images,
	});

	// 3) Démarrage
	game.renderBest();
	game.setMsg("Chargement des images...");
	await game.preloadImages();
	game.resetGame();
})();

