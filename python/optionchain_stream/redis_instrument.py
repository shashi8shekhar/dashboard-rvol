"""
@author: rakeshr
"""
"""
Dump all exchange instruments/contract data to Redis
Retrive strike and instrument token detail from redis for each symbol search
"""

# import redis
import json

class InstrumentDumpFetch():
    
    def __init__(self):
        # Default redis port connection
        # Port no and host be edited by user or will make both as acceptable argument in later release 
        self.conn = {}

    def set(self, key, val):
        # print('inside set', key, val, self.conn);
        self.conn[key] = val

    def get(self, key):
        # print('inside set', key, self.conn);
        if key in self.conn:
            return self.conn[key]
        else:
            return ''

    def data_dump(self, symbol, instrument_data):
        """
        Dump specific exchange complete instrument data
        Param symbol:(string) - Option contract symbol
        Param instrument_data:(dictionary) - List of dict for specific option contract containing all strike, etc 
        """
        # print(symbol, instrument_data, json.dumps(instrument_data))
        self.set(symbol, instrument_data)

    def symbol_data(self, symbol):    
        """
        Return instrument detail for required symbol
        Param symbol:(string) - Option contract symbol to be searched
        """
        try:
            contract_detail = self.get(symbol)
        except TypeError:
            raise Exception('Key not found - {}'.format(symbol))
        return contract_detail

    def fetch_token(self, token):
        """
        Fetch contract name for requested instrument token
        Param token:(integer) - Instrument token 
        """
        try:
            token_instrument = self.get(token)
        except Exception as e:
            raise Exception('Error {}'.format(e))
        return token_instrument

    def store_optiondata(self, tradingsymbol, token, optionData):
        """
        Store option chain data for requested symbol
        Param symbol:(string) - Option contract symbol
        Param token:(integer) - Instrument token
        Param optionData:(dict) - Complete data dump for specific option symbol
        """
        optionChainKey = '{}:{}'.format(tradingsymbol, token)
        try:
            self.set(optionChainKey, optionData)
        except Exception as e:
            raise Exception('Error - {}'.format(e))

    def fetch_option_data(self, tradingsymbol, token):
        """
        Fetch stored option data
        Param symbol:(string) - Option contract symbol
        Param token:(integer) - Instrument token
        """
        optionContractKey = '{}:{}'.format(tradingsymbol, token)
        try:
            token_data = self.get(optionContractKey)
        except Exception as e:
            raise Exception('Error - {}'.format(e))
        return token_data