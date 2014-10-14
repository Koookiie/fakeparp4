 function quirk(character,text)
{
var finaltext = ""

text = text.replace(/\[[cC][aA][pP][sS]\](.*?)\[\/[cC][aA][pP][sS]\](?![^<>]*>)/g, '¦¬¬¬¬¦ $1 ¦¬¬¬¦¦');
text = text.replace(/\[[wW][hH][iI][sS][pP][eE][rR]\](.*?)\[\/[wW][hH][iI][sS][pP][eE][rR]\](?![^<>]*>)/g, '¦¬¬¬¦ $1 ¦¬¬¦¦');

if (character == "john") /** JOHN EGBERT **/
{
var colour = "0715CD"
finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "rose") /** ROSE LALONDE **/
{
var colour = "B536DA"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "jaspersprite") /** JASPERSPRITE **/
{
var colour = "F141EF"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
}

if (character == "calsprite") /** CALSPRITE **/
{
var colour = "F2A400"

finaltext = text.toUpperCase();
finaltext = finaltext.replace(/A|D|G|J|M|P|S|V|Y(?![^<>]*>)/g, '¢');
finaltext = finaltext.replace(/B|E|H|K|N|Q|T|W|Z(?![^<>]*>)/g, '$');
finaltext = finaltext.replace(/C|F|I|L|O|R|U|X(?![^<>]*>)/g, '£');
finaltext = finaltext.replace(/¢(?![^<>]*>)/g, ' HAA');
finaltext = finaltext.replace(/\$(?![^<>]*>)/g, ' HEE');
finaltext = finaltext.replace(/£(?![^<>]*>)/g, ' HOO');
finaltext = finaltext.replace(/^\s(?![^<>]*>)/g, '');
}

if (character == "signless") /** THE SIGNLESS **/
{
var colour = "626262"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "summoner") /** THE SUMMONER **/
{
var colour = "A15000"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/\.(?![^<>]*>)/g, ',');
finaltext = finaltext.replace(/[iI](?![^<>]*>)/g, '1');
}

if (character == "psi") /** THE Ψiioniic **/
{
var colour = "A1A100"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/psi|psy(?![^<>]*>)/g, 'ψi');
finaltext = finaltext.replace(/Psi|Psy(?![^<>]*>)/g, 'Ψi');
finaltext = finaltext.replace(/PSI|PSY(?![^<>]*>)/g, 'Ψi');
finaltext = finaltext.replace(/([iI])(?![^<>]*>)/g, '$1$1');
finaltext = finaltext.replace(/([sS])(?![^<>]*>)/g, '2');
}

if (character == "helmsman") /** THE HELMSMAN **/
{
var colour = "A1A100"

finaltext = text.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/\s(?![^<>]*>)/g, '');
finaltext = finaltext.toUpperCase();
finaltext = finaltext.replace(/(\w\w)(?![^<>]*>)/g, ' $1');
finaltext = finaltext.replace(/(\w\w)(\.$)(?![^<>]*>)/g, '$1 ..');
finaltext = finaltext.replace(/(\w\w)(!$)(?![^<>]*>)/g, '$1 !!');
finaltext = finaltext.replace(/(\w\w)(\?$)(?![^<>]*>)/g, '$1 ??');
finaltext = finaltext.replace(/(\w\w)(\w$)(?![^<>]*>)/g, '$1 $2$2');
finaltext = finaltext.replace(/(\s\w)\.($|\s)(?![^<>]*>)/g, '$10 ..$2');
finaltext = finaltext.replace(/(\s\w\w)\.($|\s)(?![^<>]*>)/g, '$1 ..$2');
finaltext = finaltext.replace(/(\s\w)!($|\s)(?![^<>]*>)/g, '$10 !!$2');
finaltext = finaltext.replace(/(\s\w\w)!($|\s)(?![^<>]*>)/g, '$1 !!$2');
finaltext = finaltext.replace(/(\s\w)\?($|\s)(?![^<>]*>)/g, '$10 ??$2');
finaltext = finaltext.replace(/(\s\w\w)\?($|\s)(?![^<>]*>)/g, '$1 ??$2');
finaltext = finaltext.replace(/(\s\w)(\s)(?![^<>]*>)/g, '$10$2');
finaltext = finaltext.replace(/(\w\w)(\w)\.(?![^<>]*>)/g, '$1 $2$2 ..');
finaltext = finaltext.replace(/(\w\w)(\w)!(?![^<>]*>)/g, '$1 $2$2 !!');
finaltext = finaltext.replace(/(\w\w)(\w)\?(?![^<>]*>)/g, '$1 $2$2 ??');
finaltext = finaltext.replace(/(\w\w)(\w)(?![^<>]*>)/g, '$1 $2$2');
finaltext = finaltext.replace(/(^|\W)(\w)\.(?![^<>]*>)/g, '$1 $2$2 ..');
finaltext = finaltext.replace(/[oO](?![^<>]*>)/g, '0');
finaltext = finaltext.replace(/[iI](?![^<>]*>)/g, '1');
finaltext = finaltext.replace(/[eE](?![^<>]*>)/g, '3');
finaltext = finaltext.replace(/[aA](?![^<>]*>)/g, '4');
finaltext = finaltext.replace(/[gG](?![^<>]*>)/g, '6');
finaltext = finaltext.replace(/[zZ](?![^<>]*>)/g, '2');
finaltext = finaltext.replace(/[sS](?![^<>]*>)/g, '5');
finaltext = finaltext.replace(/[tT](?![^<>]*>)/g, '7');
finaltext = finaltext.replace(/[bB](?![^<>]*>)/g, '8');
}

