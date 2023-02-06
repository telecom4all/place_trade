# Take Trade
un projet nodejs avec une interface frontend ou on paramètres les infos du futur trade (timeframe, prix clible, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange)
puis un backend qui a chaque fois que l'on enregistre un futur trade lance un nouveau process qui surveille en temps réel le prix du coin et qui passe un ordre limite (avec possibilité de tp et sl ) seulement si :
      - pour un long le prix est au dessus du prix cible et que la bougie précédente du timeframe sélectionné a clôturer au dessus du prix cible
      - pour un short le prix est en dessous du prix cible et que la bougie précédente du timeframe sélectionné a clôturer en dessous du prix cible
sur l'interface on a la liste de tout les futur trade non encore effectué que l'on peu annulé

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository to your local machine
