from kiteconnect import KiteConnect

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from urllib.parse import urlparse, parse_qs

import dataPipeline.login.constants
import time

constants = dataPipeline.login.constants

chrome_options = Options()
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--window-size=1420,1080')
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=chrome_options)
driver.get(constants.url)

time.sleep(2)
user_id_elem = driver.find_element_by_xpath(constants.user_id_xpath)
user_id_elem.send_keys(constants.userId)

password_elem = driver.find_element_by_xpath(constants.password_xpath)
password_elem.send_keys(constants.password)

time.sleep(2)
submit_elem = driver.find_element_by_xpath(constants.submit_xpath)
submit_elem.click()

time.sleep(2)
pin_elem = driver.find_element_by_xpath(constants.pin_xpath)
pin_elem.send_keys(constants.pin)

time.sleep(2)
continue_elem = driver.find_element_by_xpath(constants.continue_xpath)
continue_elem.click()

time.sleep(2)
url = driver.current_url
driver.close()

# Parse the url here
parsed_url = urlparse(url)
x = parse_qs(parsed_url.query)

# Initialize all the variables we need
api_key = "kejb8tewdr6kk1bn"
request_token = x['request_token'][0]
api_secret="fdcl73by8psacinfxszkfhanv7t9ogb7"

kite = KiteConnect(api_key=api_key)

data = kite.generate_session(request_token, api_secret=api_secret)
access_token = data["access_token"]
kite.set_access_token(access_token)
print('CONNECTED TO KITE')
