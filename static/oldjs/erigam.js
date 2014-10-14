var quotes = [
    'Oh god how did this get here I am not good with computer D:',
    'HELP! I HAVE A SNOWGLOBE IN MY BUTT!',
    'Eww purple.',
    'Purple is my favorite color OwO',
    'How do rp',
    'Instructions weren\'t clear enough I got my dick caught in a ceiling fan',
    'Instructions were perfectly clear I still got my dick caught in a ceiling fan',
    'Dang! It didn\'t work!',
    'What the hell?',
    'Gee I hope the site works today.',
    'brb going to fuck a cabbage',
    'help i have a karry stuck in my anus',
    '#blamekarry',
];

charaSaving = [
    ['Homestuck','Trickster','??','FFAC9F','','normal'],
    ['Homestuck','Doc Scratch','','FFFFFF','','normal'],
    ['Homestuck','uranianUmbra','UU','929292','','lower',['u','U']],
    ['Homestuck','undyingUmbrage','uu','323232','','upper',['U','u']],
    ['Homestuck','ectoBiologist','EB','0715CD','','normal'],
    ['Homestuck','tentacleTherapist','TT','B536DA','','normal'],
    ['Homestuck','turntechGodhead','TG','E00707','','normal'],
    ['Homestuck','gardenGnostic','GG','4AC925','','normal'],
    ['Homestuck','gutsyGumshoe','GG','00D5F2','','normal'],
    ['Homestuck','tipsyGnostalgic','TG','FF6FF2','','normal'],
    ['Homestuck','timaeusTestified','TT','F2A400','','normal'],
    ['Homestuck','golgothasTerror','GT','1F9400','','normal'],
    ['Homestuck','apocalypseArisen','AA','A10000','','lower',['o','0']],
    ['Homestuck','adiosToreador','AT','A15000','','inverted',['.',',']],
    ['Homestuck','twinArmageddons','TA','A1A100','','normal',['I','II','i','ii','S','2','s','2']],
    ['Homestuck','carcinoGeneticist','CG','626262','','upper'],
    ['Homestuck','arsenicCatnip','AC','416600',':33 <','lower',['ee','33']],
    ['Homestuck','grimAuxiliatrix','GA','008141','','title'],
    ['Homestuck','gallowsCalibrator','GC','008282','','upper',['A','4','E','3','I','1']],
    ['Homestuck','arachnidsGrip','AG','005682','','normal',['B','8','b','8']],
    ['Homestuck','centaursTesticle','CT','000056','D -->','normal',['X','%','x','%','loo','100','ool','001']],
    ['Homestuck','terminallyCapricious','TC','2B0057','','alternating'],
    ['Homestuck','caligulasAquarium','CA','6A006A','','normal',['V','VV','v','vv','W','WW','w','ww']],
    ['Homestuck','cuttlefishCuller','CC','77003C','','normal',['E','-E','H',')(','h',')(']],
    ['Homestuck','Damara','DAMARA','A10000','','upper'],
    ['Homestuck','Rufioh','RUFIOH','A15000','','lower',['i','1']],
    ['Homestuck','Mituna','MITUNA','A1A100','','upper',['A','4','B','8','E','3','I','1','O','0','S','5','T','7']],
    ['Homestuck','Kankri','KANKRI','FF0000','','normal',['B','6','b','6','O','9','o','9']],
    ['Homestuck','Meulin','MEULIN','416600','(=｀ω´=) <','upper',['EE','33']],
    ['Homestuck','Porrim','PORRIM','008141','','normal',['o','o+']],
    ['Homestuck','Latula','LATULA','008282','','normal',['A','4','a','4','E','3','e','3','I','1','i','1']],
    ['Homestuck','Aranea','ARANEA','005682','','normal',['B','8','b','8']],
    ['Homestuck','Horuss','HORUSS','000056','8=D <','normal',['X','%','x','%','loo','100','ool','001']],
    ['Homestuck','Kurloz','KURLOZ','2B0057','','upper'],
    ['Homestuck','Cronus','CRONUS','6A006A','','lower',['B','8','v','?','w','wv','?','vw']],
    ['Homestuck','Meenah','MEENAH','77003C','','normal',['E','-E','H',')(']],
    ['Homestuck','Dad','pipefan413','4B4B4B','','upper'],
    ['Homestuck','Nanna','NANNA','000000','','normal'],
    ['Homestuck','Mom','MOM','000000','','normal'],
    ['Homestuck','Bro','BRO','000000','','normal'],
    ['Homestuck','Grandpa','GRANDPA','000000','','normal'],
    ['Homestuck','Poppop','POPPOP','000000','','normal'],
    ['Homestuck','Mom','MOM','000000','','normal'],
    ['Homestuck','Bro','BRO','000000','','normal'],
    ['Homestuck','Grandma','GRANDMA','000000','','normal'],
    ['Homestuck','Nannasprite','NANNASPRITE','00D5F2','','normal'],
    ['Homestuck','Jaspersprite','JASPERSPRITE','F141EF','','normal'],
    ['Homestuck','Calsprite','CALSPRITE','F2A400','','upper',['A','<','B','>','C','?','D','<','E','>','F','?','G','<','H','>','I','?','J','<','K','>','L','?','M','<','N','>','O','?','P','<','Q','>','R','?','S','<','T','>','U','?','V','<','W','>','X','?','Y','<','Z','>','<','HAA ','>','HEE ','?','HOO ']],
    ['Homestuck','Davesprite','DAVESPRITE','F2A400','','lower'],
    ['Homestuck','Jadesprite','JADESPRITE','1F9400','','normal'],
    ['Homestuck','Tavrisprite','TAVRISPRITE','0715CD','','normal'],
    ['Homestuck','Fefetasprite','FEFETASPRITE','B536DA','3833 <','normal',['E','-E','ee','33','H',')(','h',')(']],
    ['Homestuck','Erisolsprite','ERISOLSPRITE','4AC925','','normal',['I','II','i','ii','S','2','s','2','V','VV','v','vv','W','WW','w','ww']],
    ['Homestuck','The Handmaid','♈','A10000','','normal'],
    ['Homestuck','The Summoner','♉','A15000','','normal'],
    ['Homestuck','The Ψiioniic','♊','A1A100','','normal'],
    ['Homestuck','The Signless','♋','626262','','normal'],
    ['Homestuck','The Disciple','♌','416600','','normal'],
    ['Homestuck','The Dolorosa','♍','008141','','normal'],
    ['Homestuck','Neophyte Redglare','♎','008282','','normal'],
    ['Homestuck','Marquise Spinneret Mindfang','♏','005682','','normal'],
    ['Homestuck','E%ecutor Darkleer','♐','000056','','normal'],
    ['Homestuck','The Grand Highblood','♑','2B0057','','normal'],
    ['Homestuck','Orphaner Dualscar','♒','6A006A','','normal'],
    ['Homestuck','Her Imperious Condescension','♓','77003C','','normal'],
    ['Homestuck','Spades Slick','♠','000000','','normal'],
    ['Homestuck','Clubs Deuce','♣','000000','','normal'],
    ['Homestuck','Diamonds Droog','♦','000000','','normal'],
    ['Homestuck','Hearts Boxcars','♥','000000','','normal'],
    
    ['Attack_On_Titan','Mikasa Ackerman','Mikasa','738076','','normal'],
    ['Attack_On_Titan','Armin Arlert','Armin','18A6AB','','normal'],
    ['Attack_On_Titan','Eren Jeager','Eren','0B8F1B','','normal'],
    ['Attack_On_Titan','Reiner Braun','Reiner','C7B002','','normal'],
    ['Attack_On_Titan','Nile Dawk','Nile','828282','','normal'],
    ['Attack_On_Titan','Marlo','Marlo','525252','','normal'],
    ['Attack_On_Titan','Hitch','Hitch','636363','','normal'],
    ['Attack_On_Titan','Boris Feulner','Boris','8a8a8a','','normal'],
    ['Attack_On_Titan','Erwin Smith','Erwin','67a5ab','','normal'],
    ['Attack_On_Titan','Zoë Hange','Zoë','471a00','','normal'],
    ['Attack_On_Titan','Mike Zacharias','Mike','618783','','normal'],
    ['Attack_On_Titan','Braun','Braun','636322','','normal'],
    ['Attack_On_Titan','Ilse Langnar','Ilse','adadad','','normal'],
    ['Attack_On_Titan','Dita Ness','Dita','522405','','normal'],
    
    
    ['Dangan_Ronpa','Makoto Naegi','Naegi','BA9686','','normal'],
];