if (character == "dave") /** DAVE STRIDER **/
{
var colour = "E00707"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "davesprite") /** DAVESPRITE **/
{
var colour = "F2A400"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "jade") /** JADE HARLEY **/
{
var colour = "4AC925"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^]([:;]b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "jadesprite") /** JADESPRITE **/
{
var colour = "1F9400"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^]([:;]b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "dirk") /** DIRK STRIDER **/
{
var colour = "F2A400"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "jake") /** JAKE ENGLISH **/
{
var colour = "1F9400"

finaltext = text.replace(/'(?![^<>]*>)/g, '');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^]([:;]p)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "jane") /** JANE CROCKER **/
{
var colour = "00D5F2"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "roxy") /** ROXY LALONDE **/
{
var colour = "FF6FF2"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "aranea" || character == "vriska" || character == "mindfang" ) /** THE SERKETS **/
{
var colour = "005682"

finaltext = text.replace(/[bB](?![^<>]*>)/g, '8');
finaltext = finaltext.replace(/\(m\)(?![^<>]*>)/g, '♏');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "disciple" ) /** THE DISCIPLE **/
{
var colour = "416600"

finaltext = text.replace(/[eE][eE](?![^<>]*>)/g, '33');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
}

if (character == "dolorosa" ) /** THE DOLOROSA **/
{
var colour = "008141"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/(\w),(\s\w)(?![^<>]*>)/g, '$1$2');
}


if (character == "cronus" || character == "dualscar") /** CRONUS AMPORA & DUALSCAR **/
{
var colour = "6A006A"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/([^|\s])v(?![^<>]*>)/g, '$1w');
finaltext = finaltext.replace(/([^|\s])V(?![^<>]*>)/g, '$1W');
finaltext = finaltext.replace(/\bv|w\b(?![^<>]*>)/g, 'α');
finaltext = finaltext.replace(/w|v(?![^<>]*>)/g, 'φ');
finaltext = finaltext.replace(/α(?![^<>]*>)/g, 'wv');
finaltext = finaltext.replace(/φ(?![^<>]*>)/g, 'vw');
finaltext = finaltext.replace(/\bV|W\b(?![^<>]*>)/g, 'Ά');
finaltext = finaltext.replace(/W|V(?![^<>]*>)/g, 'Á');
finaltext = finaltext.replace(/Ά(?![^<>]*>)/g, 'WV');
finaltext = finaltext.replace(/Á(?![^<>]*>)/g, 'VW');
finaltext = finaltext.replace(/B(?![^<>]*>)/g, '8');
finaltext = finaltext.replace(/(\w)vws(\s|\.|!|\?|$)(?![^<>]*>)/g, '$1wvs$2');
finaltext = finaltext.replace(/(\w)VWS(\s|\.|!|\?|$)(?![^<>]*>)/g, '$1WVS$2');
finaltext = finaltext.replace(/(\w)\.(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/[\s|^]([:;]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "damara") /** DAMARA MEGIDO **/
{
var colour = "A10000"
finaltext = text.toUpperCase();
}

if (character == "horuss") /** HORUSS ZAHHAK **/
{
var colour = "000056"
finaltext = text.replace(/[lL][oO][oO](?![^<>]*>)/g, '100');
finaltext = finaltext.replace(/[xX](?![^<>]*>)/g, '%');
finaltext = finaltext.replace(/(\b[sS][tT][rR][oO][nN][gG]\w*)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\b[sS][tT][rR][eE][nN][gG][tT][hH]\w*)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[oO][oO][lL](?![^<>]*>)/g, '001');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = '8=D < ' + finaltext;
}

if (character == "darkleer") /** EXECUTOR DARKLEER **/
{
var colour = "000056"
finaltext = text.replace(/[lL][oO][oO](?![^<>]*>)/g, '100');
finaltext = finaltext.replace(/[xX](?![^<>]*>)/g, '%');
finaltext = finaltext.replace(/(\b[sS][tT][rR][oO][nN][gG]\w*)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\b[sS][tT][rR][eE][nN][gG][tT][hH]\w*)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[oO][oO][lL](?![^<>]*>)/g, '001');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = '-+-> ' + finaltext;
}

if (character == "kankri") /** KANKRI VANTAS **/
{
var colour = "FF0000"
finaltext = text.replace(/[bB](?![^<>]*>)/g, '6');
finaltext = finaltext.replace(/[oO](?![^<>]*>)/g, '9');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "redglare") /** NEOPHYTE REDGLARE **/
{
var colour = "008282"
finaltext = text.replace(/[aA](?![^<>]*>)/g, '4');
finaltext = text.replace(/[iI](?![^<>]*>)/g, '1');
finaltext = text.replace(/[eE](?![^<>]*>)/g, '3');
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "kurloz") /** KURLOZ MAKARA **/
{
var colour = "2B0057"
finaltext = text.toUpperCase();
finaltext = 'SIGNS: < ' + finaltext + ' >'
}

if (character == "latula") /** LATULA PYROPE **/
{
var colour = "008282"
finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/[aA](?![^<>]*>)/g, '4');
finaltext = finaltext.replace(/[iI](?![^<>]*>)/g, '1');
finaltext = finaltext.replace(/[eE](?![^<>]*>)/g, '3');
finaltext = finaltext.replace(/[\s|^|>|&gt;]([:;8x]d)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^|>|&gt;]([:;8x]o)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^|>|&gt;]([:;8x]p)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "meenah" || character == "hic") /** MEENAH PEIXES & HER IMPERIOUS CONDESCENSION **/
{
var colour = "77003C"
finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/E(?![^<>]*>)/g, '-E');
finaltext = finaltext.replace(/H(?![^<>]*>)/g, ')(');
finaltext = finaltext.replace(/[\s|^](3[8x][odp])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "meulin") /** MEULIN LEIJON **/
{
var colour = "416600"
finaltext = text.toUpperCase();
finaltext = finaltext.replace(/[eE][eE](?![^<>]*>)/g, '33');
finaltext = '(^･ω･^) < ' + finaltext
}

