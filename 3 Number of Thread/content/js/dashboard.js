/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 88.88888888888889, "KoPercent": 11.11111111111111};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8333333333333334, 500, 1500, "GET Seller Product ID"], "isController": false}, {"data": [1.0, 500, 1500, "GET Buyer Product ID"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "DELETE Seller Product ID"], "isController": false}, {"data": [1.0, 500, 1500, "GET Buyer Order ID"], "isController": false}, {"data": [1.0, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.0, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": false}, {"data": [0.0, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "POST Buyer Order"], "isController": false}, {"data": [1.0, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [1.0, 500, 1500, "PUT Buyer Order ID"], "isController": false}, {"data": [0.0, 500, 1500, "register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 36, 4, 11.11111111111111, 926.3055555555557, 285, 4378, 349.0, 2831.7000000000053, 4138.299999999999, 4378.0, 2.957364659492319, 431.71916395403764, 35.64553404563378], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Seller Product ID", 3, 0, 0.0, 485.0, 317, 821, 317.0, 821.0, 821.0, 821.0, 1.8450184501845017, 1.2954768219557196, 0.6198108856088561], "isController": false}, {"data": ["GET Buyer Product ID", 3, 0, 0.0, 287.6666666666667, 285, 290, 288.0, 290.0, 290.0, 290.0, 1.937984496124031, 2.1745548691860463, 0.641578851744186], "isController": false}, {"data": ["DELETE Seller Product ID", 3, 2, 66.66666666666667, 419.3333333333333, 312, 628, 318.0, 628.0, 628.0, 628.0, 1.5479876160990713, 0.5069256320949432, 0.5532846362229102], "isController": false}, {"data": ["GET Buyer Order ID", 3, 0, 0.0, 332.3333333333333, 295, 393, 309.0, 393.0, 393.0, 393.0, 1.8856065367693275, 2.5632463859208046, 0.6279217080452546], "isController": false}, {"data": ["GET Seller Product", 3, 0, 0.0, 346.0, 318, 363, 357.0, 363.0, 363.0, 363.0, 2.581755593803787, 5.1332562392426855, 0.8521810456110156], "isController": false}, {"data": ["POST Seller Product", 3, 0, 0.0, 1970.3333333333333, 1678, 2445, 1788.0, 2445.0, 2445.0, 2445.0, 1.1398176291793312, 0.7379873907674772, 158.91439791508358], "isController": false}, {"data": ["Login", 3, 0, 0.0, 408.3333333333333, 385, 445, 395.0, 445.0, 445.0, 445.0, 4.005340453938585, 1.9635555740987984, 1.6271695594125501], "isController": false}, {"data": ["GET Buyer Product", 3, 0, 0.0, 4069.3333333333335, 3734, 4378, 4096.0, 4378.0, 4378.0, 4378.0, 0.5603287261860291, 972.0849773533806, 0.21395364447142323], "isController": false}, {"data": ["POST Buyer Order", 3, 2, 66.66666666666667, 303.0, 295, 315, 299.0, 315.0, 315.0, 315.0, 1.9193857965451055, 0.85785048784389, 0.7610064779270633], "isController": false}, {"data": ["GET Buyer Order", 3, 0, 0.0, 344.3333333333333, 317, 375, 341.0, 375.0, 375.0, 375.0, 1.8484288354898337, 15.843417860443623, 0.6047106053604436], "isController": false}, {"data": ["PUT Buyer Order ID", 3, 0, 0.0, 314.6666666666667, 292, 341, 311.0, 341.0, 341.0, 341.0, 1.832620647525962, 1.3154064218081858, 0.690812080024435], "isController": false}, {"data": ["register", 3, 0, 0.0, 1835.3333333333333, 1656, 1970, 1880.0, 1970.0, 1970.0, 1970.0, 1.2903225806451613, 0.711945564516129, 2.1169354838709675], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 50.0, 5.555555555555555], "isController": false}, {"data": ["404/Not Found", 2, 50.0, 5.555555555555555], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 36, 4, "400/Bad Request", 2, "404/Not Found", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["DELETE Seller Product ID", 3, 2, "404/Not Found", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Buyer Order", 3, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