function cmobile() {
    if (navigator.userAgent.indexOf('Android')!=-1 || navigator.userAgent.indexOf('iPhone')!=-1 || navigator.userAgent.indexOf('Nintendo 3DS')!=-1 || navigator.userAgent.indexOf('Nintendo DSi')!=-1 || window.innerWidth<=500) {
        return true;
    } else {
        return false;
    }
}

$(document).ready(function() {

    if (cmobile()) {
        $(document.body).addClass('mobile');
    }
    $(window).resize(function() {
        if (cmobile()){
            $(document.body).addClass('mobile');
        } else {
            $(document.body).removeClass('mobile');
        }
    });


    var quote = quotes[Math.floor(Math.random()*quotes.length)];
    $('#quote').html(quote);

    function isiPhone(){
        return (
            (navigator.platform.indexOf("iPhone") != -1) ||
            (navigator.platform.indexOf("iPod") != -1)
        );
    }
    if(isiPhone()) {
        $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />');
    }

    pren = $('input[name=quirk_prefix]').val();

    casen = $('#casing option:selected').val()

    qn = $('input[name=quirk_from]').val();
    qnt = $('input[name=quirk_to]').val();

    if (!pren&&casen=="normal"&&!qn&&!qnt) {
        $('#typing-quirks').hide();
    }

    $('.typetog').click(function() {
        $('#typing-quirks').slideToggle();
        $('#typing-quirks2').slideToggle();
    });

    //Character Saving and Database
    charaSav = charaSaving;
    passwordC = 'limelight';
    $.each(charaSav, function(i) {
        charInfo = charaSav[i];
        fandom = charInfo.splice(0,1);

        if($("#"+fandom+"_Fandom").length == 0) {
          $('.character_database').append('<div class="fandom" id="'+fandom+'_Fandom"><h2>'+fandom+'</h2></div>');
        }
        cInfoSav = 'a'+i;
        $("#"+fandom+"_Fandom").append('<div class="Cselection" id="'+cInfoSav+'"></div><br />');
        $.each(charInfo, function(o) {
            eInfo = charInfo[o];
            if (o == 0) {
                $('#'+cInfoSav).append('Username: <span class="Susername">'+eInfo+'</span><br />');
            } else if (o == 1) {
                if (eInfo) {
                    $('#'+cInfoSav).append('Alias: <span class="Salias">'+eInfo+'</span><br />');
                }
            } else if (o == 2) {
                $('#'+cInfoSav).append('Color: #<span class="Scolor">'+eInfo+'</span><br />');
            } else if (o == 3) {
                if (eInfo) {
                    $('#'+cInfoSav).append('Prefix: <span class="Sprefix">'+eInfo+'</span><br />');
                }
            } else if (o == 4) {
                $('#'+cInfoSav).append('Type Case: <span class="Stypecase">'+eInfo+'</span><br />');
            } else if (o == 5) {
                $('#'+cInfoSav).append('Replacements: ');
                $('#'+cInfoSav).append('<span class="Sreplacements"></span>');
                rInfo = eInfo;
                cR=0;
                $.each(rInfo, function(c) {
                    rInfio = rInfo[c];
                    cE=c%2;
                    if (cE == 0) {
                        $('#'+cInfoSav).append(rInfio+' to ');
                        cR++;
                    } else if (cR == rInfo.length-1) {
                        $('#'+cInfoSav).append(rInfio);
                        $('#'+cInfoSav).append('<br />');
                    } else {
                        $('#'+cInfoSav).append(rInfio+', ');
                        cR++;
                    }
                    $('#'+cInfoSav+' .Sreplacements').append('<span>'+rInfio+'</span>');
                });
            }
        });
        $('#'+cInfoSav).append('<a href="javascript:void(0)" id="'+cInfoSav+'a" class="add">[be]</span>');
        if($("."+fandom+"_Drop").length == 0) {
          $('#datadrop').append('<optgroup label="'+fandom+'" class="'+fandom+'_Drop"></optgroup>');
        }
        datadrop = '['+charInfo[1]+'] '+charInfo[0];
        $("."+fandom+"_Drop").append('<option value="'+cInfoSav+'">'+datadrop+'</option>');
    });
    if (cmobile()) {
        $(".fann").width('100%');
    } else {
        var fan1 = "";
        var fan2 = "";
        var fan3 = "";

        $('.fandom:nth-child(3n+1)').each(function() {
            fan1 = fan1+$(this).html();
        });

        $('.fandom:nth-child(3n+2)').each(function() {
            fan2 = fan2+$(this).html();
        });
        
        $('.fandom:nth-child(3n+0)').each(function() {
            fan3 = fan3+$(this).html();
        });
    
        $('.character_database').html('').append('<div class="fan1 fann">'+fan1+'</div>').append('<div class="fan2 fann">'+fan2+'</div>').append('<div class="fan3 fann">'+fan3+'</div>');
    }

    //Character Display
    if (Modernizr.localstorage) {
        $('#chardrop').show();
        function chararefresh() {
            if (localStorage.saveChar !== "") {
                localStorage.setItem('saveChar',localStorage.saveChar);
                localStorage.saveChar == "";
            }

            if (localStorage.getItem('saveChar') == 'undefined' || localStorage.getItem('saveChar') === null) {
                localStorage.setItem('saveChar',JSON.stringify([['anonymous','??','000000','','normal']]));
            }

            $('.saved_characters').html('');
            charaSav = JSON.parse(localStorage.getItem('saveChar'));
            defCharSav = charaSav;
            $.each(charaSav, function(i) {
                charInfo = charaSav[i];
                cInfoSav = 'c'+i;
                $('.saved_characters').append('<div class="Cselection" id="'+cInfoSav+'"></div><br />');
                ii = i+1;
                $('#'+cInfoSav).append('<span class="nummy">'+ii+'.</span><br />');
                $.each(charInfo, function(o) {
                    eInfo = charInfo[o];
                    if (o == 0) {
                        $('#'+cInfoSav).append('Username: <span class="Susername">'+eInfo+'</span><br />');
                    } else if (o == 1) {
                        if (eInfo) {
                            $('#'+cInfoSav).append('Alias: <span class="Salias">'+eInfo+'</span><br />');
                        }    
                    } else if (o == 2) {
                        $('#'+cInfoSav).append('Color: #<span class="Scolor">'+eInfo+'</span><br />');
                    } else if (o == 3) {
                        if (eInfo) {
                            $('#'+cInfoSav).append('Prefix: <span class="Sprefix">'+eInfo+'</span><br />');
                        }
                    } else if (o == 4) {
                        $('#'+cInfoSav).append('Type Case: <span class="Stypecase">'+eInfo+'</span><br />');
                    } else if (o == 5) {
                        $('#'+cInfoSav).append('Replacements: ');
                        rInfo = eInfo;
                        cR=0;
                        $.each(rInfo, function(c) {
                            rInfio = rInfo[c];
                            cE=c%2;
                            if (cE == 0) {
                                $('#'+cInfoSav).append(rInfio+' to ');
                                cR++;
                            } else if (cR == rInfo.length-1) {
                                $('#'+cInfoSav).append(rInfio);
                                $('#'+cInfoSav).append('<br />');
                            } else {
                                $('#'+cInfoSav).append(rInfio+', ');
                                cR++;
                            }
                        });
                    }
                });
                $('#'+cInfoSav).append('<span class="ccaode">Character&nbsp;Code:&nbsp;<span class="Scode">'+JSON.stringify(charInfo)+'</span></span><br />');
                $('#'+cInfoSav).append('<a href="javascript:void(0)" id="'+cInfoSav+'c" class="add">[be]</span>');
                $('#'+cInfoSav).append('<a href="javascript:void(0)" id="'+cInfoSav+'cd" class="delc">[delete]</span>');
                dropshow = '['+charInfo[1]+'] '+charInfo[0];
                $('#chardrop').append('<option value="'+cInfoSav+'">'+dropshow+'</option>');
            });
        }

        $('#savca').click(function() {
            charaSav = JSON.parse(localStorage.getItem('saveChar'));
            username = $('#usingname').val();
            alias = $('#ailin').val();
            acolor = $('#coln').val();
            prefix = $('#prei').val();
            casetype = $('#casing').val();
            aReplacements = new Array();

            iL = 0;
            $('#replacementList input').each(function(i){
                renk = $(this).val();
                rE = i%2;
                if (rE == 0 && !renk) {
                    iL = 1;
                } else if (rE == 1 && iL == 1) {
                    iL = 0;
                } else {
                    aReplacements.push(renk);
                }
            });

            if (typeof aReplacements !== 'undefined' && aReplacements.length > 0) {
                charan = [username,alias,acolor,prefix,casetype,aReplacements];
            } else {
                charan = [username,alias,acolor,prefix,casetype];
            }
            charaSav.unshift(charan);
            localStorage.setItem('saveChar', JSON.stringify(charaSav));
            location.reload();
        });

        $('#savci').click(function() {
            chariSav = JSON.parse(localStorage.getItem('saveChar'));
            testCode = $('#decryptChar').val();
            charin = JSON.parse(testCode);
            if (charin instanceof Array || $.isArray(charin)) {
                if (testCode) {
                    if (charin.length == 5) {
                        chariSav.unshift(charin);
                        localStorage.setItem('saveChar', JSON.stringify(chariSav));
                        alert('Your character has been saved!');
                        location.reload();
                    } else if (charin.length == 6) {
                        //TODO: Check if Replacements are divisible by 2.
                        if (charin[5] instanceof Array && charin[5].length%2 == 0) {
                            chariSav.unshift(charin);
                            localStorage.setItem('saveChar', JSON.stringify(chariSav));
                            alert('Your character has been saved!');
                            location.reload();
                        } else {
                            alert('That is not a valid code!');
                        }
                    } else {
                        alert('That is not a valid code!');
                    }
                } else {
                    alert('That is not a valid code!');
                }
            } else {
                alert('That is not a valid code!');
            }
        });

        function charDrop() {
            lara = defCharSav;
            usernamea = $('#usingname').val();
            aliasa = $('#ailin').val();
            acolora = $('#coln').val();
            prefixa = $('#prei').val();
            casetypea = $('#casing').val();
            eplacements = new Array();

            iL = 0;
            $('#replacementList input').each(function(i){
                renk = $(this).val();
                rE = i%2;
                if (rE == 0 && !renk) {
                    iL = 1;
                } else if (rE == 1 && iL == 1) {
                    iL = 0;
                } else {
                    eplacements.push(renk);
                }
            });

            if (typeof eplacements !== 'undefined' && eplacements.length > 0) {
                charak = [usernamea,aliasa,acolora,prefixa,casetypea,eplacements];
            } else {
                charak = [usernamea,aliasa,acolora,prefixa,casetypea];
            }
    
            ch1 = charak.join(',');
            var ch2;

            $.each(lara, function(i) {
                ch2 = lara[i].join(',');
                if(ch1 == ch2) {
                    $('#chardrop').val('c'+i);
                    return
                }
            });
        }

        function dataDrop() {
            lara = charaSaving;
            usernamea = $('#usingname').val();
            aliasa = $('#ailin').val();
            acolora = $('#coln').val();
            prefixa = $('#prei').val();
            casetypea = $('#casing').val();
            eplacements = new Array();

            iL = 0;
            $('#replacementList input').each(function(i){
                renk = $(this).val();
                rE = i%2;
                if (rE == 0 && !renk) {
                    iL = 1;
                } else if (rE == 1 && iL == 1) {
                    iL = 0;
                } else {
                    eplacements.push(renk);
                }
            });

            if (typeof eplacements !== 'undefined' && eplacements.length > 0) {
                charak = [usernamea,aliasa,acolora,prefixa,casetypea,eplacements];
            } else {
                charak = [usernamea,aliasa,acolora,prefixa,casetypea];
            }
    
            ch1 = charak.join(',');
            var ch2;

            $.each(lara, function(i) {
                ch2 = lara[i].join(',');
                if(ch1 == ch2) {
                    $('#datadrop').val('a'+i);
                    return
                }
            });
        }

        chararefresh();
        charDrop();

    } else {
        $('.saved_characters').hide();
        $('#saved_characters').hide();
    }

    dataDrop();

    $('.add').click(function(){
        become($(this).attr('id').substring(0, $(this).attr('id').length - 1));
    });

    $('.delc').click(function(){
        charre = JSON.parse(localStorage.getItem('saveChar'));
        delc = $(this).attr('id').substr(1,1);
        temp = charre.splice(delc,1);
        localStorage.setItem('saveChar',JSON.stringify(charre));
        location.reload();
    });

    $('#chardrop').change(function(){
        become($(this).val());
    });

    $('#datadrop').change(function(){
        become($(this).val());
    });

    function become(ide) {
        if (ide.substr(0,1) == 'c')
        {
            charra = defCharSav;
            $('#datadrop').val('');
            $('#chardrop').val('c'+ide.substr(1));
        }
        if (ide.substr(0,1) == 'a')
        {
            charra = charaSaving;
            $('#chardrop').val('');
            $('#datadrop').val('a'+ide.substr(1));
        }

        chrend = charra[ide.substr(1)];

        Sus = chrend[0];
        Sal = chrend[1];
        Sco = chrend[2];
        Spr = chrend[3];
        Sty = chrend[4];
        if (!chrend[5]) {
            Sre = ['',''];
        } else {
            Sre = chrend[5];
        }

        $('#usingname').val(Sus);
        $('#ailin').val(Sal);
        $('#coln').val(Sco);
        $('#prei').val(Spr);
        $('#casing').val(Sty);

        $('#replacementList').empty();

        var ff;
        var tt;

        $.each(Sre, function(i) {
            repla = Sre[i];
            var aE = i%2;
            if (aE == 0) {
                ff = repla;
            } else if (aE == 1) {
                tt = repla;
                addReplacement(null,ff,tt);
            }
        });

        $('#color-preview').css('color', '#'+Sco);
        $('#color-preview #acronym').text(Sal+(Sal.length>0?': ':''));

        $('.menuopt').removeClass('sel');
        $('#main').addClass('sel');
        $('.opting').removeClass('sopting');
        $('.main').addClass('sopting');
  
        pren = $('input[name=quirk_prefix]').val();

        casen = $('#casing option:selected').val()

        qn = $('input[name=quirk_from]').val();
        qnt = $('input[name=quirk_to]').val();
    
        if (!pren&&casen=="normal"&&!qn&&!qnt) {
            $('#typing-quirks').hide();
        } else {
            $('#typing-quirks').show();
        }
    }
});
