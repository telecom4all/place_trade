const ccxt = require('ccxt');
const winston = require("winston");
const fs = require('fs');
const path = require('path');

const configFile = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

const bitget = new ccxt.bitget({
  apiKey: config.bitget.apiKey,
  secret: config.bitget.secret,
  password: config.bitget.password,
  options: {
    defaultType: 'swap'
  }
});

const binance = new ccxt.binance({
  apiKey: config.binance.apiKey,
  secret: config.binance.secret
});


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

async function getBalance(currentExchange){
    
  try {
      balance = await currentExchange.fetchBalance();
      let usdEquity = balance.info[0].usdtEquity;
      return {status : "True", message : usdEquity}
  } catch (error) {
      return {status : "False", message : error}
  } 
}



async function loadMarkets(currentExchange) {
  try {
      let market = await currentExchange.loadMarkets();
      return({status : "True", message : 'Markets loaded successfully'});
  } catch (error) {
      return({status : "False", message : 'Error loading markets:', error});
     
  }
}


async function placeTrade(currentPrice, timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange) {
  let pair_process = pair;
  pair = pair+":USDT";

  console.log(" timeframe: " + timeframe)
  console.log(" price: " + price)
  console.log(" position: " + position)
  console.log(" amount: " + amount)
  console.log(" tp_percentage: " + tp_percentage)
  console.log(" tp_amount: " + tp_amount)
  console.log(" sl_percentage: " + sl_percentage)
  console.log(" tp_switch: " + tp_switch)
  console.log(" sl_switch: " + sl_switch)
  console.log(" pair: " + pair)
  let currentExchange;
  if (exchange === "bitget") {
      currentExchange = bitget;
  } else if (exchange === "binance") {
      currentExchange = binance;
  } else {
      logger.error("Invalid exchange provided.");
      return;
  }

  var isMarketLoaded = await loadMarkets(currentExchange)
  if(isMarketLoaded.status == "True"){
      logger.info(isMarketLoaded.message)
  }
  else{
      logger.error(isMarketLoaded.message);
  }

  var balance = await getBalance(currentExchange)
  if(balance.status == "True"){
      logger.info(balance.message)
  }
  else{
      logger.error(balance.message);
  }  

  let side;
  let targetPrice;
  let quantity;
  try {

      quantity = currentExchange.amount_to_precision(pair, amount / price);
      targetPrice = currentExchange.price_to_precision(pair, price)
    
      if(position === 'long'){
          side = "buy";
      }
      else if(position === 'short'){
          side ="sell";
      }
      
  } catch (error) {
      logger.error(error);
  }
  

  try {
      logger.info(`pair: ${pair} side: ${side} quantity: ${quantity} targetPrice: ${targetPrice}`);
      let trade = await currentExchange.createOrder(pair, 'market', side, quantity, targetPrice); 
      logger.info(`Trade effectué avec succès :`);
      logger.info(trade);

      if(tp_switch) {
          let tpPrice;
          if(position === 'long'){
              tpPrice =  parseFloat(currentPrice) + (parseFloat(tp_percentage) * parseFloat(currentPrice));
          }
          else if(position === 'short'){
              tpPrice = parseFloat(currentPrice )- (parseFloat(tp_percentage) * parseFloat(currentPrice));
          }   
          
          tpPrice = currentExchange.price_to_precision(pair, tpPrice)

          let quantity_tp = currentExchange.amount_to_precision(pair, tp_amount / tpPrice);
          

          try {
              
              const takeProfit = await currentExchange.createOrder(pair, 'market', side, quantity_tp, tpPrice, {'takeProfitPrice': tpPrice});
              logger.info(`Takeprofit effectué avec succès : ${takeProfit}`);
          } catch (error_tp) {
              logger.error(`Erreur lors du placement du takeprofit : ${error_tp}`);
          }

          
      }

      if(sl_switch) {
          let slPrice;
          if(position === 'long'){
              slPrice = parseFloat(currentPrice) - (parseFloat(sl_percentage) * parseFloat(currentPrice));
          }
          else if(position === 'short'){
              slPrice = parseFloat(currentPrice)+ (parseFloat(sl_percentage) * parseFloat(currentPrice));
          }

          slPrice = currentExchange.price_to_precision(pair, slPrice)
          let quantity_sl = currentExchange.amount_to_precision(pair, amount / slPrice);

          try {
              

              const stopLoss = await currentExchange.createOrder(pair, 'market', side, quantity, slPrice, {'stopLossPrice': slPrice });
              logger.info(`StopLoss effectué avec succès : ${stopLoss}`);
          } catch (error_sl) {
              logger.error(`Erreur lors du placement du stoploss : ${error_sl}`);
          }
          
      }


  } catch (error) {
      //logger.error(error);
      logger.error(`Erreur lors du placement du trade/takeprofit/stoploss : ${error}`);
      
  }

  delete_pid(timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair_process, exchange)
}


