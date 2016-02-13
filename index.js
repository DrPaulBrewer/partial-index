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

    function makeBulkFilter(prop1,dir1,prop2,dir2,prop3,dir3){
	if (dir3){
	    return function(data){
		var i,l,r,item;
		for(i=0,l=data.length,r=[];i<l;++i){
		    item = data[i];
		    if (item && (item[prop1]>0) && (item[prop2]>0) && (item[prop3]>0))
			r.push(i);
		}
		return r;
	    };
	} else if (dir2){
	    return function(data){
		var i,l,r,item;
		for(i=0,l=data.length,r=[];i<l;++i){
		    item = data[i];
		    if (item && (item[prop1]>0) && (item[prop2]>0))
			r.push(i);
		}
		return r;
	    };
	} else {
	    return function(data){
		var i,l,r,item;
		for(i=0,l=data.length,r=[];i<l;++i){
		    item = data[i];
		    if (item && (item[prop1]>0))
			r.push(i);
		}
		return r;
	    };
	}
    }

    function idxByBisection(sorted,v,comp){
	var cmp;
	var left,right,mid,midval;
	var checkLeft;
	if (!comp){
	    if (v>=sorted[sorted.length-1]) return sorted.length;
	    if (v<sorted[0]) return 0;
	    if (v===sorted[0]) return 1;
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
		    right = mid+1;
		}
	    }
	    return right;
	} else {
	    if (comp(v,sorted[sorted.length-1])>=0) return sorted.length;
	    checkLeft = comp(v,sorted[0]);
	    if (checkLeft<0) return 0;
	    if (checkLeft===0) return 1;
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
		    right = mid+1;
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
	    this.iok = [];
	    this.prop1 = prop1;
	    this.dir1 = dir1;
	    this.datafilter = makeFilter(prop1,dir1,prop2,dir2,prop3,dir3);
	    this.datacomp = makeSorter(prop1,dir1,prop2,dir2,prop3,dir3);
	    var that = this;
	    this.idxcomp = function(a,b){ var d=that.data; return that.datacomp(d[a],d[b]); };
	    this.idxfilter = function(i){ return that.datafilter(that.data[i]); };
	    this.bulkFilter = makeBulkFilter(prop1,dir1,prop2,dir2,prop3,dir3);
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

    PartialIndex.prototype.valBisect = function(v){
	var prop1 = this.prop1;
	var dir1  = this.dir1;
	var idx = this.idx;
	var data = this.data;
	var cmp;
	if (!idx || idx.length===0) return;
	if (dir1<0)
	    cmp = function(av,bi){
		return (data[bi][prop1]-av);
	    };
	else
	    cmp = function(av,bi){
		return (av-data[bi][prop1]);
	    };
	return idxByBisection(idx, v, cmp);
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

    PartialIndex.prototype.scan = function(newLimit){
	var i,l;
	this.idx = [];
	var limit=(newLimit || this.limit);
	this.needScan = 0;
	this.limit = limit;
	if (0===limit) return;
	this.iok = this.bulkFilter(this.data);
	if (this.iok.length) 
	    this.sort(limit);
    };

    PartialIndex.prototype.sort = function(newLimit){
	if (!this.iok || !this.iok.length) return this.scan(newLimit);
	if (newLimit>0)
	    this.limit = newLimit;
	var iok=this.iok, ioki, limit=this.limit, idxcomp=this.idxcomp, loc, i,l;
	this.needScan = 0;
	if (0===limit) return;
	// testing reveals that full internal .sort(this.idxcomp) is actually pretty fast and
	// our insertion sort with bisection is only faster when the index limit
	// is less than 1% of the filtered data length
	if (limit > 0.01*this.iok.length)
	    this.idx = iok.slice();
	else
	    this.idx = iok.slice(0,10*limit);
	var idx = this.idx;
	idx.sort(idxcomp);
	var j = idx.length;
	if (j>limit)
	    idx.splice(limit,j-limit);
	if (iok.length <= limit) return;
	for(i=j,l=iok.length;i<l;++i){
	    ioki = iok[i];
	    loc = idxByBisection(idx,ioki,idxcomp);
	    if (loc<limit) {
		idx.splice(loc,0,ioki);
		idx.splice(limit,1);
	    }
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
	    this.iok.push(lastdataidx);
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


    PartialIndex.prototype.remove = function(rmidxs, options){
	var i=rmidxs.length,l;
	var idx = this.idx;
	var loc;
	var removed=0;
	if (0===rmidxs.length) return;
	while(i-->1){
	    if (rmidxs[i-1]>=rmidxs[i])
		throw new Error("PartialIndex.remove called with unsorted list of indexes. List of indexes to be removed must be ascending.");
	}
	this.iok = []; // iok may be too large to be searching and repairing
	i = rmidxs.length;
	while(i-->0){
	    loc = idx.indexOf(rmidxs[i]);
	    if (loc>=0){
		idx.splice(loc,1);
		++removed;
	    }
	}
	if (removed && options && options.scan)
	    return this.scan(options.limit);
	if (removed){
	    if (options && options.shrink){
		this.limit -= removed;
	    } else {
		this.needScan=1;
	    }
	}
	if (options && options.preserve) return; 
	for(i=0,l=idx.length;i<l;++i)
	    idx[i] -= idxByBisection(rmidxs, idx[i]);
    };

    PartialIndex.prototype.shrink = function(newsize){
	var s = +newsize;
	if ((!s) || (s<=0) || (s>=this.limit) ) return;
	this.limit = s;
	this.idx.splice(s,this.idx.length-s);
    };

    module.exports = PartialIndex;
    
})();



