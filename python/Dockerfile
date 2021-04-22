FROM python:3.8
ENV PATH /usr/local/bin:$PATH

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt


# install google chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get -y update
RUN apt-get install -y google-chrome-stable

# install chromedriver
RUN apt-get install -yqq unzip
RUN wget -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE`/chromedriver_linux64.zip
RUN unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/

# set display port to avoid crash
ENV DISPLAY=:0

# upgrade pip
#RUN pip install --upgrade pip

# install selenium
RUN pip3 install selenium

COPY . .

RUN apt-get update && apt-get -y install cron vim
#COPY crontab /etc/cron.d/crontab
#RUN chmod 0644 /etc/cron.d/crontab
#RUN /usr/bin/crontab /etc/cron.d/crontab

COPY cron_job.sh /app/cron_job.sh
RUN ["chmod", "+x", "/app/cron_job.sh"]

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT /entrypoint.sh

# run crond as main process of container
#CMD ["cron", "-f"]

#CMD ["sh","-c", "cron -f && python3 api.py"]

#CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
