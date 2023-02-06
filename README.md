# Take Trade
un projet nodejs avec une interface frontend ou on paramètres les infos du futur trade (timeframe, prix clible, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange)
puis un backend qui a chaque fois que l'on enregistre un futur trade lance un nouveau process qui surveille en temps réel le prix du coin et qui passe un ordre limite (avec possibilité de tp et sl ) seulement si :
      - pour un long le prix est au dessus du prix cible et que la bougie précédente du timeframe sélectionné a clôturer au dessus du prix cible
      - pour un short le prix est en dessous du prix cible et que la bougie précédente du timeframe sélectionné a clôturer en dessous du prix cible
sur l'interface on a la liste de tout les futur trade non encore effectué que l'on peu annulé

## Prerequisites

- Node.js
- npm

## Installation de base

1. se mettre dans le répertoire de base (/home/user par ex)
2. git clone https://github.com/telecom4all/place_trade.git
3. cd place_trade
4. npm install
   
## Configuration

1. modifier le fichier config.json vos clé et secret api et le port pour l'interface web (ici 3000)
   
   ```

    {
        "bitget": {
            "apiKey": "YOUR_API_KEY",
            "secret": "YOUR_SECRET",
            "password": "YOUR_PASSWORD",
            "options": {
                "defaultType": "swap"
            }
        },
        "binance": {
            "apiKey": "YOUR_API_KEY",
            "secret": "YOUR_SECRET"
        },
        "port_interface" : 3000
    }
      
   ```
2. Tester que tout fonctionne
   
   ```

    node app.js

   ```

   Ouvrir une page web a l'adress : `http://localhost:3000`  ou localhost est soit votre ip soit votre nom de domaine pour ouvrir l'interface.
   une fois que l'on a mis la pair que l'on veut trader quelque sec plus tard le prix apparait a coté de Current Price si on clique sur le prix le prix se met directement dans target price
   

## installation du démarage automatique et du monitoring

1. Installer PM2
   
   ```

   sudo npm install pm2 -g

   ```
2. rendre executable le fichier gestion_app_node.sh
   
   ```

   sudo chmod +x gestion_app_node.sh

   ```
   
3. installer le node dans le system
   
   ```

   ./gestion_app_node.sh install app.js <nom_sans_espace_du_node>

   ```
   
4. monitorer le node
   
   ```

   ./gestion_app_node.sh manage <nom_sans_espace_du_node>

   ```

   un menu s'affiche 

   ```

   Please choose an action for take_trade:
   1. Start in background                   --> lance le node en background pour que meme si on coupe le terminal il continue a tourner
   2. Monitor                               --> Permet de voir les log du node
   3. List all processes                    --> list les différent app installé mais normalement il n'y en aura qu'un pour ce projet en tout cas
   4. Save processes                        --> sauve la configuration pour pm2. A faire si un message apparait comme quoi l'etat n'est pas sauvegardé
   5. Restart all processes                 --> Redemare toute les applications (pour ce projet juste celle ci)
   6. delete processe                       --> Supprime l'app du system
   7. Quit                                  --> quittez le menu et revenir au terminal (le node luit continue a tourner)
   Enter your choice [1-7]: 

   ```
   
# Soutien
Ce code est disponible pour tous si vous voulez me "soutenir :-)" voici un lien d'affiliation Bitget : https://partner.bitget.com/bg/85MZE2

ou en cryptos :
- BTC --> 1CetuWt9PuppZ338MzBzQZSvtMW3NnpjMr
- ETH (Réseau ERC20) --> 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236
- MATIC (Réseau Polygon) --> 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236
- BNB (Réseau BSC BEP20) --> 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236
- SOL --> AsLvBCG1fpmpaueTYBmU5JN5QKVkt9a1dLR44BAGUZbV

# Remerciements
Merci à titouannwtt pour son code duquel je me suis grandement inspiré !! si vous voulez le soutenir c'est par là -->

https://github.com/titouannwtt/bot-trading-advanced







