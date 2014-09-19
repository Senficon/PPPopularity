<?
define('CACHE_FILE', "cache.txt");
define('CACHE_EXPIRES_SECONDS', 24*60*60);

$cacheLines = file(CACHE_FILE);
removeExpiredItems();


function addToCache($url, $jsonString) {
	$newCacheLine = $url."***".time()."***".$jsonString."\n";
	$file = fopen(CACHE_FILE, "a");
	fwrite($file, $newCacheLine);
	fclose($file);
}

function removeExpiredItems() {
	global $cacheLines;

	$unexpiredCacheLines = array();
	foreach ($cacheLines as $cacheLine) {
		if (time()-$cache[1] < CACHE_EXPIRES_SECONDS) { //non-expired
			$unexpiredCacheLines[] = $cacheLine;
		}
	}
	if (count($unexpiredCacheLines) != count($cacheLines)) { // changed
		$unexpiredCache = implode("", $unexpiredCacheLines);
		$file = fopen(CACHE_FILE, "w");
		fwrite($file, $unexpiredCache);
		fclose($file);

		$cacheLines = $unexpiredCacheLines; // for rest of script
	}
}

function fetchFromCache($url) {
	global $cacheLines;
	$result = false;

	foreach ($cacheLines as $cacheLine) {
		$cache = explode("***", $cacheLine);
		if ($cache[0] == $url) { // it's what we're looking for
			///echo "Found {$url} in cache.<br />\n";
			$result = $cache[2];
			break;
		}
	}

	return $result;
}

function fetchJSONUsingCache($url) {
	
	if (!($jsonString = fetchFromCache($url))) { // check cache
		///echo "Fetching {$url}...<br />\n";
		if (strpos($url, "api.twitter.com")) { // twitter needs auth
			$jsonString = fetchTwitterJSON($url);
		} else { // regular old url
			$result = @file($url);
			if (is_array($result)) {
				$jsonString = implode("", $result);
			} else {
				return false; // couldn't fetch
			}
		}
		addToCache($url, $jsonString);
	}

	return json_decode($jsonString);
}?>