# AmadeusRelayServer
This is the Amadeus Relay API, which can be used by dApps who are interested in exchange ERC20 tokens.

Our API adheres to the [Standard Relayer API V0 Draft](https://github.com/0xProject/standard-relayer-api) as provided by the 0x team. 



Implantando na cloud:

gcloud container clusters get-credentials [cluster-name] -- zone [zone-name]
ex.: gcloud container clusters get-credentials cluster-3 -- zone europe-west1-b	

Baixar repositório
Entrar no diretório raiz do repositório
docker build -t amadeus_server .
docker tag amadeus_server eu.gcr.io/nimble-lead-184123/amadeus_server:v2

gcloud docker -- push eu.gcr.io/nimble-lead-184123/amadeus_server:v2

kubectl set image deployment/amadeus-srv amadeus-srv=eu.gcr.io/nimble-lead-184123/amadeus_server:v2



