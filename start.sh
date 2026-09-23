#!/usr/bin/env bash
# Starts the whole app (db, backend, frontend, pgAdmin) and waits until it answers.
#   ./start.sh            build + start, seed demo users on first run
#   ./start.sh --no-seed  start without demo users
#   ./start.sh --reset    wipe the database first, then start fresh (re-seeds)
#   ./start.sh --stop     stop everything (data is kept)
#   ./start.sh --logs     follow backend logs
set -euo pipefail
cd "$(dirname "$0")"

if docker compose version >/dev/null 2>&1; then DC="docker compose"; else DC="docker-compose"; fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker isn't running. Open Docker Desktop, wait for it to start, then run ./start.sh again."
  exit 1
fi

case "${1:-}" in
  --stop) $DC down; exit 0 ;;
  --logs) $DC logs -f backend; exit 0 ;;
  --reset)
    read -r -p "This deletes all users, matches and messages. Continue? [y/N] " ok
    [[ "$ok" == "y" || "$ok" == "Y" ]] || exit 1
    $DC down -v ;;
  --no-seed) export SPRING_PROFILES_ACTIVE=default ;;
  "") ;;
  *) echo "Unknown option: $1 (use --no-seed, --reset, --stop or --logs)"; exit 1 ;;
esac

$DC up -d --build

wait_for() { # name url seconds
  printf "Waiting for %s" "$1"
  for _ in $(seq 1 "$3"); do
    if curl -s -o /dev/null "$2"; then echo " ready"; return 0; fi
    printf "."; sleep 2
  done
  echo " still not up. Check: $DC logs $4"; return 1
}
# the backend downloads Maven deps and compiles on first start, this can take a few minutes
wait_for backend http://localhost:3001 150 backend || true
wait_for frontend http://localhost:5173 60 frontend || true

cat <<MSG

  App       http://localhost:5173
  pgAdmin   http://localhost:5050   admin@matchme.com / adminho   (db password: matchme-password)

  Demo login: kaja@demo.ee / demo1234   (has matches, chats and requests)
  Others:     henrik@ maie@ mart@ anne@ toomas@ viktor@ peeter@ helgi@ annekristiina@demo.ee, same password

  Stop: ./start.sh --stop    Logs: ./start.sh --logs
MSG
