var exports = module.exports = {};

// I have commented out and replace the long tedious formal names of some countries
exports.countries = {
'AX':'Åland Islands',
'AL':'Albania',
'DZ':'Algeria',
'AS':'American Samoa',
'AD':'Andorra',
'AO':'Angola',
'AI':'Anguilla',
'AQ':'Antarctica',
'AG':'Antigua and Barbuda',
'AR':'Argentina',
'AM':'Armenia',
'AW':'Aruba',
'AU':'Australia',
'AT':'Austria',
'AZ':'Azerbaijan',
'BS':'Bahamas',
'BH':'Bahrain',
'BD':'Bangladesh',
'BB':'Barbados',
'BY':'Belarus',
'BE':'Belgium',
'BZ':'Belize',
'BJ':'Benin',
'BM':'Bermuda',
'BT':'Bhutan',
//'BO':'Bolivia (Plurinational State of)',
'BO':'Bolivia',
'BQ':'Bonaire, Sint Eustatius and Saba',
'BA':'Bosnia and Herzegovina',
'BW':'Botswana',
'BV':'Bouvet Island',
'BR':'Brazil',
'IO':'British Indian Ocean Territory',
'BN':'Brunei Darussalam',
'BG':'Bulgaria',
'BF':'Burkina Faso',
'BI':'Burundi',
'CV':'Cabo Verde',
'KH':'Cambodia',
'CM':'Cameroon',
'CA':'Canada',
'KY':'Cayman Islands',
'CF':'Central African Republic',
'TD':'Chad',
'CL':'Chile',
'CN':'China',
'CX':'Christmas Island',
'CC':'Cocos (Keeling) Islands',
'CO':'Colombia',
'KM':'Comoros',
'CG':'Congo',
'CD':'DR Congo',
//'CD':'Congo (Democratic Republic of the)',
'CK':'Cook Islands',
'CR':'Costa Rica',
'CI':'Côte d\'Ivoire',
'HR':'Croatia',
'CU':'Cuba',
'CW':'Curaçao',
'CY':'Cyprus',
'CZ':'Czechia',
'DK':'Denmark',
'DJ':'Djibouti',
'DM':'Dominica',
'DO':'Dominican Republic',
'EC':'Ecuador',
'EG':'Egypt',
'SV':'El Salvador',
'GQ':'Equatorial Guinea',
'ER':'Eritrea',
'EE':'Estonia',
'ET':'Ethiopia',
'FK':'Falkland Islands (Malvinas)',
'FO':'Faroe Islands',
'FJ':'Fiji',
'FI':'Finland',
'FR':'France',
'GF':'French Guiana',
'PF':'French Polynesia',
'TF':'French Southern Territories',
'GA':'Gabon',
'GM':'Gambia',
'GE':'Georgia',
'DE':'Germany',
'GH':'Ghana',
'GI':'Gibraltar',
'GR':'Greece',
'GL':'Greenland',
'GD':'Grenada',
'GP':'Guadeloupe',
'GU':'Guam',
'GT':'Guatemala',
'GG':'Guernsey',
'GN':'Guinea',
'GW':'Guinea-Bissau',
'GY':'Guyana',
'HT':'Haiti',
'HM':'Heard Island and McDonald Islands',
'VA':'Holy See',
'HN':'Honduras',
'HK':'Hong Kong',
'HU':'Hungary',
'IS':'Iceland',
'IN':'India',
'ID':'Indonesia',
//'IR':'Iran (Islamic Republic of)',
'IR':'Iran',
'IQ':'Iraq',
'IE':'Ireland',
'IM':'Isle of Man',
'IL':'Israel',
'IT':'Italy',
'JM':'Jamaica',
'JP':'Japan',
'JE':'Jersey',
'JO':'Jordan',
'KZ':'Kazakhstan',
'KE':'Kenya',
'KI':'Kiribati',
//'KP':'Korea (Democratic People\'s Republic of)',
'KP':'North Korea',
//'KR':'Korea (Republic of)',
'KR':'Korea',
'KW':'Kuwait',
'KG':'Kyrgyzstan',
//'LA':'Lao People\'s Democratic Republic',
'LA':'Laos',
'LV':'Latvia',
'LB':'Lebanon',
'LS':'Lesotho',
'LR':'Liberia',
'LY':'Libya',
'LI':'Liechtenstein',
'LT':'Lithuania',
'LU':'Luxembourg',
'MO':'Macao',
'MK':'Macedonia (the former Yugoslav Republic of)',
'MG':'Madagascar',
'MW':'Malawi',
'MY':'Malaysia',
'MV':'Maldives',
'ML':'Mali',
'MT':'Malta',
'MH':'Marshall Islands',
'MQ':'Martinique',
'MR':'Mauritania',
'MU':'Mauritius',
'YT':'Mayotte',
'MX':'Mexico',
'FM':'Micronesia (Federated States of)',
'MD':'Moldova (Republic of)',
'MC':'Monaco',
'MN':'Mongolia',
'ME':'Montenegro',
'MS':'Montserrat',
'MA':'Morocco',
'MZ':'Mozambique',
'MM':'Myanmar',
'NA':'Namibia',
'NR':'Nauru',
'NP':'Nepal',
'NL':'Netherlands',
'NC':'New Caledonia',
'NZ':'New Zealand',
'NI':'Nicaragua',
'NE':'Niger',
'NG':'Nigeria',
'NU':'Niue',
'NF':'Norfolk Island',
'MP':'Northern Mariana Islands',
'NO':'Norway',
'OM':'Oman',
'PK':'Pakistan',
'PW':'Palau',
'PS':'Palestine, State of',
'PA':'Panama',
'PG':'Papua New Guinea',
'PY':'Paraguay',
'PE':'Peru',
'PH':'Philippines',
'PN':'Pitcairn',
'PL':'Poland',
'PT':'Portugal',
'PR':'Puerto Rico',
'QA':'Qatar',
'RE':'Réunion',
'RO':'Romania',
//'RU':'Russian Federation',
'RU':'Russia',
'RW':'Rwanda',
'BL':'Saint Barthélemy',
'SH':'Saint Helena, Ascension and Tristan da Cunha',
'KN':'Saint Kitts and Nevis',
'LC':'Saint Lucia',
'MF':'Saint Martin (French part)',
'PM':'Saint Pierre and Miquelon',
'VC':'Saint Vincent and the Grenadines',
'WS':'Samoa',
'SM':'San Marino',
'ST':'Sao Tome and Principe',
'SA':'Saudi Arabia',
'SN':'Senegal',
'RS':'Serbia',
'SC':'Seychelles',
'SL':'Sierra Leone',
'SG':'Singapore',
'SX':'Sint Maarten (Dutch part)',
'SK':'Slovakia',
'SI':'Slovenia',
'SB':'Solomon Islands',
'SO':'Somalia',
'ZA':'South Africa',
'GS':'South Georgia and the South Sandwich Islands',
'SS':'South Sudan',
'ES':'Spain',
'LK':'Sri Lanka',
'SD':'Sudan',
'SR':'Suriname',
'SJ':'Svalbard and Jan Mayen',
'SZ':'Swaziland',
'SE':'Sweden',
'CH':'Switzerland',
'SY':'Syrian Arab Republic',
'TW':'Taiwan, Province of China',
'TJ':'Tajikistan',
'TZ':'Tanzania, United Republic of',
'TH':'Thailand',
'TL':'Timor-Leste',
'TG':'Togo',
'TK':'Tokelau',
'TO':'Tonga',
'TT':'Trinidad and Tobago',
'TN':'Tunisia',
'TR':'Turkey',
'TM':'Turkmenistan',
'TC':'Turks and Caicos Islands',
'TV':'Tuvalu',
'UG':'Uganda',
'UA':'Ukraine',
'AE':'United Arab Emirates',
//'GB':'United Kingdom of Great Britain and Northern Ireland',
'GB':'United Kingdom',
//'US':'United States of America',
'US':'USA',
'UM':'United States Minor Outlying Islands',
'UY':'Uruguay',
'UZ':'Uzbekistan',
'VU':'Vanuatu',
//'VE':'Venezuela (Bolivarian Republic of)',
'VE':'Venezuela',
'VN':'Viet Nam',
'VG':'Virgin Islands (British)',
'VI':'Virgin Islands (U.S.)',
'WF':'Wallis and Futuna',
'EH':'Western Sahara',
'YE':'Yemen',
'ZM':'Zambia',
'ZW':'Zimbabwe',
}

