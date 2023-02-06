const os = require('os');
const ccxt = require('ccxt');
const express = require('express')
const bodyParser = require('body-parser')
const { fork } = require('child_process');
const ps = require('ps-node');
const fs = require('fs');
const app = express()


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



const timeframes=["1m","5m","1d","1h","4h"]

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.send(`
    <html>
    <head>
    <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <body>
    <h1>Trading Bot</h1>
    <div id="main">
        <div id="list_process" class="list-process"><h3>List Process</h3></div>



        <div id="form" class="form">
            <div>
                <label for="currentPrice">Current Price: <span id="currentPrice" onclick="put_price_on_pair(this.innerText)"></span> USDT</label>
                
            </div>
      
            <div class="form-grid">
                <div>
                    <label for="pair">Pair:</label>
                    <input type="text" id="pair" name="pair"  placeholder="BTC/USDT" onchange="get_price()"><br>
                </div>
                <div>
                    <label for="exchange">Exchange:</label>
                    <select id="exchange" name="exchange">
                    <option value="bitget">Bitget</option>
                    <option value="binance">Binance</option>
                    </select><br>

                </div>
                <div>
                    <label for="timeframe">Timeframe:</label>
                    <select id="timeframe" name="timeframe">
                    ${timeframes.map(timeframe => `<option value="${timeframe}">${timeframe}</option>`).join('')}
                    </select><br>

                    <label for="price">Target Price:</label>
                    <input type="text" id="price" name="price"><br>
                </div>
                <div>
                    <label for="position">Position:</label>
                    <select id="position" name="position">
                        <option value="long">Long</option>
                        <option value="short">Short</option>
                    </select><br>
                    <label for="amount">Amount (USD):</label>
                    <input type="text" id="amount" name="amount"><br>
                </div>
                <div>
                    <label for="tp_switch">Take Profit :</label>
                    <input type="checkbox" id="tp_switch" name="tp_switch"  >
                    
                
                    <label for="tp">Take Profit ( <span id="tpValue">10%</span>):</label>
                    <input type="range" min="0" max="2" step="0.01" id="tp" name="tp_percentage" value="0.1">
                    <span id="tpPercentage"></span>%<br>
                
                    <label for="tp_amount">Take Profit Amount (USD):</label>
                    <input type="text" id="tp_amount" name="tp_amount">
                </div>
                <div>
                    <label for="sl_switch">Stop Loss :</label>
                    <input type="checkbox" id="sl_switch" name="sl_switch">
                    
                    <label for="sl">Stop Loss ( <span id="slValue">10%</span>):</label>
                    <input type="range" min="0" max="2" step="0.01" id="sl" name="sl_percentage" value="0.1">
                    <span id="slPercentage"></span>%<br>
                    
                </div>
            </div>
            <input type="button" value="Submit" class="submit-button" onclick="send_trade()">
        </div>


    </div>
    <script>
    // Select the elements
    const tpSlider = document.getElementById('tp');
    const slSlider = document.getElementById('sl');
    const tpValue = document.getElementById('tpValue');
    const tpPercentage = document.getElementById('tpPercentage');
    const tpAmount = document.getElementById('tp_amount');
    
    const slValue = document.getElementById('slValue');
    const slPercentage = document.getElementById('slPercentage');
    const slAmount = document.getElementById('sl_amount');

    // Add event listeners
    tpSlider.addEventListener('input', function() {
      tpValue.textContent = (this.value*100).toFixed(2) + '%';
      tpPercentage.textContent = (this.value*100).toFixed(2);
    });
    slSlider.addEventListener('input', function() {
      slValue.textContent = (this.value*100).toFixed(2) + '%';
      slPercentage.textContent = (this.value*100).toFixed(2);
    });
   
   
    function send_trade() {
        var timeframe = document.getElementById("timeframe").value;
        var exchange = document.getElementById("exchange").value;
        var price = document.getElementById("price").value;
        var position = document.getElementById("position").value;
        var amount = document.getElementById("amount").value;
        var tp_switch = document.getElementById("tp_switch").checked;
        var tp_percentage = document.getElementById("tp").value;
        var tp_amount = document.getElementById("tp_amount").value;
        var sl_switch = document.getElementById("sl_switch").checked;
        var sl_percentage = document.getElementById("sl").value;
        var pair = document.getElementById("pair").value.toUpperCase();

        // check if required variables are empty or non-existent
        if (!price || !amount || !pair) {
            alert("One of the required variables (price, amount, pair) is empty or non-existent.");
            return; // exit the function
        }

        // check if tp_switch is true and tp_amount,tp_percentage is empty or non-existent
        if (tp_switch !== false) {
            if (!tp_amount || !tp_percentage) {
                alert("tp_amount or tp_percentage is empty or non-existent while tp_switch is true.");
                return; // exit the function
            }
        }

        // check if sl_switch is true and sl_amount, sl_percentage is empty or non-existent
        if (sl_switch !== false) {
            if ( !sl_percentage) {
                alert("sl_amount or sl_percentage is empty or non-existent while sl_switch is true.");
                return; // exit the function
            }
        }

        if(tp_switch != true){
            tp_switch = "None";
        }
        

        if(sl_switch != true){
            sl_switch = "None";
        }
        

        const data = {
            timeframe: timeframe,
            price: price,
            position: position,
            amount: amount,
            tp_switch: tp_switch,
            tp_percentage: tp_percentage,
            tp_amount: tp_amount,
            sl_switch: sl_switch,
            sl_percentage: sl_percentage,
            pair : pair,
            exchange : exchange

        };

        fetch("/trade", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(result => {
                const data = {
            
                };
                fetch("/processes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.text())
                    .then(result => {
                        affichage_list_process(result);
                    })
                    .catch(error => console.log("error", error));
            })
            .catch(error => console.log("error", error));

    }

    setInterval(function() {
        const data = {
            
        };
        fetch("/processes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(result => {
                affichage_list_process(result);
            })
            .catch(error => console.log("error", error));

            get_price();
    }, 5000);


    window.addEventListener("load",function(){
        const data = {
            
        };
        fetch("/processes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(result => {
                affichage_list_process(result);
            })
            .catch(error => console.log("error", error));
    });

    function affichage_list_process(data){
        const div = document.getElementById("list_process");
        div.innerHTML = "";
        const titre = document.createElement('h3');
        titre.text = 'List Process';

        const list = document.createElement('ul');
        const jsonObject = JSON.parse(data);
        
       
        Object.entries(jsonObject).forEach(([key, value]) => {
            
            const item = document.createElement('li');
            var html_tableau = "<table>";
                html_tableau += "<tr>";
                    html_tableau += "<td>";
                        html_tableau += "pid : " + value.processInfo.pid   
                    html_tableau += "</td>";
                    html_tableau += "<td>";
                        html_tableau += "Pair : " + value.pair   
                    html_tableau += "</td>";
                    html_tableau += "<td>";
                        html_tableau += "amount : " + value.amount + " $"
                    html_tableau += "</td>";
                html_tableau += "</tr>";

                html_tableau += "<tr>";
                    html_tableau += "<td>";
                        html_tableau += "Type : " + value.position   
                    html_tableau += "</td>";
                    html_tableau += "<td>";
                        html_tableau += "Tigger Price : " + value.price   
                    html_tableau += "</td>";
                    html_tableau += "<td>";
                        html_tableau += "timeframe : " + value.timeframe   
                    html_tableau += "</td>";
                html_tableau += "</tr>";

                html_tableau += "<tr>";
                    html_tableau += "<td>";
                        html_tableau += '<input type="button" value="Infos" class="infos-button" onclick="infos_process('+value.processInfo.pid+')">'  
                    html_tableau += "</td>";
                    html_tableau += "<td>";
                           
                    html_tableau += "</td>";
                    html_tableau += "<td>";
                        html_tableau += '<input type="button" value="Delete" class="delete-button" onclick="delete_process('+value.processInfo.pid+')">'
                    html_tableau += "</td>";
                html_tableau += "</tr>";
              
                    
            html_tableau += "</table>";
            item.innerHTML = html_tableau
            
            
            list.appendChild(item);
        });
       
        titre.appendChild(list);
        document.getElementById('list_process').appendChild(titre);
    }


    function infos_process(pid){
        const data = {
            pid: pid
           
        };
        fetch("/processe_infos" , {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(result => {
                const jsonObject = JSON.parse(result);
                
                if(jsonObject.status == false){
                    alert("Erreur : " + jsonObject.message)
                }
                else{
                    alert("process : " + jsonObject.pid + " always active")
                }
                
                
            })
            .catch(error => alert("error : " +  error + " delete the process and re create it"));
    }

    function delete_process(pid){ 
        const data = {
            pid: pid
           
        };
        fetch("/processe_delete" , {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(result => {
                const data = {
            
                };
                fetch("/processes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.text())
                    .then(result => {
                        affichage_list_process(result);
                    })
                    .catch(error => console.log("error", error));
            })
            .catch(error => console.log("error", error));
    }


    function get_price(){
        var pair = document.getElementById('pair').value;
        var exchange = document.getElementById("exchange").value;

        if (pair && pair.length > 0) {
            pair = pair.toUpperCase();

            const data = {
                pair: pair,
                exchange: exchange
               
            };
    
            fetch("/get_price", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(response => response.text())
            .then(result => {
                const jsonObject = JSON.parse(result);
                
                if(jsonObject.status == false){
                    alert("Erreur : " + jsonObject.message)
                }
                else{
                    document.getElementById('currentPrice').innerHTML = jsonObject.message;
                    
                }
    
    
            })
            .catch(error => console.log("error", error));

            

        } 
        
       
    }

    function put_price_on_pair(price){
       
        document.getElementById('price').value = price;
    }

/*
    async function updatePrice() {
        const pair = document.getElementById('pair').value;
        const ticker = await bitget.fetchTicker(pair + ":USDT");
        const currentPrice = ticker.last;
        document.getElementById('currentPrice').innerHTML = currentPrice;
      }
    
      document.getElementById('pair').addEventListener('change', updatePrice);

*/

    </script>
</body>
</html> `)
})

