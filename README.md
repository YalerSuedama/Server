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

Accessing your Goggle Cloud Paltaform Console.

#### Create a cluster (if you don't have one)
* Go to: Kubernetes Engine > Kubernetes cluster
* Create cluster:
Choose a name (amadeus-server) /
Choose a zone (europe-west-1b) /
Choose a machine (1 vCPU, 2 Gb) /
Choose cluster size (2)

#### Activate the Google Cloud Shell
* Click the icon ">_" on the top right
* A console will be opened

#### Get credentials to access the cluster
```
gcloud container clusters get-credentials amadeus-server --zone europe-west1-b
```

#### Clone the repository and checkout the specific branch (if necessary)
```
git clone https://github.com/AmadeusRelay/AmadeusRelayServer.git
cd AmadeusRelayServer
git checkout [branch_name]
```

#### Configure the ETH account
* Go to config folder
* Edit the default.json file
```
vim default.json
```
** Press Insert, to enter in insert mode
** Replace the wallet and privateKey values
** To save the changes, press ESC, write ":wq" and press Enter

#### Build the container
* Return to repository root folder
* Run build command
```
docker build -t amadeus-relay-server .
```

#### Create a tag container
```
docker tag amadeus-relay-server eu.gcr.io/amadeusrelay/amadeus-relay-server:v1
```
* "amadeusrelay" is the project name
* the project name must be lower case

#### Push the container to the Google Cloud docker repository
```
gcloud docker -- push eu.gcr.io/amadeusrelay/amadeus-relay-server:v1
```

#### Run the application on cloud
```
kubectl run amadeus-relay-server --image=eu.gcr.io/amadeusrelay/amadeus-relay-server:v1 --port 3000
```

#### Expose to Internet
```
kubectl expose deployment amadeus-relay-server --type=LoadBalancer --port 80 --target-port 3000
```

#### Scale up your application
```
kubectl scale deployment amadeus-relay-server --replicas=2
```

It's ready !!!

If you want update, you must build a new version and push to repository. Remenber updating the version. Finnaly, set the new version.
```
kubectl set image deployment/amadeus-relay-server amadeus-relay-server=eu.gcr.io/amadeusrelay/amadeus-relay-server:v2
```
