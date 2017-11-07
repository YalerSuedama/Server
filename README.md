# AmadeusRelayServer
This is the Amadeus Relay API, which can be used by dApps who are interested in exchange ERC20 tokens.

Our API adheres to the [Standard Relayer API V0 Draft](https://github.com/0xProject/standard-relayer-api) as provided by the 0x team. 

## For Developers

To start contributing to Amadeus Relay API, clone the git repo and type:
```
npm install
```

To build locally:
```
npm run build
```

### To run locally:

The command below will compile and start dev server:
```
npm run start:dev
```

If the code is open on Visual Studio Code, a debugger process can be attached by going to VS Code Debug View (fourth icon from top on the menu on the left) and click on the play icon.

It requires a local ethereum node to be running on `"http://" + process.env.ETHEREUM_NODE + ":8545"`.

All configuration resides on `./config/default.json`. On this file is possible to set all tradable tokens, set their trade prices, and change the main relayer wallet address.

### To run on cloud:

It is necessary to have Google Cloud Tools installed.

First, create a container:
```
gcloud container clusters get-credentials [cluster-name] -- zone [zone-name]
```

ex.: `gcloud container clusters get-credentials cluster-3 -- zone europe-west1-b`

After having this repository cloned, run these commands:
```
docker build -t amadeus_server .

docker tag amadeus_server eu.gcr.io/nimble-lead-184123/amadeus_server:v2

gcloud docker -- push eu.gcr.io/nimble-lead-184123/amadeus_server:v2

kubectl set image deployment/amadeus-srv amadeus-srv=eu.gcr.io/nimble-lead-184123/amadeus_server:v2
```