app.post('/trade', (req, res) => {
    let child;
    const { timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair, exchange } = req.body

    // Lancer la fonction monitor_price dans un nouveau processus
    child = fork('./monitor_price.js', [timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair , exchange]);

    try {
        // Récupérer les informations du processus
        ps.lookup({ pid: child.pid }, function(err, resultList ) {
            if (err) {
                console.log("Erreur:", err);
                res.send({ status: false, message: err });
                return;
            }
            if(resultList.length === 0){
                console.log("Erreur: Le processus avec PID", child.pid, "n'a pas été trouvé.");
                res.send({ status: false, message: `Erreur: Le processus avec PID ${child.pid} n'a pas été trouvé.` });
                return;
            }
            let processInfo = resultList[0];
            console.log(`PID: ${processInfo.pid}`);
            console.log(`Titre: ${processInfo.command}`);
            console.log(`Utilisation de la mémoire: ${processInfo.pmem}`);
            console.log(`Temps d'activité: ${processInfo.elapsed}`);
            // Mettre à jour le fichier JSON
            var update_file_process = update_json_file(processInfo, timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair )
            res.send({status: true, update_file_process});
        });
    } catch (err) {
        res.send({status: false, message: err.message});
    }
});


app.post('/processes', (req, res) => {
    
    fs.readFile('trades.json', (err, data) => {
        if (err) throw err;
        const processes = JSON.parse(data);
        res.send(processes);
    });
    
});


