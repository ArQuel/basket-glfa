# 🎪 Jeu de Basket de Fête Foraine 🏀

Un jeu de basket interactif inspiré des jeux de fête foraine, avec système de points et timer.

## 🎮 Comment jouer

1. Ouvrez le fichier `index.html` dans votre navigateur web
2. Cliquez sur "Commencer la partie"
3. Visez en cliquant sur le ballon et en tirant dans la direction opposée au tir souhaité
4. Plus vous tirez loin du ballon, plus le tir sera puissant
5. Marquez le plus de paniers possible en 60 secondes !

## 🎯 Règles

- **Temps de jeu** : 60 secondes
- **Points par panier** : 2 points
- **Ballons** : Illimités (nouveau ballon après chaque tentative)

## ⚡ Fonctionnalités

- ✅ Physique réaliste avec gravité
- ✅ Système de visée intuitive
- ✅ 3 paniers à différentes positions
- ✅ Effets visuels (particules lors d'un panier marqué)
- ✅ Compte à rebours de 60 secondes
- ✅ Compatible souris et écran tactile
- ✅ Design responsive

## 🛠️ Technologies utilisées

- HTML5 Canvas
- CSS3 (avec gradients et animations)
- JavaScript vanilla (pas de dépendances)

## 🎨 Personnalisation

Vous pouvez modifier les paramètres du jeu dans `script.js` :

```javascript
const CONFIG = {
  gameTime: 60, // Durée de la partie en secondes
  gravity: 0.5, // Force de gravité
  basketScore: 2, // Points par panier
  ballRadius: 15, // Taille du ballon
  basketWidth: 80, // Largeur des paniers
  basketHeight: 15, // Hauteur des paniers
};
```

## 🚀 Lancement

Aucune installation nécessaire ! Ouvrez simplement `index.html` dans votre navigateur préféré.

Bon jeu ! 🎉
