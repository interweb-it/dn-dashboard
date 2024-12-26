# Decentralised Nodes Dashboard

This utility is a dashboard for monitoring validators participating in polkadot [decentralised nodes] (https://nodes.web3.foundation/rules).

- [online](https://dn.metaspan.io)

# Source

- [frontend](./frontend/README.md)
- [backend](./backend/README.md)


## deploy a new version

```bash

git pull
cd docker
docker compose build dnd-backend
docker compose up dnd-backend -d

docker compose build dnd-frontend
docker compose up dnd-frontend -d
```
