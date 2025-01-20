# build

## edit .env files

../backend/.env
../frontend/.env

## build containers
```bash

docker compose build #--no-cache
```

# run

```bash
docker compose down && docker compose up -d
```

## force

```bash
docker compose down dnd-backend
docker image rm dn-dashboard-backend
docker compose build dnd-backend
docker compose up -d dnd-backend --force-recreate
```