async function delete_pid(timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange){
  
  fs.readFile('trades.json', (err, data) => {
    if (err) throw err;
    const processes = JSON.parse(data);
    //console.dir(processes);

    const processKeys = Object.keys(processes);
    for (const pid of processKeys) {
      const process = processes[pid];
      /*
      console.log(process.timeframe + " : " + timeframe)
      console.log(process.price + " : " + price)
      console.log(process.position + " : " + position)
      console.log(process.amount + " : " + amount)
      console.log(process.tp_percentage + " : " + tp_percentage)
      console.log(process.tp_amount + " : " + tp_amount)
      console.log(process.sl_percentage + " : " + sl_percentage)
      console.log(process.tp_switch + " : " + tp_switch)
      console.log(process.sl_switch + " : " + sl_switch)
      console.log(process.pair + " : " + pair)
      */
      if (process.timeframe == timeframe &&
        process.price == price &&
        process.position == position &&
        process.amount == amount &&
        process.tp_percentage == tp_percentage &&
        process.tp_amount == tp_amount &&
        process.sl_percentage == sl_percentage &&
        process.pair == pair) {
          //console.log("********************ok************************")
          delete processes[pid];
          break;
        }
    }

    fs.writeFile('trades.json', JSON.stringify(processes), (err) => {
      if (err) throw err;
      console.log('Process deleted successfully.');
    });
  });
}

async function monitor_price(timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange) {
  
  // Vérification de l'exchange sélectionné
  if (exchange == "bitget") {
    // Boucle infinie pour surveiller le prix en temps réel
    while (true) {
      // Récupération du dernier prix du ticker
      const ticker = await bitget.fetchTicker(pair + ":USDT");
      const currentPrice = ticker.last;
      console.log(currentPrice)

      try {
        // Récupération des données OHLCV pour le timeframe sélectionné
        const candle = await bitget.fetchOHLCV(pair, timeframe, undefined, undefined,{ candleInterval: timeframe });
       // fetch_ohlcv(coin_pair, timeframe,limit=1000)
        //console.log(candle)
        // Récupération de la dernière bougie
        const lastCandle = candle[candle.length - 1];
        console.log("***********lastCandle******************")
        console.log(lastCandle)

        // Récupération de la bougie précédente
        const prevCandle = candle[candle.length - 2];
        console.log("***********lastCandle******************")
        console.log(prevCandle);

        console.log("***********all******************")
        console.log("currentPrice:" + currentPrice + " askprice:" + price + " prevCandle[4]:" + prevCandle[4]);


        // Vérification si le prix actuel est supérieur ou inférieur (en fonction de la position) au prix cible
        // Et si la dernière bougie s'est clôturée au-dessus ou en dessous (en fonction de la position) du prix cible
        // Et si la bougie précédente s'est clôturée au-dessus ou en dessous (en fonction de la position) du prix cible
        if (
          (position === "long" && currentPrice >= price && lastCandle[4] >= price && prevCandle[4] <= price) ||
          (position === "short" && currentPrice <= price && lastCandle[4] <= price && prevCandle[4] >= price)
        ) {
          try {
            // Appel de la fonction placeTrade si les conditions ci-dessus sont remplies
            placeTrade(
              currentPrice,
              timeframe,
              price,
              position,
              amount,
              tp_percentage,
              tp_amount,
              sl_percentage,
              tp_switch,
              sl_switch,
              pair,
              exchange
            );
          } catch (err) {
            // En cas d'erreur lors du placement du trade/takeprofit/stoploss, affichage d'un message d'erreur
            logger.error(`Erreur lors du placement du trade/takeprofit/stoploss : ${err}`);
          }
          // Fin de la boucle infinie
          break;
        }
      } catch (err) {
        // En cas d'erreur lors de la récupération des données OHLCV, affichage d'un message d'erreur
        logger.error(`Erreur lors de la récupération des données OHLCV : ${err}`);
      }
      // Temporisation de 5 secondes avant la prochaine itération de la boucle
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
}

monitor_price(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7], process.argv[8], process.argv[9], process.argv[10], process.argv[11], process.argv[12]);