exports.regions = {
  'AF':'Asia',
  'AX':'Europe',
  'AL':'Europe',
  'DZ':'Africa',
  'AS':'Oceania',
  'AD':'Europe',
  'AO':'Africa',
  'AI':'Americas',
  'AQ':'',
  'AG':'Americas',
  'AR':'Americas',
  'AM':'Asia',
  'AW':'Americas',
  'AU':'Oceania',
  'AT':'Europe',
  'AZ':'Asia',
  'BS':'Americas',
  'BH':'Asia',
  'BD':'Asia',
  'BB':'Americas',
  'BY':'Europe',
  'BE':'Europe',
  'BZ':'Americas',
  'BJ':'Africa',
  'BM':'Americas',
  'BT':'Asia',
  'BO':'Americas',
  'BQ':'Americas',
  'BA':'Europe',
  'BW':'Africa',
  'BV':'Americas',
  'BR':'Americas',
  'IO':'Africa',
  'BN':'Asia',
  'BG':'Europe',
  'BF':'Africa',
  'BI':'Africa',
  'CV':'Africa',
  'KH':'Asia',
  'CM':'Africa',
  'CA':'Americas',
  'KY':'Americas',
  'CF':'Africa',
  'TD':'Africa',
  'CL':'Americas',
  'CN':'Asia',
  'CX':'Oceania',
  'CC':'Oceania',
  'CO':'Americas',
  'KM':'Africa',
  'CG':'Africa',
  'CD':'Africa',
  'CK':'Oceania',
  'CR':'Americas',
  'CI':'Africa',
  'HR':'Europe',
  'CU':'Americas',
  'CW':'Americas',
  'CY':'Asia',
  'CZ':'Europe',
  'DK':'Europe',
  'DJ':'Africa',
  'DM':'Americas',
  'DO':'Americas',
  'EC':'Americas',
  'EG':'Africa',
  'SV':'Americas',
  'GQ':'Africa',
  'ER':'Africa',
  'EE':'Europe',
  'ET':'Africa',
  'FK':'Americas',
  'FO':'Europe',
  'FJ':'Oceania',
  'FI':'Europe',
  'FR':'Europe',
  'GF':'Americas',
  'PF':'Oceania',
  'TF':'Africa',
  'GA':'Africa',
  'GM':'Africa',
  'GE':'Asia',
  'DE':'Europe',
  'GH':'Africa',
  'GI':'Europe',
  'GR':'Europe',
  'GL':'Americas',
  'GD':'Americas',
  'GP':'Americas',
  'GU':'Oceania',
  'GT':'Americas',
  'GG':'Europe',
  'GN':'Africa',
  'GW':'Africa',
  'GY':'Americas',
  'HT':'Americas',
  'HM':'Oceania',
  'VA':'Europe',
  'HN':'Americas',
  'HK':'Asia',
  'HU':'Europe',
  'IS':'Europe',
  'IN':'Asia',
  'ID':'Asia',
  'IR':'Asia',
  'IQ':'Asia',
  'IE':'Europe',
  'IM':'Europe',
  'IL':'Asia',
  'IT':'Europe',
  'JM':'Americas',
  'JP':'Asia',
  'JE':'Europe',
  'JO':'Asia',
  'KZ':'Asia',
  'KE':'Africa',
  'KI':'Oceania',
  'KP':'Asia',
  'KR':'Asia',
  'KW':'Asia',
  'KG':'Asia',
  'LA':'Asia',
  'LV':'Europe',
  'LB':'Asia',
  'LS':'Africa',
  'LR':'Africa',
  'LY':'Africa',
  'LI':'Europe',
  'LT':'Europe',
  'LU':'Europe',
  'MO':'Asia',
  'MK':'Europe',
  'MG':'Africa',
  'MW':'Africa',
  'MY':'Asia',
  'MV':'Asia',
  'ML':'Africa',
  'MT':'Europe',
  'MH':'Oceania',
  'MQ':'Americas',
  'MR':'Africa',
  'MU':'Africa',
  'YT':'Africa',
  'MX':'Americas',
  'FM':'Oceania',
  'MD':'Europe',
  'MC':'Europe',
  'MN':'Asia',
  'ME':'Europe',
  'MS':'Americas',
  'MA':'Africa',
  'MZ':'Africa',
  'MM':'Asia',
  'NA':'Africa',
  'NR':'Oceania',
  'NP':'Asia',
  'NL':'Europe',
  'NC':'Oceania',
  'NZ':'Oceania',
  'NI':'Americas',
  'NE':'Africa',
  'NG':'Africa',
  'NU':'Oceania',
  'NF':'Oceania',
  'MP':'Oceania',
  'NO':'Europe',
  'OM':'Asia',
  'PK':'Asia',
  'PW':'Oceania',
  'PS':'Asia',
  'PA':'Americas',
  'PG':'Oceania',
  'PY':'Americas',
  'PE':'Americas',
  'PH':'Asia',
  'PN':'Oceania',
  'PL':'Europe',
  'PT':'Europe',
  'PR':'Americas',
  'QA':'Asia',
  'RE':'Africa',
  'RO':'Europe',
  'RU':'Europe',
  'RW':'Africa',
  'BL':'Americas',
  'SH':'Africa',
  'KN':'Americas',
  'LC':'Americas',
  'MF':'Americas',
  'PM':'Americas',
  'VC':'Americas',
  'WS':'Oceania',
  'SM':'Europe',
  'ST':'Africa',
  'SA':'Asia',
  'SN':'Africa',
  'RS':'Europe',
  'SC':'Africa',
  'SL':'Africa',
  'SG':'Asia',
  'SX':'Americas',
  'SK':'Europe',
  'SI':'Europe',
  'SB':'Oceania',
  'SO':'Africa',
  'ZA':'Africa',
  'GS':'Americas',
  'SS':'Africa',
  'ES':'Europe',
  'LK':'Asia',
  'SD':'Africa',
  'SR':'Americas',
  'SJ':'Europe',
  'SZ':'Africa',
  'SE':'Europe',
  'CH':'Europe',
  'SY':'Asia',
  'TW':'Asia',
  'TJ':'Asia',
  'TZ':'Africa',
  'TH':'Asia',
  'TL':'Asia',
  'TG':'Africa',
  'TK':'Oceania',
  'TO':'Oceania',
  'TT':'Americas',
  'TN':'Africa',
  'TR':'Asia',
  'TM':'Asia',
  'TC':'Americas',
  'TV':'Oceania',
  'UG':'Africa',
  'UA':'Europe',
  'AE':'Asia',
  'GB':'Europe',
  'US':'Americas',
  'UM':'Oceania',
  'UY':'Americas',
  'UZ':'Asia',
  'VU':'Oceania',
  'VE':'Americas',
  'VN':'Asia',
  'VG':'Americas',
  'VI':'Americas',
  'WF':'Oceania',
  'EH':'Africa',
  'YE':'Asia',
  'ZM':'Africa',
  'ZW':'Africa',
}