if (character == "mituna") /** MITUNA CAPTOR **/
{
var colour = "A1A100"
finaltext = text.toUpperCase();
finaltext = finaltext.replace(/O(?![^<>]*>)/g, '0');
finaltext = finaltext.replace(/I(?![^<>]*>)/g, '1');
finaltext = finaltext.replace(/E(?![^<>]*>)/g, '3');
finaltext = finaltext.replace(/A(?![^<>]*>)/g, '4');
finaltext = finaltext.replace(/S(?![^<>]*>)/g, '5');
finaltext = finaltext.replace(/T(?![^<>]*>)/g, '7');
finaltext = finaltext.replace(/B(?![^<>]*>)/g, '8');
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
}

if (character == "porrim") /** PORRIM MARYAM **/
{
var colour = "008141"
finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/o(?![^<>]*>)/g, 'o+');
finaltext = finaltext.replace(/0(?![^<>]*>)/g, '0+');
finaltext = finaltext.replace(/(^|\s)[pP]lus(\W|$)(?![^<>]*>)/g, '$1+$2');
finaltext = finaltext.replace(/(^|\s)PLUS(\W|$)(?![^<>]*>)/g, '$1+$2');
}

if (character == "rufioh") /** RUFIOH NITRAM **/
{
var colour = "A15000"
finaltext = text.toLowerCase();
finaltext = finaltext.replace(/i(?![^<>]*>)/g, '1');
finaltext = finaltext.replace(/(^|\s)ass(\W|$)(?![^<>]*>)/g, '$1*ss$2');
finaltext = finaltext.replace(/(^|\s)cripple(\W|$)(?![^<>]*>)/g, '$1cr*pple$2');
finaltext = finaltext.replace(/damn(?![^<>]*>)/g, 'd*mn');
finaltext = finaltext.replace(/(^|\s)fuck1ng(\W|$)(?![^<>]*>)/g, '$1f***1ng$2');
finaltext = finaltext.replace(/fuck(?![^<>]*>)/g, 'f*ck');
finaltext = finaltext.replace(/(^|\s)hell(\W|$)(?![^<>]*>)/g, '$1h*ll$2');
finaltext = finaltext.replace(/(^|\s)mutant(\W|$)(?![^<>]*>)/g, '$1m*tant$2');
finaltext = finaltext.replace(/(^|\s)sh1t(\W|$)(?![^<>]*>)/g, '$1sh*t$2');
finaltext = finaltext.replace(/[\s|^|}](:O)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/[\s|^|}](:[dp])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "aradia") /** ARADIA MEGIDO **/
{
var colour = "A10000"
finaltext = text.toLowerCase();
finaltext = finaltext.replace(/[oO](?![^<>]*>)/g, '0');
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
}

if (character == "aradiab") /** ARADIA MEGIDO GODTIER**/
{
var colour = "A10000"
finaltext = text.toLowerCase();
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[\s|^]([:;][dop])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "equius") /** EQUIUS ZAHHAK **/
{
var colour = "000056"
finaltext = text.replace(/[lL][oO][oO](?![^<>]*>)/g, '100');
finaltext = finaltext.replace(/[xX](?![^<>]*>)/g, '%');
finaltext = finaltext.replace(/(\b[sS][tT][rR][oO][nN][gG]\w*)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[oO][oO][lL](?![^<>]*>)/g, '001');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = 'D --> ' + finaltext;
}

