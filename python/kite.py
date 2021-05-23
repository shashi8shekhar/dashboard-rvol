print('kite')

from kiteconnect import KiteConnect

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from urllib.parse import urlparse, parse_qs

import constants
import time
import os

class Kite:
    def __init__(self):
        print('init kite')
        chrome_options = Options()
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--no-sandbox')
        #chrome_options.add_argument('--window-size=1420,1080')
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-dev-shm-usage')

        #chromedriver = "/usr/local/bin/chromedriver"
        #os.environ["webdriver.chrome.driver"] = chromedriver

        driver = webdriver.Chrome(options=chrome_options)
        driver.get(constants.url)

        waitTime = 1

        time.sleep(waitTime)
        user_id_elem = driver.find_element_by_xpath(constants.user_id_xpath)
        user_id_elem.send_keys(constants.userId)

        password_elem = driver.find_element_by_xpath(constants.password_xpath)
        password_elem.send_keys(constants.password)

        time.sleep(waitTime)
        submit_elem = driver.find_element_by_xpath(constants.submit_xpath)
        submit_elem.click()

        time.sleep(waitTime)
        pin_elem = driver.find_element_by_xpath(constants.pin_xpath)
        pin_elem.send_keys(constants.pin)

        time.sleep(waitTime)
        continue_elem = driver.find_element_by_xpath(constants.continue_xpath)
        continue_elem.click()

        time.sleep(waitTime)
        url = driver.current_url
        driver.close()

        # Parse the url here
        parsed_url = urlparse(url)
        x = parse_qs(parsed_url.query)

        # Initialize all the variables we need
        self.final_wait_time = waitTime * 6
        self.api_key = constants.apiKey
        self.request_token = x['request_token'][0]
        self.api_secret = constants.apiSecret

        self.kite = KiteConnect(api_key=self.api_key)

    def get_api_key(self):
        return self.api_key

    def get_request_token(self):
        time.sleep(self.final_wait_time)
        return self.request_token

    def get_api_secret(self):
        return self.api_secret

    def generate_session(self):
        return self.kite.generate_session(self.request_token, api_secret=self.api_secret)

    def set_access_token(self):
        data = self.generate_session()
        access_token = data["access_token"]
        self.kite.set_access_token(access_token)
        print('CONNECTED TO KITE')
        return self.kite

    def get_historical_data(self, instrument_token, from_date, to_date, interval):
        print('get_historical_data ', instrument_token, from_date, to_date, interval)
        return self.kite.historical_data(instrument_token, from_date, to_date, interval)

    def get_instruments(self, id):
        print('instruments ', id)
        return self.kite.instruments(id)

    def get_quote(self, contracts):
        # print('instruments ', id)
        return self.kite.quote(contracts)