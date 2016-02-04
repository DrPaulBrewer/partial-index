partial-index.js
====
[![Build Status](https://travis-ci.org/DrPaulBrewer/partial-index.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/partial-index)
[![Coverage Status](https://coveralls.io/repos/github/DrPaulBrewer/partial-index/badge.svg?branch=master)](https://coveralls.io/github/DrPaulBrewer/partial-index?branch=master)


Npm javascript module for creating partial indexes on positive values in numerical 2D array data, such
as top 10 lists, bottom 10 lists, etc. Up to 3 columns with directions can be specified.

##Example:

###Installation

    npm install partial-index --save

###Running

    node

    > var data = 
     [
     [1,9,3],
     [2,8,1],
     [3,7,4],
     [4,6,1],
     [5,5,5],
     [6,4,9]
     ];

    > var PartialIndex = require('partial-index');

##Create `new PartialIndex(data, limit, col, dir, ... )` for top 3 from col 2

    > var X = new PartialIndex(data, 3, 2, -1); 
    > X.idx
    []

### idx is empty until a scan is done

    > X.scan()
    > X.idx
    [5,4,2]

#### explanation 

the top 3 of col 2 are 9,5,4 which are found in rows [5], [4], and [2] of data

#### convenience methods

    X.idxdata()  // array of data rows [[6,4,9],[5,5,5],[3,7,4]]
    X.idxdata(0) // [6,4,9]
    X.idxdata(1) // [5,5,5]
    X.idxdata(999) // undefined

    X.vals() // array of prop1 [9,5,4]

    X.val(0) // 9
    X.val(1) // 5
    X.val(2) // 4
    X.val(3) // undefined

### scan with a parameter can be used to set a new limit

    > X.scan(4)
    > X.limit
    4
    > X.idx
    [5,4,2,0]
    
### the scan filtering step is cached in .iok and can be skipped by calling .sort

    > X.sort(4)
    > X.limit
    5
    > X.idx
    [5,4,2,0]

### shrink will set a smaller limit without rescanning
    
    > X.shrink(3)
    > X.limit
    3
    > X.idx
    [5,4,2]

### `.syncLast()` adds the last row of data to the index

To add a single row of new data, use `data.push(newrow)` and then call `X.syncLast()`

### `.remove([rowlist])` deletes specified rows from the index (but not the data)

to remove rows `[1,2,3]`:

1. first call `data.splice(3,1); data.splice(2,1); data.splice(1,1)` to remove the rows from the data 
1. then call `X.remove([1,2,3])` to remove the rows from the index

### `remove([rowlist], options)` deletes specified rows and applies an option

    X.remove([1,2,3], {scan:1})
   
calls `this.scan()` to rebuild the index if any of the removed rows `[1,2,3]` are in X.idx

    X.remove([1,2,3], {scan:1, limit:15})

calls `this.scan(15)` to rebuild a size 15 index if any of the removed rows are in X.idx

    X.remove([1,2,3], {shrink:1})

shrinks the index by reducing X.limit by the number of removed rows and does not set X.needScan

    X.remove([1,2,3], {preserve:1})

removes any of the removed rows `[1,2,3]` from X.idx and does not decrement any of the remaining X.idx values.  Use
this option if rows are not being deleted from the underlying X.data

####Notes:  
1. `PartialIndex.remove([list])` removes a list of rows from the index, not the data
1. `PartialIndex.remove` will delete the cached this.iok even if no elements are removed from the index 
1. `PartialIndex.remove` will decrement surviving index values down as necessary. 
1. `PartialIndex.remove` will not fill out the list again.  To do that requires a `.scan()` or setting the `{scan:1}` option to remove.
1. Because of decrements, calling `PartialIndex.remove(rows_to_remove)` without also removing the rows from the data will yield invalid results.  For this case, set the preserve option on remove.  
1. The PartialIndex accesses `.data` in a read-only matter and only modifies or resets `.idx`. It does not do `data.splice(someindex,1)` or `data.push(newrow)` for you, making it possible to maintain several indexes on the same data.  
1. `PartialIndex.data` is a reference to the data 2D array (or array-of-array), not an independent copy of it.
1. Negative, zero, and undefined data is allowed, but only positive data is indexed.

# Tests

mocha tests are available in the tests directory

