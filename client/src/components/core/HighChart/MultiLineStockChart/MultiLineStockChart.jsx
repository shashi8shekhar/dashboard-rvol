/**
 * Created by shashi.sh on 23/05/21.
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

export function MultiLineStockChart({
    title,
    subtitle,
    series,
    xAxis,
    yAxis,
    graphHeight = 500,
    showLegends = true,
    legendObj = { align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100 },
    ...props
}) {

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={{
                title: {
                    text: title,
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                                'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                yAxis: [{
                    lineWidth: 1,
                    title: {
                        text: 'Price'
                    },
                    endOnTick: false,
                    startOnTick: false,
                    showLastLabel: false,
                }, {
                    lineWidth: 1,
                    opposite: true,
                    endOnTick: false,
                    startOnTick: false,
                    showLastLabel: false,
                    title: {
                        text: 'IV'
                    }
                }],
                xAxis: {
                    type: 'datetime',
                    categories: xAxis.categories,
                    title: {
                        text: xAxis.text,
                        style: {
                            fontSize: '12px',
                        },
                    },
                },
                chart: {
                    height: graphHeight,
                    type: 'line',
                    zoomType: 'x'
                },
                legend: {
                    enabled: true,
                },
                credits: {
                    enabled: false,
                },
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
                        marker: {
                            enabled: false,
                        },
                        compare: 'percent',
                        showInNavigator: true
                    },
                },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
                    valueDecimals: 2,
                    split: true
                },
                series: series,
            }}
        />
    );
}
