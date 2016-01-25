/* Copyright 2016 Paul Brewer Economic & Financial Technology Consulting LLC */
/* tests for PartialIndex */
/* Open Source License: The MIT Public License */

var assert = require('assert');
var should = require('should');
var PartialIndex = require("../index.js");

describe('PartialIndex', function(){
    var tendata = 
	[[1,9,3],
	 [2,8,1],
	 [3,7,4],
	 [4,6,1],
	 [5,5,5],
	 [6,4,9],
	 [7,3,2],
	 [8,2,6],
	 [9,1,5]];
    describe('new properties', function(){
	var data = tendata.slice();
	var limit = 7;
	var x = new PartialIndex(data,limit,1);
	it('should have property data', function(){
	    x.should.have.property('data');
	});
	it('data should be correct', function(){
	    x.data.should.eql(data);
	});
	it('should have property limit', function(){
	    x.should.have.property('limit');
	});
	it('limit should be correct', function(){
	    x.limit.should.eql(limit);
	});
	it('should have idx property', function(){
	    x.should.have.property('idx');
	});
	it('idx should be empty', function(){
	    x.idx.should.eql([]);
	});
	it('should have functions datafilter, datacomp, idxcomp, idxfilter', function(){
	    x.should.have.property('datafilter');
	    x.datafilter.should.be.type('function');
	    x.should.have.property('datacomp');
	    x.datacomp.should.be.type('function');
	    x.should.have.property('idxcomp');
	    x.idxcomp.should.be.type('function');
	    x.should.have.property('idxfilter');
	    x.idxfilter.should.be.type('function');
	});
	it('should have property needScan set to 1', function(){
	    x.should.have.property('needScan');
	    x.needScan.should.equal(1);
	});
	    
    });

    function ascTests(j, col){
	describe('col '+col+' limit '+j, function(){
	    var seq = [],i,l;
	    for(i=0;i<tendata.length;++i) seq[i]=i;
	    it('should have correct idx', function(){
		var x = new PartialIndex(tendata.slice(),j,col);
		x.scan();
		if (col===0)
		    x.idx.should.eql(seq.slice(0,j));
		else
		    x.idx.should.eql(seq.slice().reverse().slice(0,j));
	    });
	    it('should have correct idx when deleting [4]', function(){
		var x = new PartialIndex(tendata.slice(),j,col);
		x.scan();
		x.remove([4]);
		x.data.splice(4,1);
		if (j>4)
		    x.idx.should.eql((col===0)?(seq.slice(0,j-1)):(seq.slice().reverse().slice(1,j)));
		else
		    x.idx.should.eql((col===0)?(seq.slice(0,j)):(seq.slice().reverse().slice(1,j+1)));
		x.scan();
		var a;
		if (j===0) a=[];
		if (j>0 && j<9 && col===0) a = seq.slice(0,j);
		if (j===9 && col===0) a = seq.slice(0,j-1);
		if (j>0 && col===1) a = seq.slice().reverse().slice(1,j+1);
		x.idx.should.eql(a);
	    });
	});
    }

    
    describe('ascending index on copy of tendata ', function(){
	var i, j, l;
	l = 10;
	for(var col=0; col<2; ++col)
	    for(j=0;j<l;++j)
		ascTests(j,col);
	
    });	

    describe('index cols 2 asc,0 asc ', function(){
	var answer =  [1,3,6,0,2,4,8,7,5];
	var answer_rm = [2,5,0,1,3,7,6,4];
	var i = 0;
	for(i=0;i<10;++i)
	    (function(limit){
		describe(' limit '+limit, function(){
		    it('should have correct idx after scan', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,0,1);
			x.scan();
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should also be correct using push and sync', function(){
			var x = new PartialIndex([],limit,2,1,0,1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.sync();
			});
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should have correct idx after removing [1]', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,0,1);
			x.scan();
			x.remove([1]);
			x.data.splice(1,1);
			var a;
			if (limit===0) a=[];
			if (limit===1) a=[];
			if (limit>=2)  a=answer_rm.slice(0,limit-1);
			x.idx.should.eql(a);
			x.scan();
			if (limit>=1) a=answer_rm.slice(0,limit);
			x.idx.should.eql(a);
		    });
		});
	    })(i);
    });

    describe('index cols 2 asc, 1 asc ', function(){
	var answer = [3,1,6,0,2,8,4,7,5];
	var answer_rm = [2,5,0,1,7,3,6,4];
	var i = 0;
	for(i=0;i<10;++i)
	    (function(limit){
		describe(' limit '+limit, function(){
		    it('should have correct idx ', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,1,1);
			x.scan();
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should also be correct using push and sync', function(){
			var x = new PartialIndex([], limit, 2,1,1,1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.sync();
			});
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should have correct idx after removing [1]', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,1,1);
			x.scan();
			x.remove([1]);
			x.data.splice(1,1);
			var a;
			if (limit===0) a=[];
			if (limit===1) a=[2];
			if (limit===2) a=[2];
			if (limit>=3) a=answer_rm.slice(0,limit-1);
			x.idx.should.eql(a);
			x.scan();
			if (limit>=0) a=answer_rm.slice(0,limit);
			x.idx.should.eql(a);
		    });
		});
	    })(i);
    });

    describe('index cols 2 asc, 0 desc ', function(){
	var answer = [3,1,6,0,2,8,4,7,5];
	var answer_rm = [2,5,0,1,7,3,6,4];
	var i = 0;
	for(i=0;i<10;++i)
	    (function(limit){
		describe(' limit '+limit, function(){
		    it('should have correct idx ', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,0,-1);
			x.scan();
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should also be correct using push and sync', function(){
			var x = new PartialIndex([], limit, 2,1,0,-1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.sync();
			});
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should have correct idx after removing [1]', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,0,-1);
			x.scan();
			x.remove([1]);
			x.data.splice(1,1);
			var a;
			if (limit===0) a=[];
			if (limit===1) a=[2];
			if (limit===2) a=[2];
			if (limit>=3) a=answer_rm.slice(0,limit-1);
			x.idx.should.eql(a);
			x.scan();
			if (limit>=0) a=answer_rm.slice(0,limit);
			x.idx.should.eql(a);
		    });
		});
	    })(i);
    });

    describe('index cols 2 asc,1 desc ', function(){
	var answer =  [1,3,6,0,2,4,8,7,5];
	var answer_rm = [2,5,0,1,3,7,6,4];
	var i = 0;
	for(i=0;i<10;++i)
	    (function(limit){
		describe(' limit '+limit, function(){
		    it('should have correct idx after scan', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,1,-1);
			x.scan();
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should also be correct using push and sync', function(){
			var x = new PartialIndex([],limit,2,1,1,-1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.sync();
			});
			x.idx.should.eql(answer.slice(0,limit));
		    });
		    it('should have correct idx after removing [1]', function(){
			var x = new PartialIndex(tendata.slice(),limit,2,1,1,-1);
			x.scan();
			x.remove([1]);
			x.data.splice(1,1);
			var a;
			if (limit===0) a=[];
			if (limit===1) a=[];
			if (limit>=2)  a=answer_rm.slice(0,limit-1);
			x.idx.should.eql(a);
			x.scan();
			if (limit>=1) a=answer_rm.slice(0,limit);
			x.idx.should.eql(a);
		    });
		});
	    })(i);
    });
    
});