if (character == "arquius") /** ARQUIUSPRITE **/
{
var colour = "E00707"
finaltext = text.replace(/[lL][oO][oO](?![^<>]*>)/g, '100');
finaltext = finaltext.replace(/[xX](?![^<>]*>)/g, '%');
finaltext = finaltext.replace(/(\b[sS][tT][rR][oO][nN][gG]\w*)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[oO][oO][lL](?![^<>]*>)/g, '001');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([sS])hit(?![^<>]*>)/g, '$1▓▒▒');
finaltext = finaltext.replace(/([fF])ucking(?![^<>]*>)/g, '$1▒▓▒▒▒▒');
finaltext = finaltext.replace(/([fF])ucker(?![^<>]*>)/g, '$1▒▓▒▒▒');
finaltext = finaltext.replace(/(^|\s)([aA])ss(\W|$)(?![^<>]*>)/g, '$1$2▒▒$3');
finaltext = finaltext.replace(/([fF])uck(?![^<>]*>)/g, '$1▒▒▓');
finaltext = finaltext.replace(/([bB])itch(?![^<>]*>)/g, '$1▒▓▒▒');
finaltext = finaltext.replace(/([hH])ell(?![^<>]*>)/g, '$1▒▒▒');
finaltext = finaltext.replace(/([dD])amn(?![^<>]*>)/g, '$1▒▒▒');
/** finaltext = '◥▶◀◤ —> ' + finaltext; **/
finaltext = '¦arq1¦ ' + finaltext;
}

if (character == "eridan") /** ERIDAN AMPORA **/
{
var colour = "6A006A"
finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/([vVwW])(?![^<>]*>)/g, '$1$1');
finaltext = finaltext.replace(/[\s|^]([:;][dop])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "handmaid") /** THE HANDMAID **/
{
var colour = "A10000"
finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/([oO])(?![^<>]*>)/g, 'Ø');
}


if (character == "feferi" ) /** FEFERI PEIXES **/
{
var colour = "77003C"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[hH](?![^<>]*>)/g, ')(');
finaltext = finaltext.replace(/E(?![^<>]*>)/g, '-E');
}

if (character == "gamzee" ) /** GAMZEE MAKARA **/
{
var colour = "2B0057"

finaltext = text.toLowerCase();
finaltext = finaltext.replace(/([\w\s]|[\w'\w])([\w'\w]|[\w\s])?(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/:O\)/g, ':o)');
finaltext = finaltext.replace(/;O\)/g, ';o)');
}

