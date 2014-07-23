// ==UserScript==
// @name       Dixit cards replace
// @version    1.0
// @description  Edit script params to play your own deck
// @include http://www.boiteajeux.net/jeux/dix/partie.php*
// @copyright  2014

// Cards dir (no trailing slash)
var cardsBaseUrl = 'http://example.com/dixit-cards-dir';

// Number of cards in dir
var totalCards = 344;

// Card files extension
var imgExtension = 'jpg';

// Get url param
function getUrlParameter(param)
{
    var pageUrl = window.location.search.substring(1);
    var urlParts = pageUrl.split('&');
    for (var i = 0; i < urlParts.length; i++) 
    {
        var parameterName = urlParts[i].split('=');
        if (parameterName[0] == param) 
        {
            return parameterName[1];
        }
    }
}

// Random number generator with seed
function Rc4Random(seed)
{
	var keySchedule = [];
	var keySchedule_i = 0;
	var keySchedule_j = 0;
	
	function init(seed) {
		for (var i = 0; i < 256; i++)
			keySchedule[i] = i;
		
		var j = 0;
		for (var i = 0; i < 256; i++)
		{
			j = (j + keySchedule[i] + seed.charCodeAt(i % seed.length)) % 256;
			
			var t = keySchedule[i];
			keySchedule[i] = keySchedule[j];
			keySchedule[j] = t;
		}
	}
	init(seed);
	
	function getRandomByte() {
		keySchedule_i = (keySchedule_i + 1) % 256;
		keySchedule_j = (keySchedule_j + keySchedule[keySchedule_i]) % 256;
		
		var t = keySchedule[keySchedule_i];
		keySchedule[keySchedule_i] = keySchedule[keySchedule_j];
		keySchedule[keySchedule_j] = t;
		
		return keySchedule[(keySchedule[keySchedule_i] + keySchedule[keySchedule_j]) % 256];
	}
	
	this.getRandomNumber = function() {
		var number = 0;
		var multiplier = 1;
		for (var i = 0; i < 8; i++) {
			number += getRandomByte() * multiplier;
			multiplier *= 256;
		}
		return number / 18446744073709551616;
	}
}


// Get game ID from URL
var gameId = getUrlParameter('id');

// Create random generator based on gameId
var rc4Rand = new Rc4Random(gameId);

// Create array shuffle method
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
var shuffle = function(o) {
    for(var j, x, i = o.length; i; j = parseInt(rc4Rand.getRandomNumber() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

// Get random 84 cards
var cardIds = [];
for (var i = 1; i <= totalCards; i++) {
   cardIds.push(i);
}

var cardIds = shuffle(cardIds);

$(function() {
    unsafeWindow.montreCarte = function(i) {
        $("#dvGdeCarte").html('<img src="' + cardsBaseUrl + '/' + i + '.' + imgExtension + '">');
        $("#dvGdeCarte").show();
    }

    $('img')
        .filter(function() {
            return $(this).attr('src').match(/[0-9]+\.png/);
        }).each(function(i, el) {
            // Get src
            var src = $(el).attr('src');
            
            // get onmouseover
            var onmouseover = $(el).attr('onmouseover');
            
            // Get originalId
            var originalCardId = src.match(/[0-9]+/)[0];
            
            // Get new card ID 
            var newCardId = cardIds[originalCardId - 1];
            //console.debug('original - new', originalCardId, newCardId);

            // Replace image path
            var newSrc = src.replace(originalCardId, newCardId)
            	.replace('img', cardsBaseUrl)
            	.replace('png', imgExtension);
            
            $(el).attr('src', newSrc);
            
            // Replace onmouseover
            var newOnmouseover = onmouseover.replace(originalCardId, newCardId);
            
            $(el).attr('onmouseover', newOnmouseover);
        });
});

// ==/UserScript==
    