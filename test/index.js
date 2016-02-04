/* Copyright 2016 Paul Brewer Economic & Financial Technology Consulting LLC */
/* tests for PartialIndex */
/* Open Source License: The MIT Public License */

var assert = require('assert');
var should = require('should');
var PartialIndex = require("../index.js");

describe('PartialIndex', function(){
    var tendata = 
	[[1,9,3,10,10],
	 [2,8,1,10,10],
	 [3,7,4,10,10],
	 [4,6,1,10,10],
	 [5,5,5,10,10],
	 [6,4,9,10,10],
	 [7,3,2,10,10],
	 [8,2,6,10,10],
	 [9,1,5,10,10]];
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
	it('should have functions datafilter, datacomp, idxcomp, idxfilter, idxdata', function(){
	    x.should.have.property('datafilter');
	    x.datafilter.should.be.type('function');
	    x.should.have.property('datacomp');
	    x.datacomp.should.be.type('function');
	    x.should.have.property('idxcomp');
	    x.idxcomp.should.be.type('function');
	    x.should.have.property('idxfilter');
	    x.idxfilter.should.be.type('function');
	    x.should.have.property('idxdata');
	    x.idxdata.should.be.type('function');
	});
	it('.idxdata() should be []', function(){
	    x.idxdata().should.be.eql([]);
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
	    it('should change limit to 3 with scan(3)', function(){
		var x = new PartialIndex(tendata.slice(),j,col);
		x.scan();
		if (col===0)
		    x.idx.should.eql(seq.slice(0,j));
		else
		    x.idx.should.eql(seq.slice().reverse().slice(0,j));
		x.scan(3);
		if (col===0)
		    x.idx.should.eql(seq.slice(0,3));
		else
		    x.idx.should.eql(seq.slice().reverse().slice(0,3));		
	    });
	    it('should have correct idx on 2nd sort col when 1st sort col is tied', function(){
		var x = new PartialIndex(tendata.slice(),j,3,-1,col,1);
		var y = new PartialIndex(tendata.slice(),j,3,1,col,1);
		x.scan();
		y.scan();
		if (col===0)
		    x.idx.should.eql(seq.slice(0,j));
		else
		    x.idx.should.eql(seq.slice().reverse().slice(0,j));
		y.idx.should.eql(x.idx);
	    });
	    it('should have correct idx on 3rd sort col when 1st and 2nd sort cols are tied', 
	       function(){
		   var x =  new PartialIndex(tendata.slice(),j,3,-1,4,-1,col,1);
		   var x2 = new PartialIndex(tendata.slice(),j,3,1,4,-1,col,1);
		   var x3 = new PartialIndex(tendata.slice(),j,3,-1,4,1,col,1);
		   var x4 = new PartialIndex(tendata.slice(),j,3,1,4,1,col,1);
		   x.scan();
		   x2.scan();
		   x3.scan();
		   x4.scan();
		   if (col===0)
		       x.idx.should.eql(seq.slice(0,j));
		   else
		       x.idx.should.eql(seq.slice().reverse().slice(0,j));
		   x2.idx.should.eql(x.idx);
		   x3.idx.should.eql(x.idx);
		   x4.idx.should.eql(x.idx);
	       });
	    it('should have correct idxdata()', function(){
		var x = new PartialIndex(tendata.slice(),j,col);
		var a;
		x.scan();
		if (col===0)
		    a = tendata.slice(0,j);
		else 
		    a = tendata.slice().reverse().slice(0,j);
		x.idxdata().should.eql(a);
		assert.strictEqual(x.idxdata(-1), undefined);
		var i;
		for(i=0;i<j;++i)
		    x.idxdata(i).should.eql(a[i]);
		assert.strictEqual(x.idxdata(j), undefined);
	    });
	    it('should return correct val(i) ', function(){
		var i=0,l=j;
		var x = new PartialIndex(tendata.slice(),j,col);
		x.scan();
		for(i=0;i<l;++i)
		    assert.strictEqual(x.val(i), i+1);
	    });
	    it('should return undefined val(i) when i out of range', function(){
		var x = new PartialIndex(tendata.slice(),j,col);
		assert.strictEqual(x.val(0), undefined);
		x.scan();
		assert.strictEqual(x.val(-1), undefined, "val(-1) !== undefined");
		assert.strictEqual(x.val(j), undefined, "val(length) !== undefined");
	    });
		
	    it('should return correct vals()', function(){
		var x = new PartialIndex(tendata.slice(),j,col);
		var a = [1,2,3,4,5,6,7,8,9];
		x.scan();
		x.vals().should.eql((0===j)? ([]): (a.slice(0,j)));
	    });	
	    it('should have correct idx when removing [4]', function(){
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
	    it('should have correct idx when removing [1,4]', function(){
		var x = new PartialIndex(tendata.slice(), j, col);
		x.scan();
		x.remove([1,4]);
		x.data.splice(4,1);
		x.data.splice(1,1);
		var a;
		if (j===0) a=[];
		if (j===1 && col===0) a=[0];
		if (j>1 && j<5 && col===0) a = seq.slice(0,j-1);
		if (j>=5 && col===0) a=seq.slice(0,j-2);
		if (j>=8 && col===0) a = seq.slice(0,j-2); 
		if (j>0 && j<5 && col===1) a = seq.slice().reverse().slice(2,j+2);
		if (j>=5 && j<8 && col===1) a=seq.slice().reverse().slice(2,j+1);
		if (j>=8 && col===1) a=seq.slice().reverse().slice(2,j);
		x.idx.should.eql(a);
	    });
	    it('should have correct idx when removeing [1,3,5,7]', function(){
		x = new PartialIndex(tendata.slice(),j,col);
		x.scan();
		x.remove([1,3,5,7]);
		x.data.splice(7,1);
		x.data.splice(5,1);
		x.data.splice(3,1);
		x.data.splice(1,1);
		var a;
		if (j===0) a=[];
		if (j===1 && col===0) a=[0];
		if (j===2 && col===0) a=[0];
		if (j===3 && col===0) a=[0,1];
		if (j===4 && col===0) a=[0,1];
		if (j===5 && col===0) a=[0,1,2];
		if (j===6 && col===0) a=[0,1,2];
		if (j===7 && col===0) a=[0,1,2,3];
		if (j===8 && col===0) a=[0,1,2,3];
		if (j===9 && col===0) a=[0,1,2,3,4];
		if (j===1 && col===1) a=[4];
		if (j===2 && col===1) a=[4];
		if (j===3 && col===1) a=[4,3];
		if (j===4 && col===1) a=[4,3];
		if (j===5 && col===1) a=[4,3,2];
		if (j===6 && col===1) a=[4,3,2];
		if (j===7 && col===1) a=[4,3,2,1];
		if (j===8 && col===1) a=[4,3,2,1];
		if (j===9 && col===1) a=[4,3,2,1,0];
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
		    it('should also be correct using push and syncLast', function(){
			var x = new PartialIndex([],limit,2,1,0,1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.syncLast();
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
		    it('should also be correct using push and syncLast', function(){
			var x = new PartialIndex([], limit, 2,1,1,1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.syncLast();
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
		    it('should also be correct using push and syncLast', function(){
			var x = new PartialIndex([], limit, 2,1,0,-1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.syncLast();
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
		    it('should also be correct using push and syncLast', function(){
			var x = new PartialIndex([],limit,2,1,1,-1);
			tendata.forEach(function(item){
			    x.data.push(item);
			    x.syncLast();
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
    describe(".remove()", function(){
	var data = [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]];
	it('should remove ordered list [2,4]', function(){
	    var x = new PartialIndex(data,5,0,1);
	    var y = new PartialIndex(data,5,0,-1);
	    x.scan();
	    y.scan();
	    x.remove([2,4]);
	    y.remove([2,4]);
            x.idx.should.eql([0,1,2]);
	    y.idx.should.eql([4,3,2]);
	});
	it('should throw if removing misordered list [3,2]', function(){
	    var x = new PartialIndex(data,5,0,1);
	    x.remove.bind(x,[3,2]).should.throw();
	});
	it('options={scan:1} should scan and fill out idx', function(){
	    var x = new PartialIndex(data,5,0,1);
	    var y = new PartialIndex(data,5,0,1);
	    x.scan();
	    y.scan();
	    x.remove([2,4], {scan:1});
	    y.remove([2,4]);
	    x.idx.should.eql([0,1,2,3,4]);
	    assert.ok(!x.needScan);
	    y.idx.should.eql([0,1,2]);
	    assert.ok(y.needScan);
	});
	it('options={shrink:1} should reduce limit and not set needScan', function(){
	    var x = new PartialIndex(data,5,0,1);
	    x.scan();
	    x.remove([2,4], {shrink:1});
	    x.idx.should.eql([0,1,2]);
	    assert.ok(!x.needScan);
	    assert.ok(x.limit===3);
	});
	it('options={preserve:1} should preserve index values, no decrement after remove', function(){
	    var x = new PartialIndex(data,5,0,1);
	    x.scan();
	    x.remove([2,4], {preserve:1});
	    x.idx.should.eql([0,1,3]);
	    assert.ok(x.limit===5);
	    assert.ok(x.needScan);
	});
    }); 
    describe('.shrink(newsize)', function(){
	var data = [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]];
	it('should do nothing if newsize is less than or equal to 0, non-numeric, or gt limit', function(){
	    var x = new PartialIndex(data,5,0,1);
	    x.scan();
	    x.idx.should.eql([0,1,2,3,4]);
	    x.shrink(0);
	    assert.ok(x.limit===5);
	    x.idx.should.eql([0,1,2,3,4]);
	    x.shrink(-1);
	    assert.ok(x.limit===5);
	    x.idx.should.eql([0,1,2,3,4]);
	    x.shrink('ZombieApocalypse');
	    assert.ok(x.limit===5);
	    x.idx.should.eql([0,1,2,3,4]);
	    x.shrink(666);
	    x.idx.should.eql([0,1,2,3,4]);
	    assert.ok(x.limit===5);
	});
	it('should shrink index and limit if newlimit is smaller and positive', function(){
	    var x = new PartialIndex(data,5,0,1);
	    x.scan();
	    x.idx.should.eql([0,1,2,3,4]);
	    x.shrink(3);
	    x.idx.should.eql([0,1,2]);
	    assert.ok(x.limit===3);
	    x.shrink(1);
	    assert.ok(x.limit===1);
	    x.idx.should.eql([0]);
	});
    });
});
