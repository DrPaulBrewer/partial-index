partial-index.js
====

Npm javascript module for creating partial indexes on numerical 2D array data, such
as top 10 lists, bottom 10 lists, etc. Up to 3 columns with directions can be specified.

##Example:


    npm install partial-index --save

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

##Create index for top 3 from col 2

    > var X = new PartialIndex(data, 3, 2, -1); 
    > X.idx

### index is empty until a scan is done

    > X.scan()
    > X.idx
    [5,4,2]

#### explanation 

the top 3 of col 2 are 9,5,4 which are found in rows [5], [4], and [2] of data

### `.syncLast()` adds the last row of data to the index

To add a single row of new data, use `data.push(newrow)` and then call X.syncLast()

### `.remove([rowlist])` deletes an array of row elements from the index (but not the data)

to delete rows [1,2,3]:

1. first call `data.splice(3,1); data.splice(2,1); data.splice(1,1)` to delete the data 
1. then call `X.delete([1,2,3])` to delete the rows from the index



