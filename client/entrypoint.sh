#!/bin/bash

rsync -arv /build-dir/node_modules/ /usr/src/app/

exec npm start