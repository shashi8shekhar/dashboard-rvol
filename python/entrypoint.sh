#!/bin/bash

# Start the run once job.
echo "Docker container has been started"

declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /container.env

# Setup a cron schedule
echo "SHELL=/bin/sh
BASH_ENV=/container.env
* * * * * /app/cron_job.sh > /proc/1/fd/1 2>/proc/1/fd/2
#1,6,11,16,21,26,31,36,41,46,51,56 * * * 1-5 /app/cron_job.sh > /proc/1/fd/1 2>/proc/1/fd/2
# This extra line makes it a valid cron" > scheduler.txt

crontab scheduler.txt
cron -f