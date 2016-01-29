/* jshint esnext:true */
/* Copyright 2016 Paul Brewer, Economic & Financial Technology Consulting LLC */
/* module source code for PartialIndex */
/* Open Source License: The MIT License */

(function(){
    'use strict';

    function sort1(i1,d1){
	return function(a,b){
	    return d1*(+a[i1]-b[i1]);
	};
    }

    function sort2(i1,d1,i2,d2){
	return function(a,b){
	    var c1 = +a[i1]-b[i1];
	    if (0===c1) return d2*(+a[i2]-b[i2]);
	    return d1*c1;
	};
    }

    function sort3(i1,d1,i2,d2,i3,d3){
	var func2 = sort2(i2,d2,i3,d3);
	return function(a,b){
	    var c1 = +a[i1]-b[i1];
	    if (0===c1) return func2(a,b);
	    return d1*c1;
	};  
    }

    function makeSorter(prop1,dir1,prop2,dir2,prop3,dir3){
	if (dir3){
	    return sort3(prop1,dir1,prop2,dir2,prop3,dir3);
	} else if (dir2) {
	    return sort2(prop1,dir1,prop2,dir2);
	} else if (dir1) {
	    return sort1(prop1,dir1);
	} else {
	    return sort1(prop1,1);
	}
    }

    function makeFilter(prop1,dir1,prop2,dir2,prop3,dir3){
	if (dir3){
	    return function(item){
		return (item && (item[prop1]>0) && (item[prop2]>0) && (item[prop3]>0));
	    };
	} else if (dir2){
	    return function(item){
		return (item && (item[prop1]>0) && (item[prop2]>0));
	    };
	} else 
	    return function(item){
		return (item && (item[prop1]>0));
	    };
    }

    function idxByBisection(sorted,v,comp){
	var find = sorted.indexOf(v);
	var cmp;
	var left,right,mid,midval;
	if (find!==-1) return find;
	if (!comp){
	    if (v>sorted[sorted.length-1]) return sorted.length;
	    if (v<sorted[0]) return 0;
	    left = 0;
	    right = sorted.length-1;
	    while( (right-left)>1 ){
		mid = Math.floor((left+right)/2);
		midval = sorted[mid];
		if (v>midval)
		    left = mid;
		else if (v<midval)
		    right = mid;
		else if (v===midval){
		    left = mid;
		    right = mid;
		}
	    }
	    return right;
	} else {
	    if (comp(v,sorted[sorted.length-1])>0) return sorted.length;
	    if (comp(v,sorted[0])<0) return 0;
	    left = 0;
	    right = sorted.length-1;
	    while( (right-left)>1 ){
		mid = Math.floor((left+right)/2);
		midval = sorted[mid];
		cmp = comp(v,midval);
		if (cmp>0)
		    left = mid;
		else if (cmp<0)
		    right = mid;
		else if (0===cmp){
		    left = mid;
		    right = mid;
		}
	    }
	    return right;
	}
    }

    var PartialIndex =
	function(data, limit, prop1, dir1, prop2, dir2, prop3, dir3){
	    this.data = data;
	    this.limit = limit;
	    this.idx = [];
	    this.prop1 = prop1;
	    this.datafilter = makeFilter(prop1,dir1,prop2,dir2,prop3,dir3);
	    this.datacomp = makeSorter(prop1,dir1,prop2,dir2,prop3,dir3);
	    var that = this;
	    this.idxcomp = function(a,b){ var d=that.data; return that.datacomp(d[a],d[b]); };
	    this.idxfilter = function(i){ return that.datafilter(that.data[i]); };
	    if (this.data.length) this.needScan = 1;
	};

    PartialIndex.prototype.val = function(i){
	if ((i>=this.idx.length) || (i<0))
	    return undefined;
	return this.data[this.idx[i]][this.prop1];
    };

    PartialIndex.prototype.vals = function(){
	for(var i=0,l=this.idx.length,a=[],data=this.data,idx=this.idx,prop=this.prop1;i<l;++i)
	    a[i] = data[idx[i]][prop];
	return a;
    };
    
    PartialIndex.prototype.idxdata = function(ii){
	var i=0,l=this.idx.length,idx=this.idx,data=this.data,a=[];
	if (ii===undefined){
	    for(i=0;i<l;++i)
		a[i] = data[idx[i]];
	    return a;
	}
	return data[idx[ii]];
    };

    PartialIndex.prototype.scan = function(){
	var i,l;
	this.idx = [];
	var idx = this.idx, limit=this.limit, datalength=this.data.length, data=this.data, f=this.datafilter;
	var idxcomp = this.idxcomp;
	var loc;
	this.needScan = 0;
	if (0===limit) return;
	i=0;
	while((i<datalength) && (idx.length<limit)){
	    if (f(data[i]))
		idx.push(i);
	    ++i;
	}
	idx.sort(this.idxcomp);
	if (datalength<=limit) return;
	while(i<datalength){
	    if (f(data[i])){
		loc = idxByBisection(idx,i,idxcomp);
		idx.splice(loc,0,i);
		idx.splice(limit,1);
	    }	
	    ++i;
	}
    };

    PartialIndex.prototype.syncLast = function(){ 
	var lastdataidx = this.data.length-1;
	var loc;
	var idx = this.idx;
	var limit = this.limit;
	if (!limit) return;
	if (this.idxfilter(lastdataidx)){
	    if (this.needScan) return this.scan();
	    if (idx.length<limit){
		idx.push(lastdataidx);
		idx.sort(this.idxcomp);
	    } else {
		loc = idxByBisection(idx,lastdataidx,this.idxcomp);
		if (loc<limit){
		    idx.splice(loc,0,lastdataidx);
		    idx.splice(limit,1);
		}
	    }
	}
    };


    PartialIndex.prototype.remove = function(rmidxs){
	var i=rmidxs.length,l;
	var idx = this.idx;
	var loc;
	var removed=0;
	if (0===rmidxs.length) return;
	while(i-->1){
	    if (rmidxs[i-1]<=rmidxs[i])
		throw "PartialIndex.remove called with unsorted list of indexes. List of indexes to be removed must be ascending.";
	}
	i = rmidxs.length;
	while(i-->0){
	    loc = idx.indexOf(rmidxs[i]);
	    if (loc>=0){
		idx.splice(loc,1);
		++removed;
	    }
	}
	if (removed) this.needScan=1;
	for(i=0,l=idx.length;i<l;++i)
	    idx[i] -= idxByBisection(rmidxs, idx[i]);
    };

    module.exports = PartialIndex;
    
})();



