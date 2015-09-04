#!/bin/bash
set -m

USER=${MONGODB_USER}
PASS=${MONGODB_PASS}
DATABASE=${MONGODB_DATABASE}

mongod --httpinterface --rest --master --auth &

RET=1
while [[ RET -ne 0 ]]; do
    echo "=> Waiting for confirmation of MongoDB service startup"
    sleep 5
    mongo admin --eval "help" >/dev/null 2>&1
    RET=$?
done

mongo $DATABASE --eval "db.createUser({user: '$USER', pwd: '$PASS', roles:[{role:'dbAdmin',db:'$DATABASE'}]});"

fg