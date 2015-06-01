<html>
<head>
	<script type="text/javascript" src="sorttable.js"></script>
</head>
<body>
<table class="sortable">
	<tr>
		<td>PP</td><td>Facebook</td><td>Twitter</td>
		<td>Population</td><td>FB per 100k</td><td>Twitter per 100k</td><td>Average per 100k</td>
	</tr>
<?php

include "config.php"; // twitter api key
include "lib/twitter.php";
include "lib/fetchUsingCache.php";

$ppeuParties = [
	"AT", "BE", "CZ", "DE", "EE", "ES", "FI", "FR", "GR",
	"HR", "LU", "NL", "PL", "RO", "SE", "SI", "UK"
	// TODO ,"IT", "CAT" << not in piratetimes api
];
$population = array(
	"AT" => 8527230,
	"BE" => 11203787,
	"CZ" => 10517400,
	"DE" => 80781000,
	"EE" => 1315819,
	"ES" => 46507800,
	"FI" => 5462939,
	"FR" => 65991000,
	"GR" => 11123034,
	"HR" => 4267558,
	"IT" => 60762320,
	"LU" => 549700,
	"NL" => 16868500,
	"PL" => 38496000,
	"RO" => 19942642,
	"SE" => 9705005,
	"SI" => 2063998,
	"UK" => 64105654
);

////////

$parties = array();
$twitterIds = array();


foreach ($ppeuParties as $partyCC) {

	$pirateTimesURL = "http://api.piratetimes.net/api/v1/parties/pp".strtolower($partyCC);
	
	if ($pirateTimesJSON = fetchJSONUsingCache($pirateTimesURL)) {

		// PirateTimes
		$fbId = $pirateTimesJSON->{"socialNetworks"}->{"facebook"}->{"id"}; 
		$twitterId = $pirateTimesJSON->{"socialNetworks"}->{"twitter"}->{"username"};
		$twitterIds[] = $twitterId;

		// FB
		$fbURL = "https://graph.facebook.com/".$fbId;
		$fbJSON = fetchJSONUsingCache($fbURL);
		$fbPop = $fbJSON->{"likes"};

		$parties[$partyCC] = array(
			"cc" => $partyCC,
			"fbPop" => $fbPop,
			"fbId" => $fbId,
			"twitterId" => $twitterId
		);
	}
}


// Twitter
$twitterQuery = urlencode(trim(implode(',', $twitterIds)));
$twitterURL = "https://api.twitter.com/1.1/users/lookup.json?screen_name=".$twitterQuery;
$twitterJSON = fetchJSONUsingCache($twitterURL);
foreach ($twitterJSON as $twitterResult) {
	foreach ($parties as $party) {
		if (strtolower($party["twitterId"]) == strtolower($twitterResult->{"screen_name"})) {
			$parties[$party["cc"]]["twitterPop"] = $twitterResult->{"followers_count"};
		}
	}
}

// Output
$popTotal = 0;
$fbPopTotal = 0;
$twitterPopTotal = 0;

foreach ($parties as $party) {
	$pop = $population[$party['cc']];
	$popTotal += $pop;
	$fbPopTotal += $party['fbPop'];
	$twitterPopTotal += $party['twitterPop'];
	$fbPer100k = $party['fbPop']/($pop/100000);
	$twitterPer100k = $party['twitterPop']/($pop/100000);

	echo tableRow(array(
		$party['cc'],
		'<a href="https://facebook.com/profile.php?id='
			.$party['fbId']
			.'">'
			.$party['fbPop']
			.'</a>',
		'<a href="https://twitter.com/'
			.$party['twitterId']
			.'">'
			.$party['twitterPop']
			.'</a>',
		$pop,
		round($fbPer100k),
		round($twitterPer100k),
		round(($fbPer100k+$twitterPer100k)/2)
	));
}

$fbPer100kTotal = $fbPopTotal/($popTotal/100000);
$twitterPer100kTotal = $twitterPopTotal/($popTotal/100000);

echo tableRow(array(
	'*',
	$fbPopTotal,
	$twitterPopTotal,
	$popTotal,
	round($fbPer100kTotal),
	round($twitterPer100kTotal),
	round(($fbPer100kTotal+$twitterPer100kTotal)/2)
));


////////// helpers

function tableRow($contentArray) {
	$out = '<tr>';
	foreach ($contentArray as $content) {
		$out .= '<td>'.$content.'</td>'."\n";
	}
	$out .= '</tr>'."\n";
	return $out;
}

?>
</table>
</body>
</html>