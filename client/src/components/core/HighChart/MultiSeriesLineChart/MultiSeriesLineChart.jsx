/**
 * Created by shashi.sh on 08/05/21.
 */

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import _ from 'lodash';
import { calculatePercentage } from 'components/dashboard/utils';

Highcharts.setOptions({
    lang: {
        thousandsSep: ',',
    },
});

export function MultiSeriesLineChart({
    type = 'line',
    graphData,
    graphHeight = 300,
    dates,
    showLegends = true,
    legendObj = { align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100 },
    ...props
}) {
    return (
        <HighchartsReact
            highcharts={Highcharts }
            options={{
                title: undefined,
                yAxis: {
                    title: {
                        text: 'Real. vol.',
                    },
                    endOnTick: false,
                    startOnTick: false,
                    labels: {
                        format: true ? '{value}%' : '{value}',
                    },
                },
                xAxis: {
                    categories: _.get(graphData, ['data', 0, 'data'], []).map( (gd, idx) => {
                        return ('T-'+ (_.get(graphData, ['data', 0, 'data'], []).length - idx - 1) );
                    }),
                    title: {
                        text: 'T-10 Window',
                        style: {
                            fontSize: '12px',
                        },
                    },
                },
                chart: {
                    height: graphHeight,
                    type: 'line',
                },
                legend: {
                    enabled: true,
                },
                credits: {
                    enabled: false,
                },
                series: _.get(graphData, ['data'], []).map(gd => {
                    return {
                        name: gd.key ? gd.key: '',
                        data: gd.data.map(data => {
                            const t = calculatePercentage(data[gd.key], 1, 2, true);
                            return data[gd.key] * 100;
                        }),
                        marker: {
                            symbol: 'circle',
                        },
                        color: gd.color,
                    };
                }),
                responsive: {
                    rules: [
                        {
                            condition: {
                                maxWidth: 500,
                            },
                            chartOptions: {
                                legend: {
                                    layout: 'horizontal',
                                    align: 'center',
                                    verticalAlign: 'bottom',
                                },
                            },
                        },
                    ],
                },
                plotOptions: {
                    series: {
                        pointPlacement: 'on',
                    },
                },
            }}
        />
    );
}
