print('instruments List')
import engine
import configDetails
import pandas as pd

nan_value = 0


class InstrumentList:
    def updateInstrumentsList(self, kiteObj, configurationObj):
        contractToken = {}
        engineObj = engine.Engine.getInstance().getEngine()
        instruments = kiteObj.get_instruments('NFO')

        for config in configurationObj:
            tradingsymbol = config['tradingsymbol']
            instrument_token = config['instrument_token']
            instrumentsTableKey = 'instruments-' + str(instrument_token)

            contractToken[instrument_token] = []

            for contract in instruments:
                if contract['name'] == tradingsymbol:
                    contractToken[instrument_token].append({'strike': contract['strike'],
                                                            'symbol': contract['tradingsymbol'],
                                                            'type': contract['instrument_type'],
                                                            'expiry': str(contract['expiry']),
                                                            'token': contract['instrument_token']})

            variables = list(contractToken[instrument_token][0].keys())
            df = pd.DataFrame([[i[j] for j in variables] for i in contractToken[instrument_token]], columns=variables)
            print(df.head())

            try:
                print('updateInstrumentsList inside try', config['tradingsymbol'])
                df.to_sql(instrumentsTableKey, con=engineObj, if_exists='replace', index=False)
            except ValueError as e:
                # print(e)
                return e

    def runFullUpdate(self, kiteObj):
        configDetailsObj = configDetails.ConfigDetails.getInstance()
        configurationObjData = configDetailsObj.getConfig()

        self.updateInstrumentsList(kiteObj, configurationObjData)
