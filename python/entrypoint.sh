#!/bin/bash

# Start the run once job.
echo "Docker container has been started"

declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /container.env

# Setup a cron schedule
echo "SHELL=/bin/sh
BASH_ENV=/container.env
#1,15,30,45 * * * * /app/cron_job.sh > /proc/1/fd/1 2>/proc/1/fd/2
0,5,10,15,20,25,30,35,40,45,50,55 3-10 * * 1-5 /app/cron_job.sh > /proc/1/fd/1 2>/proc/1/fd/2
30 3 * * 1-5 /app/cron_job_1.sh > /proc/1/fd/1 2>/proc/1/fd/2
59 9 * * 1-5 /app/cron_job.sh > /proc/1/fd/1 2>/proc/1/fd/2
# This extra line makes it a valid cron" > scheduler.txt

crontab scheduler.txt
cron -f
