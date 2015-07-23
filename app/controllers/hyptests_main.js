var hyptests = angular.module('hyptests',[
        'ui.bootstrap' ]
        );
var hyptests_ctrl = hyptests.controller('choose_test_ctrl', function() {
            this.tests=['Two-sample z-test for proportions','Other test'];
 });

/* Calculates the error function of a real
 * argument to maximum precision based on
 * the maclaurin series for erf.
 * 
 * Based on an algorithm from
 * GNU MPFR: GNU multiple
 * precision floating point reliability
 *
 * http://www.mpfr.org/algorithms 
 * 4.5.1. Taylor expansion of error function*/

function erf(x) {
    if(x < 0)
        return -erf(-x);
    y=x*x;
    s=1;
    t=1;
    for(k=1;;k++)
    {
        t=y*t;
        t=t/k;
        u=t/(2*k+1);
        if(u==0)
            break;
        if(k%2 == 1) {
            s = s-u;
        } else {
            s = s+u;
        }
    }
    return 2*x*s/Math.sqrt(Math.PI);
}

/* calculates the upper-tail normal
 * probability given a standardized
 * (z-) score*/
function ltp_norm(x)
{
    return .5*(1+erf(x/Math.sqrt(2)))
}

var tpzt_ctrl = 
        hyptests.controller('tpzt_controller',[ function() {
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    this.nulldiff=0;
    this.x1=0;
    this.x2=0;
    this.n1=0;
    this.n2=0;
    this.alpha=0.05;
    this.bool_show=false;
    this.test_statistic=undefined;
    this.se_pooled=undefined;
    this.phat_1=undefined;
    this.phat_2=undefined;
    this.p_value=undefined;
    this.show = function () {
        this.phat_1=this.x1/this.n1;
        this.phat_2=this.x2/this.n2;
        this.phat_pooled=(this.x1+this.x2)/(this.n1+this.n2)
        this.diff = this.phat_1-this.phat_2;
        this.se_pooled = Math.sqrt((this.phat_pooled)*(1-this.phat_pooled)/this.n1 + 
            (this.phat_pooled)*(1-this.phat_pooled)/this.n2);
        this.zscore = (this.diff-this.nulldiff)/(this.se_pooled);
        neg_z = this.zscore < 0 ? this.zscore : -this.zscore;
        this.pvalue=2*ltp_norm(neg_z);
        this.bool_show=true;
    };
}]);

hyptests.directive('gdTpztResults', function() {
    return {
        templateUrl: 'app/views/hyptests/tpzt_results_template.html'
    };
}
);
