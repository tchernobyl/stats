var inlist_module = angular.module("input_list", ['one_var_stats','ui.bootstrap']);

inlist_module.controller("input_list_ctrl", ['get_ovar_stats',function(get_ovar_stats) {
    this.inputs = [];
    this.numbers=[];
    this.editing = [{id:1, text:""}];
    this.curid = 1;
    // this.NUM_PATTERN = /^\d+$/;
    this.NUM_PATTERN = /(?:^\d+\.?\d*$)|(?:^\d*\.?\d+$)/;
    this.NUM_PATTERN_STRING = this.NUM_PATTERN.toString();

    this.check_if_number = function(text) {
        return this.NUM_PATTERN.test(text)
    };
    this.histogram_points = [];
    this.histogram_bins = [];
    this.boxplot_series = [];
    /* if there is no last blank input
     * field, add a new one */
    this.check_if_add = function(input) {
        index = this.editing.indexOf(input)
        console.log(input.text)
        console.log(this.check_if_number(input.text))
        if(!this.check_if_number(input.text))
            return;
        if(index == this.editing.length-1) {
            this.curid++;
            this.editing.push({id:this.curid, text:""})
       }
    };

    /* if, when unfocused, the element is blank
     * but not the last element, remove it.
     * if it's invalid and there is a last element,
     * remove it
     * Otherwise, move to top */
    this.check_if_delete_editing = function(input) {
        index = this.editing.indexOf(input)
        if(index != this.editing.length-1 &&
                input.text == "") {
            this.editing.splice(index,1);
        } else if(input.text == "" ||
                !this.check_if_number(input.text)) {
            if(index != this.editing.length-1)
                this.editing.splice(this.editing.length-1,1)
        } else {
            this.inputs.push(input);
            this.editing.splice(index,1);
        }
    };
    this.check_if_delete_inputs = function(input) {
        index = this.inputs.indexOf(input)
        if(input.text == "") {
            this.inputs.splice(index,1);
        } 
    };

    this.texify= function(i) {
        return "$$" + i + "$$" 
    }

    this.get_stats = function() {
        this.numbers=[];
        for (key in this.inputs) {
            text = this.inputs[key].text;
            if (text!="")
                this.numbers.push(Number(text));
        }
        this.stats=get_ovar_stats.get(this.numbers);
        this.histogram_bins=(get_ovar_stats.get_histogram_data(this.numbers));
        this.histogram_points =(get_ovar_stats.get_points_from_bins(this.histogram_bins));
        this.boxplot_series = (get_ovar_stats.get_boxplot_series(this.numbers));
        console.log(this.boxplot_series);
        return this.stats;
    };
    this.stats = {};
    this.symbolic_desc = get_ovar_stats.get_symbolic_desc();
    this.detail_desc=get_ovar_stats.get_detail_desc();
}]);

inlist_module.directive('hcHistogram', function() {
    return {
        replace:true,
        restrict:'C',
        scope:{
            values:"=values",
            bins:"=bins",
        },
        controller:function($scope,$element,$attrs){
            console.log($scope)
        },
        template:'<div id="hist"></div>',
        link: function(scope,element,attrs) {
            if(scope.values.length < 1)
                return;
            var chart = new Highcharts.Chart({
                chart: {type: 'column',
                    renderTo: 'hist',
                    spacingRight:40,
                    spacingLeft:40},
                title:{text:'Histogram of Values'},
                series: [{name:'Input Values',data:scope.values}],
                credits:{enabled:false},
                plotOptions: {
                    column:{
                        shadow:false,
                        pointPadding:0,
                        groupPadding:0,
                        color:'rgba(205,205,205,.9)',
                        borderColor:'#666',
                        borderWidth:.4,
                    }
                },
                xAxis: {
                    labels:{
                        formatter: function() {
                            main = scope.bins[this.value].min.
                                toPrecision(5).toString()
                                    + ', '
                                    + scope.bins[this.value].max.
                                toPrecision(5).toString()
                            if(this.value == 0)
                                return '[' + main + ']';
                            return '(' + main + ']';
                        }
                    }
                },
                yAxis: {
                    allowDecimals:false,
                    title:{text:'Frequency'},
                },
                tooltip: {
                    formatter: function()
                    {
                        return 'Frequency: ' + this.y.toString() 
                            + '<br />'  + 'Range: '
                            + scope.bins[this.x].min.toPrecision(5).toString()
                            + " to " + scope.bins[this.x].max.toPrecision(5).toString();
                    },
                    borderWidth:2
                }
            });
            scope.$watch("values", function(n) {
                chart.series[0].setData(n,true);
            },true);
        }
    };
});

inlist_module.directive('hcBoxplot', function() {
    return {
        replace:true,
        restrict:'C',
        scope:{
            in_series:"=series",
        },
        controller:function($scope,$element,$attrs){
            console.log($scope)
        },
        template:'<div id="box"></div>',
        link: function(scope,element,attrs) {
            if(scope.in_series.length < 1)
                return;
            var chart = new Highcharts.Chart({
                chart: {type: 'boxplot',
                    renderTo: 'box',
                    spacingRight:40,
                    spacingLeft:40,
                    inverted:true},
                title:{text:'Boxplot of Values'},
                credits:{
                    enabled: false
                },
                series:scope.in_series,
                plotOptions: {
                },
                xAxis: {
                    categories:['Input values']
                },
                yAxis: {
                },
                tooltip: {
                    borderWidth:2
                }
            });
            scope.$watch("in_series", function(in_series) {
                while(chart.series.length > 0)
                    chart.series[0].remove(true);
                console.log(in_series)
                for(i in in_series)
                {
                    chart.addSeries(in_series[i]);
                    console.log("series added");
                    console.log(in_series[i]);
                }
                console.log(chart.series);
            });
        }
    };
});

/* The following directive was taken from
 * Ben Alpert's answer at stackoverflow:
 * http://stackoverflow.com/questions/16087146/   \
 * getting-mathjax-to-update-after-changes-to-angularjs-model
 *
 * Available under cc-by-sa 3.0:
 * http://creativecommons.org/licenses/by-sa/3.0/ 
 *
 * Modifications: changed only the name of the 
 * module and whitespace
 * */
inlist_module.directive("mathjaxBind", function() {
    return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs",
            function($scope, $element, $attrs) {
                $scope.$watch($attrs.mathjaxBind, function(texExpression) {
                    var texScript = angular.element("<script type='math/tex'>")
                        .html(texExpression ? texExpression :  "");
                    $element.html("");
                    $element.append(texScript);
                    MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
                });
            }]
    };
});