app.post('/get_price', (req, res) => {
    try {
      const { pair, exchange } = req.body
      
      if(exchange == "bitget"){
        bitget.fetchTicker(pair + ":USDT")
        .then(ticker => {
          const currentPrice = ticker.last
          res.send({ status: true, message: currentPrice });
        })
        .catch(err => {
          res.send({ status: false, message: err.message });
        });
      }

      
      
    } catch (err) {
      res.send({ status: false, message: err.message });
    }
  });

app.post('/processe_infos', (req, res) => {
    const { pid } = req.body
    ps.lookup({ pid: pid }, function(err, resultList ) {
        if (err) {
            console.log("Error:", err);
            res.send({ status: false, message: err });
            return;
        }
        if(resultList.length === 0){
            console.log("Error: Process with PID", pid, "not found.");
            res.send({ status: false, message: `Error: Process with PID ${pid} not found.` });
            return;
        }
        let processInfo = resultList[0];
        console.log(`PID: ${processInfo.pid}`);
        console.log(`Title: ${processInfo.command}`);
        console.log(`Memory usage: ${processInfo.pmem}`);
        console.log(`Uptime: ${processInfo.elapsed}`);
        res.send(processInfo);
    });
    
    
});



app.post('/processe_delete', (req, res) => {
    const { pid } = req.body
    fs.readFile('trades.json', (err, data) => {
        if (err) {
            res.send(`Error reading file trades.json: ${err}`);
            return;
        }
        let processes = JSON.parse(data);
        if (!(pid in processes)) {
            res.send(`Process ${pid} not found in trades.json`);
            return;
        }
        try {
            process.kill(pid);
        } catch (err) {
            console.log(`Error stopping process ${pid}: ${err}`);
        }
        delete processes[pid];
        fs.writeFile('trades.json', JSON.stringify(processes), (err) => {
            if (err) {
                res.send(`Error updating file trades.json: ${err}`);
                return;
            }
            res.send(`Process ${pid} stopped and removed from trades.json.`);
        });
    });
});


function update_json_file(processInfo, timeframe, price, position, amount, tp_percentage, tp_amount, sl_percentage, tp_switch, sl_switch, pair ){
    try {
        let data = {};
        // read existing json file
        if (fs.existsSync('trades.json')) {
            data = JSON.parse(fs.readFileSync('trades.json', 'utf8'));
        }
        // add new data to json object
        data[processInfo.pid] = {
            processInfo,
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
            date: new Date()
        };
        // write json object to file
        fs.writeFileSync('trades.json', JSON.stringify(data, null, 4));
        return data;
    } catch (err) {
        return err.message
    }
}


function getProcessInfo(pid) {
    ps.lookup({ pid: pid }, function(err, resultList ) {
        if (err) {
            console.log("Error:", err);
            res.send({ status: false, message: err });
            return;
        }
        if(resultList.length === 0){
            console.log("Error: Process with PID", pid, "not found.");
            res.send({ status: false, message: `Error: Process with PID ${pid} not found.` });
            return;
        }
        let processInfo = resultList[0];
        console.log(`PID: ${processInfo.pid}`);
        console.log(`Title: ${processInfo.command}`);
        console.log(`Memory usage: ${processInfo.pmem}`);
        console.log(`Uptime: ${processInfo.elapsed}`);
        return processInfo ;
    });
}

function stopProcess(pid) {
    try {
        process.kill(pid);
        console.log(`Process ${pid} stopped.`);
    } catch (err) {
        console.log(`Error stopping process ${pid}: ${err}`);
    }
}

app.listen(config.port_interface, () => console.log('Server running on port ' + config.port_interface))