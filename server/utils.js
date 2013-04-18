var KEY_1 = "store4lucy";
var KEY_2 = "password";

var crypto = require('crypto');
var fs = require('fs');
var walk = require('walk');


var INDEX_PAGE_PATH = 'server/static/index_sample.html';


function stringEndWith(src, suffix){
    return src.indexOf(suffix, src.length - suffix.length) !== -1;
}

function trim(s){
    return s.replace(/(^\n*)|(\n*$)/g, "");
}

function encryptSync(src){
    var hmac, result;
    hmac = crypto.createHmac("sha1", src);
    hmac.update(KEY_1);
    hmac.update(KEY_2);
    result = hmac.digest("hex");
    return result;
}

function getHomePage(callback){
    fs.readFile( INDEX_PAGE_PATH, "utf8", function( err, data ){
        if ( err ){
            //write 505 error to client
            callback(err, null);
        }else{
            callback(null, data);
        }
    } );
}

function walkDirectory(path, options, wantMore, finish){
    var walker = walk.walk(path, options);

    walker.on("directories", function (root, dirStatsArray, next){
        next();
    });
    walker.on("errors", function (root, nodeStatsArray, next){
        next();
    });
    walker.on("end", function (){
        finish();
    });
    walker.on("file", function (root, fileStats, next){
        if ( wantMore(root, fileStats) ){
            next();
        }
    });
}

/**
* Walk through the product repository, read each product.
* @param {string} repoPath, the repository path
* @param {options} walk directory options
* @param {function} onProduct, callback when each product read.
* @param {function} callback when finish.
* @api public 
*/
function forEachProduct( repoPath, options, onProduct, finish ){
    walkDirectory( repoPath, options, function( root, fileStats ){
        if ( stringEndWith(fileStats.name, ".json") ){
            fs.readFile( root + '/' + fileStats.name, 'utf8', function( err, data ){
                if ( err ){
                    onProduct( err, null );
                }else{
                    onProduct( null, JSON.parse(data) );
                }
            });
        }
        return true;
    }, finish );
}

/**
* contains function for Array's prototype
* @param {Object} target element which to be check contains in the array or not
* @return {boolean} true if contains
*/
function arrayContainsPrototype( targetElement ){
    for ( var i = 0; i < this.length; i++ ){
        if ( this[i] == targetElement ){
            return true;
        }
    }
    return false;
}

/**
* Delete elements which match the 'cond' from the ary.
* @param {Array} ary, the array to be operated
* @param {function} cond, the deletion condition
* @return {Array}, a new array which some elements deleted.
* @api public
*/
function deleteIf( ary, cond ){
    var newArray = [];
    var len = ary.length;
    for( var i = 0; i < len; i++ ){
        if ( cond( ary[i] ) ){
            //ary.splice(i, 1);
            //do nothing
        }else{
            newArray.push(ary[i]);
        }
    }
    return newArray;
}


exports.stringEndWith = stringEndWith;
exports.trim = trim;
exports.encryptSync = encryptSync;
exports.getHomePage = getHomePage;
exports.walkDirectory = walkDirectory;
exports.deleteIf = deleteIf;
exports.forEachProduct = forEachProduct;
exports.arrayContainsPrototype = arrayContainsPrototype;