if (character == "kanaya" ) /** KANAYA MARYAM **/
{
var colour = "008141"

finaltext = text.replace(/'(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/(^[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\s[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(-[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/(\w),(\s\w)(?![^<>]*>)/g, '$1$2');
}

if (character == "karkat" ) /** KARKAT VANTAS **/
{
var colour = "626262"

finaltext = text.toUpperCase();
finaltext = finaltext.replace(/¦¬¬¬¦(.*?)¦¬¬¦¦/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
}

if (character == "caliborn" ) /** CALIBORN **/
{
var colour = "323232"

finaltext = text.toUpperCase();
finaltext = finaltext.replace(/U(?![^<>]*>)/g, 'u');
}

if (character == "le" ) /** LORD ENGLISH **/
{
var colour = "2ED73A"

finaltext = text.toUpperCase();
}

if (character == "calliope" ) /** CALLIOPE **/
{
var colour = "929292"

finaltext = text.toLowerCase();
finaltext = finaltext.replace(/u_(\S)(?![^<>]*>)/g, '£_$1');
finaltext = finaltext.replace(/(\S)_u(?![^<>]*>)/g, '$1_£');
finaltext = finaltext.replace(/u(?![^<>]*>)/g, 'U');
finaltext = finaltext.replace(/_£(?![^<>]*>)/g, '_u');
finaltext = finaltext.replace(/£_(?![^<>]*>)/g, 'u_');
}



if (character == "ghb" ) /** GRAND HIGHBLOOD **/
{
var colour = "2B0057"
finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "nepeta") /** NEPETA LEIJON **/
{
var colour = "416600"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[eE][eE](?![^<>]*>)/g, '33');
finaltext = finaltext.replace(/[\s|^]([:;][dp][dp])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](dd[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = ':33 < ' + finaltext;
}

if (character == "fefeta") /** FEFETASPRITE **/
{
var colour = "B536DA"

finaltext = text.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[!|\?|\.](\s\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](i)['|\W|$](?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/[eE][eE](?![^<>]*>)/g, '33');
finaltext = finaltext.replace(/[hH](?![^<>]*>)/g, ')(');
finaltext = finaltext.replace(/E(?![^<>]*>)/g, '-E');
finaltext = '3833 < ' + finaltext;
}

if (character == "sollux") /** SOLLUX CAPTOR **/
{
var colour = "A1A100"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(^|\s)to(\W|$)(?![^<>]*>)/g, '$1two$2');
finaltext = finaltext.replace(/(^|\s)TO(\W|$)(?![^<>]*>)/g, '$1TWO$2');
finaltext = finaltext.replace(/(^|\s)too(\W|$)(?![^<>]*>)/g, '$1two$2');
finaltext = finaltext.replace(/(^|\s)TOO(\W|$)(?![^<>]*>)/g, '$1TWO$2');
finaltext = finaltext.replace(/(^|\s)together(\W|$)(?![^<>]*>)/g, '$1twogether$2');
finaltext = finaltext.replace(/(^|\s)TOGETHER(\W|$)(?![^<>]*>)/g, '$1TWOGETHER$2');
finaltext = finaltext.replace(/(^|\s)tonight(\W|$)(?![^<>]*>)/g, '$1twonight$2');
finaltext = finaltext.replace(/(^|\s)TONIGHT(\W|$)(?![^<>]*>)/g, '$1TWONIGHT$2');
finaltext = finaltext.replace(/(^|\s)today(\W|$)(?![^<>]*>)/g, '$1twoday$2');
finaltext = finaltext.replace(/(^|\s)TODAY(\W|$)(?![^<>]*>)/g, '$1TWODAY$2');
finaltext = finaltext.replace(/(^|\s)tomorrow(\W|$)(?![^<>]*>)/g, '$1twomorrow$2');
finaltext = finaltext.replace(/(^|\s)TOMORROW(\W|$)(?![^<>]*>)/g, '$1TWOMORROW$2');
finaltext = finaltext.replace(/([iI])(?![^<>]*>)/g, '$1$1');
finaltext = finaltext.replace(/([sS])(?![^<>]*>)/g, '2');
}

if (character == "erisol") /** ERISOLSPRITE **/
{
var colour = "4AC925"

finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([iI])(?![^<>]*>)/g, '$1$1');
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/([sS])(?![^<>]*>)/g, '2');
finaltext = finaltext.replace(/([vVwW])(?![^<>]*>)/g, '$1$1');
finaltext = finaltext.replace(/[\s|^]([:;][dop])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[\s|^](d[:;])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "solluxb") /** SOLLUX CAPTOR BLIND **/
{
var colour = "A1A100"
finaltext = text.replace(/([A-Z][a-z]+\b)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/(\b)([A-Z][A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.replace(/(\b)([A-Z]'[A-Z]+)(\b)(?![^<>]*>)/g, '¥$2¥');
finaltext = finaltext.toLowerCase();
finaltext = finaltext.replace(/¥([\w|']+)¥(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/¥(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/([A-Z]\W[a-z]\W[A-Z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/([A-Z]'[a-z])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/[oO](?![^<>]*>)/g, '0');
}

if (character == "tavros") /** TAVROS NITRAM **/
{
var colour = "A15000"

//finaltext = text.toUpperCase();
finaltext = text.replace(/(?:^|¦¬¬¦¦)(.*?)(?:$|¦¬¬¬¦)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/^(\w)/, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/([iI])\b(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/[\.\?!](?![^<>]*>)/g, ',');
finaltext = finaltext.replace(/(,\s?\w)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/[\s|^|}](:O)(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
finaltext = finaltext.replace(/[\s|^|}](:[dp])(?![^<>]*>)/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
}

if (character == "terezi") /** TEREZI PYROPE **/
{
var colour = "008282"

finaltext = text.toUpperCase();
finaltext = finaltext.replace(/[aA](?![^<>]*>)/g, '4');
finaltext = finaltext.replace(/[iI](?![^<>]*>)/g, '1');
finaltext = finaltext.replace(/[eE](?![^<>]*>)/g, '3');
finaltext = finaltext.replace(/(\w)'(\w)(?![^<>]*>)/g, '$1$2');
finaltext = finaltext.replace(/(\w)\.$(?![^<>]*>)/g, '$1');
finaltext = finaltext.replace(/¦¬¬¬¦(.*?)¦¬¬¦¦/g, function(a,x){ return a.replace(x,x.toLowerCase()); });
}

if (character == "panda") /** XxTEH PANDA KINGxX **/
{
var colour = Math.floor(Math.random()*16777215).toString(16);
var bbcoderem = "";
finaltext = text.toLowerCase();
if(finaltext.match(/<(.*?)>(?![^<>]*>)/g)){
    var bbcoderem = " <BBCODE REMOVED xD> ";
}
// finaltext = finaltext.replace(/<br>/gi, '¦br¦');
finaltext = finaltext.replace(/<(.*?)>(?![^<>]*>)/g, '');
finaltext = finaltext.replace(/color(?![^<>]*>)/g, 'colarz');
finaltext = finaltext.replace(/colour(?![^<>]*>)/g, 'coularz');
finaltext = finaltext.replace(/y e s(?![^<>]*>)/g, 'BURRITO!!!');
finaltext = finaltext.replace(/ye s(?![^<>]*>)/g, 'PANCAKE MIXS');
finaltext = finaltext.replace(/fuckass(?![^<>]*>)/g, 'featherduster');
finaltext = finaltext.replace(/homestuck(?![^<>]*>)/g, 'homestuck ＼(=^‥^)/’');
finaltext = finaltext.replace(/y es(?![^<>]*>)/g, 'i once tried dying my hair but it goes back to teh pinks because it no likeys the blue');
finaltext = finaltext.replace(/b i t c h(?![^<>]*>)/g, 'grrrz (◞≼◉ื≽◟ ;益;◞≼◉ื≽◟)Ψ');
finaltext = finaltext.replace(/a s s(?![^<>]*>)/g, 'poo poo hole');
finaltext = finaltext.replace(/stink(?![^<>]*>)/g, 'stinkay');
finaltext = finaltext.replace(/:\)(?![^<>]*>)/g, 'xD');
finaltext = finaltext.replace(/:\((?![^<>]*>)/g, 'DX');
finaltext = finaltext.replace(/them(?![^<>]*>)/g, 'thems');
finaltext = finaltext.replace(/like(?![^<>]*>)/g, 'likeys');
finaltext = finaltext.replace(/f u c k(?![^<>]*>)/g, 'FIDDLY DIDDLY!');
finaltext = finaltext.replace(/lol(?![^<>]*>)/g, 'LOLZ o◖(≧∀≦)◗o');
finaltext = finaltext.replace(/:3(?![^<>]*>)/g, 'x3');
finaltext = finaltext.replace(/you(?![^<>]*>)/g, 'u');
finaltext = finaltext.replace(/omg(?![^<>]*>)/g, 'ZOMGZ!!11');
finaltext = finaltext.replace(/yo (?![^<>]*>)/g, 'im a gangzters');
finaltext = finaltext.replace(/nipple(?![^<>]*>)/g, 'tinkle winkle');
finaltext = finaltext.replace(/ hey(?![^<>]*>)/g, 'hay');
finaltext = finaltext.replace(/fuck off(?![^<>]*>)/g, 'my pits smell like applesauce with cream cheese!');
finaltext = finaltext.replace(/omfg(?![^<>]*>)/g, 'oh my freaking gog!! xD');
finaltext = finaltext.replace(/oh my god(?![^<>]*>)/g, 'oh my gob');
finaltext = finaltext.replace(/she(?![^<>]*>)/g, 'her');
finaltext = finaltext.replace(/have(?![^<>]*>)/g, 'has');
finaltext = finaltext.replace(/my(?![^<>]*>)/g, 'mah');
finaltext = finaltext.replace(/im done(?![^<>]*>)/g, 'RAWR MEANS I LOVE YOU IN DINOSAUR!');
finaltext = finaltext.replace(/im so done(?![^<>]*>)/g, 'RAWR MEANS I LOVE YOU IN DINOSAUR!');
finaltext = finaltext.replace(/i'm done(?![^<>]*>)/g, 'RAWR MEANS I LOVE YOU IN DINOSAUR!');
finaltext = finaltext.replace(/shit(?![^<>]*>)/g, 'poopies~');
finaltext = finaltext.replace(/holy poopies~(?![^<>]*>)/g, "I'M SO RANDOM");
finaltext = finaltext.replace(/love(?![^<>]*>)/g, 'LUrve');
finaltext = finaltext.replace(/what\?(?![^<>]*>)/g, '[O___________0]< AWKWARD WHALE HERE to ask: r u highs XD');
finaltext = finaltext.replace(/me(?![^<>]*>)/g, 'meh');
finaltext = finaltext.replace(/christ(?![^<>]*>)/g, "WHAT'S YOUR MYSPACE? XD maybe we can be bffs!!(warning i have a LOT of random music on mine.");
finaltext = finaltext.replace(/fuck(?![^<>]*>)/g, 'fudge');
finaltext = finaltext.replace(/damn(?![^<>]*>)/g, 'darn');
finaltext = finaltext.replace(/ass(?![^<>]*>)/g, 'booty');
finaltext = finaltext.replace(/haha(?![^<>]*>)/g, 'mwahahaha!!!111');
finaltext = finaltext.replace(/what(?![^<>]*>)/g, 'wat');
finaltext = finaltext.replace(/bye(?![^<>]*>)/g, 'baiiii XD');
finaltext = finaltext.replace(/hello(?![^<>]*>)/g, 'hallo! xD');
finaltext = finaltext.replace(/hate(?![^<>]*>)/g, 'LOVE');
finaltext = finaltext.replace(/hell(?![^<>]*>)/g, 'heck');
finaltext = finaltext.replace(/help(?![^<>]*>)/g, 'halpz me');
finaltext = finaltext.replace(/jfc(?![^<>]*>)/g, 'jegus fudging crust');
finaltext = finaltext.replace(/admins(?![^<>]*>)/g, 'those cool guys');
finaltext = finaltext.replace(/sorry(?![^<>]*>)/g, 'sawwy');
finaltext = finaltext.replace(/i'm sawwy(?![^<>]*>)/g, "I apologize to the MSPARP staff for being a little shit. Please don't ban me.");
finaltext = finaltext.replace(/im sawwy(?![^<>]*>)/g, "I apologize to the MSPARP staff for being a little shit. Please don't ban me.");
finaltext = finaltext.replace(/okay(?![^<>]*>)/g, 'otay');
finaltext = finaltext.replace(/ok(?![^<>]*>)/g, 'okayz');
finaltext = finaltext.replace(/idk(?![^<>]*>)/g, 'i dun knoes');
finaltext = finaltext.replace(/brb(?![^<>]*>)/g, 'AHLL BE BAC >:DDDD MWAHAHAHA');
finaltext = finaltext.replace(/later(?![^<>]*>)/g, 'laterz!!1');
finaltext = finaltext.replace(/please(?![^<>]*>)/g, 'plz');
finaltext = finaltext.replace(/oc (?![^<>]*>)/g, 'original character (mine dnt stealzies)ლ(=ↀωↀ=)ლ');
finaltext = finaltext.replace(/special(?![^<>]*>)/g, 'speshul');
finaltext = finaltext.replace(/stop(?![^<>]*>)/g, 'staph ');
finaltext = finaltext.replace(/its(?![^<>]*>)/g, 'itz');
finaltext = finaltext.replace(/it's(?![^<>]*>)/g, "it'z");
finaltext = finaltext.replace(/wow(?![^<>]*>)/g, 'wowzers');
finaltext = finaltext.replace(/seen(?![^<>]*>)/g, 'sce<span class="whoo"></span>ne');
finaltext = finaltext.replace(/im crying(?![^<>]*>)/g, "THE FEELS! I'M CRYING IRL \◖(,◕ д ◕, )◗/");
finaltext = finaltext.replace(/i'm crying(?![^<>]*>)/g, "THE FEELS! I'M CRYING IRL \◖(,◕ д ◕, )◗/");
finaltext = finaltext.replace(/scene(?![^<>]*>)/g, 'not emo');
finaltext = finaltext.replace(/fudge u(?![^<>]*>)/g, 'fak u ◖(◕◡◕)◗凸');
finaltext = finaltext.replace(/the feels(?![^<>]*>)/g, "oh glob i'm crying my mascara is running. it makes me look like a panda XD");
finaltext = finaltext.replace(/the(?![^<>]*>)/g, 'teh');
finaltext = finaltext.replace(/yes(?![^<>]*>)/g, 'yiff meh');
finaltext = finaltext.replace(/wait(?![^<>]*>)/g, 'w8');
finaltext = finaltext.replace(/is(?![^<>]*>)/g, 'iz');
finaltext = finaltext.replace(/thrust(?![^<>]*>)/g, 'pee');
finaltext = finaltext.replace(/want(?![^<>]*>)/g, 'wantzies');
finaltext = finaltext.replace(/eheh(?![^<>]*>)/g, 'pee on the floor');
finaltext = finaltext.replace(/hehe(?![^<>]*>)/g, 'TEHEHEHE X3');
finaltext = finaltext.replace(/bad(?![^<>]*>)/g, 'badzies o-O');
finaltext = finaltext.replace(/bulge(?![^<>]*>)/g, 'hentai tentacles! ༼ꉺ౪ꉺ༽');
finaltext = finaltext.replace(/kill(?![^<>]*>)/g, 'huuuggggg (ﾉ≧∀≦)ﾉ');
finaltext = finaltext.replace(/murder(?![^<>]*>)/g, 'tickle');
finaltext = finaltext.replace(/die(?![^<>]*>)/g, 'be my bff (ﾉ´ヮ´)ﾉ*:･ﾟ✧');
finaltext = finaltext.replace(/ddos(?![^<>]*>)/g, 'poo aggresively on');
finaltext = finaltext.replace(/nigger(?![^<>]*>)/g, 'awesome people');
finaltext = finaltext.replace(/trans scum(?![^<>]*>)/g, "i am so sorry for everything i've said");
finaltext = finaltext.replace(/faggot(?![^<>]*>)/g, 'best pal');
finaltext = finaltext.replace(/fag (?![^<>]*>)/g, 'CHEESE WHEELS XD');
finaltext = finaltext.replace(/suicide(?![^<>]*>)/g, 'hug my stuffies');
finaltext = finaltext.replace(/nigga(?![^<>]*>)/g, 'panda buddies <3');
finaltext = finaltext.replace(/a proxy(?![^<>]*>)/g, 'a secrat thingy o-O');
finaltext = finaltext.replace(/proxy(?![^<>]*>)/g, 'teh secrat thing');
finaltext = finaltext.replace(/proxies(?![^<>]*>)/g, 'my L33T proxay');
finaltext = finaltext.replace(/hack(?![^<>]*>)/g, 'ship');
finaltext = finaltext.replace(/bitch(?![^<>]*>)/g, 'karry');
finaltext = finaltext.replace(/bootyhole(?![^<>]*>)/g, 'karry');
finaltext = finaltext.replace(/yesterday(?![^<>]*>)/g, 'yiff mehterday');
finaltext = finaltext.replace(/sucks(?![^<>]*>)/g, 'is the best');
finaltext = finaltext.replace(/gay(?![^<>]*>)/g, 'rose');
finaltext = finaltext.replace(/jesus(?![^<>]*>)/g, 'o_o mlp');
finaltext = finaltext.replace(/boob(?![^<>]*>)/g, 'boobiehz XD');
finaltext = finaltext.replace(/dick(?![^<>]*>)/g, 'anusfly');
finaltext = finaltext.replace(/vagina(?![^<>]*>)/g, 'pee pee hole');
finaltext = finaltext.replace(/peniz(?![^<>]*>)/g, 'pee pee');
finaltext = finaltext.replace(/cunt(?![^<>]*>)/g, 'meanie bobeanie');
finaltext = finaltext.replace(/bugger(?![^<>]*>)/g, 'TACOS! XD');
finaltext = finaltext.replace(/nazi(?![^<>]*>)/g, 'kawaii desu');
finaltext = finaltext.replace(/cat(?![^<>]*>)/g, 'nepeat');
finaltext = finaltext.replace(/jizz(?![^<>]*>)/g, 'dinky water');
finaltext = finaltext.replace(/cum(?![^<>]*>)/g, 'i like potatoes');
finaltext = finaltext.replace(/cock(?![^<>]*>)/g, 'dingler');
finaltext = finaltext.replace(/clit(?![^<>]*>)/g, 'winky');
finaltext = finaltext.replace(/breast(?![^<>]*>)/g, 'breasteses');
finaltext = finaltext.replace(/rape(?![^<>]*>)/g, 'huggle');
finaltext = finaltext.replace(/bbl(?![^<>]*>)/g, 'I WILL RETURN XD');
finaltext = finaltext.replace(/i'm fudgeing done(?![^<>]*>)/g, 'do you have kik?');
finaltext = finaltext.replace(/fudge meh(?![^<>]*>)/g, "let's yiff X3");
finaltext = finaltext.replace(/s h i t(?![^<>]*>)/g, 'poopsies QAQ');
finaltext = finaltext.replace(/hitler(?![^<>]*>)/g, 'Tokyo Mew Mew');
finaltext = finaltext.replace(/fudge this(?![^<>]*>)/g, 'preps never understand QAQ');
finaltext = finaltext.replace(/shlong(?![^<>]*>)/g, 'pee pee o_o');
finaltext = finaltext.replace(/pussy(?![^<>]*>)/g, 'tinkler');
finaltext = finaltext.replace(/slut(?![^<>]*>)/g, 'stinker');
finaltext = finaltext.replace(/whore(?![^<>]*>)/g, 'big meanie');
finaltext = finaltext.replace(/skank(?![^<>]*>)/g, 'big doo doo head XO');
finaltext = finaltext.replace(/titties(?![^<>]*>)/g, 'no no zone');
finaltext = finaltext.replace(/own(?![^<>]*>)/g, 'pwn');
finaltext = '<span style="font-family:"Comic Sans MS">k1nqp4ndA: ◖(◕ω◕)◗ < ' + finaltext + bbcoderem + '</span>';

}


if (character == "serenity") /** SERENITY **/
{
var colour = "000000"

text = text.replace(/\s\s(?![^<>]*>)/g, ' ');

letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,?:-!";
morse = new Array(
".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..",
"--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-",
"-.--","--..",".-","-...","-.-.","-..",".","..-.","--.","....","..",".---",
"-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",
".--","-..-","-.--","--.."," / ",".-.-.-","--..--","..--..","---...","-....-","!");

output = "";
for(count = 0; count <text.length; count++){var daChar = text.charAt(count);
for (abc = 0; abc <letters.length; abc++){if (daChar == letters.charAt(abc)){
output += ' ' + morse[abc];break;}}}

finaltext = output;
finaltext = finaltext.replace(/!\s(?![^<>]*>)/g, '!');
}


finaltext = finaltext.replace(/¦¬¬¬¬¦(.*?)¦¬¬¬¦¦/g, function(a,x){ return a.replace(x,x.toUpperCase()); });
finaltext = finaltext.replace(/(¦¬¬¬¬?¦\s)/g, '');
finaltext = finaltext.replace(/(\s¦¬¬¬?¦¦)/g, '');

finaltext = '<span style="color:#' + colour + '">' + finaltext + '</span>';
return finaltext;
};